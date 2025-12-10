"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * 共享狀態管理 Hook
 * 使用 localStorage 來同步所有用戶的狀態
 * 未來可以升級為後端 API
 */
export function useSharedState<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // 從 localStorage 讀取初始值
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // 更新狀態並同步到 localStorage
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          // 觸發自定義事件，通知其他標籤頁/組件
          window.dispatchEvent(new Event(`storage-${key}`));
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // 監聽 localStorage 變化（跨標籤頁同步）
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorageChange = (e: StorageEvent | Event) => {
      if (e instanceof StorageEvent && e.key !== key) return;
      
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          setStoredValue(JSON.parse(item));
        }
      } catch (error) {
        console.error(`Error reading localStorage key "${key}":`, error);
      }
    };

    // 監聽 storage 事件（跨標籤頁）
    window.addEventListener("storage", handleStorageChange);
    // 監聽自定義事件（同標籤頁內）
    window.addEventListener(`storage-${key}`, handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(`storage-${key}`, handleStorageChange);
    };
  }, [key]);

  return [storedValue, setValue];
}

