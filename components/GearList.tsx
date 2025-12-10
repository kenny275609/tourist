"use client";

import { useState, useEffect } from "react";
import { Pencil, Trash2, Plus, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useGearItems, type GearItem } from "@/hooks/useGearItems";

export default function GearList() {
  const { user } = useAuth();
  const {
    items: gear,
    loading,
    addItem,
    updateItem,
    deleteItem,
    initializeFromTemplates,
  } = useGearItems(user?.id || null);

  // 從模板初始化物品（只在第一次載入且清單為空時）
  const [hasInitialized, setHasInitialized] = useState(false);
  
  useEffect(() => {
    // 只在完全載入完成、清單為空、有用戶、且還沒初始化過時執行
    if (!loading && gear.length === 0 && user && !hasInitialized) {
      setHasInitialized(true);
      // 使用 setTimeout 確保在數據載入完成後才初始化
      const timer = setTimeout(() => {
        initializeFromTemplates();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, gear.length, user, hasInitialized]); // 移除 initializeFromTemplates 從依賴項
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState<"clothing" | "gear">("gear");

  const handleToggle = async (id: string) => {
    const item = gear.find((item) => item.id === id);
    if (item) {
      try {
        await updateItem(id, { checked: !item.checked });
      } catch (error) {
        console.error("無法更新物品狀態:", error);
        alert("無法更新物品狀態，請稍後再試");
      }
    }
  };

  const handleEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditValue(currentName);
  };

  const handleSave = async (id: string) => {
    if (editValue.trim()) {
      try {
        await updateItem(id, { name: editValue.trim() });
        setEditingId(null);
        setEditValue("");
      } catch (error) {
        console.error("無法更新物品名稱:", error);
        alert("無法更新物品名稱，請稍後再試");
      }
    } else {
      setEditingId(null);
      setEditValue("");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("確定要刪除這個物品嗎？")) {
      try {
        await deleteItem(id);
      } catch (error) {
        console.error("無法刪除物品:", error);
        alert("無法刪除物品，請稍後再試");
      }
    }
  };

  const handleAdd = async () => {
    if (newItemName.trim()) {
      try {
        await addItem({
          name: newItemName.trim(),
          category: newItemCategory,
          checked: false,
        });
        setNewItemName("");
        setShowAddForm(false);
      } catch (error) {
        console.error("無法新增物品:", error);
        alert("無法新增物品，請稍後再試");
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-[#5a6c7d]">
        載入中...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8 text-[#5a6c7d]">
        請先登入以查看您的裝備清單
      </div>
    );
  }

  const clothingItems = gear.filter((item) => item.category === "clothing");
  const gearItems = gear.filter((item) => item.category === "gear");

  return (
    <div className="space-y-8">
      {/* Category A: Clothing */}
      <div className="sketch-box p-6 bg-white">
        <h3 className="text-2xl font-bold mb-4 text-[#34495e] transform -rotate-1">
          類別 A：衣物（分層系統）
        </h3>
        <div className="space-y-3">
          {clothingItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 bg-[#f8f9fa] border-2 border-[#2c3e50]"
              style={{
                borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
                transform: 'rotate(-0.5deg)',
              }}
            >
              <button
                onClick={() => handleToggle(item.id)}
                className="flex-shrink-0 w-6 h-6 border-3 border-[#3498db] flex items-center justify-center transition-colors hover:bg-[#3498db]/10"
                style={{
                  borderRadius: '50%',
                  transform: 'rotate(2deg)',
                }}
              >
                {item.checked && (
                  <Check className="w-4 h-4 text-[#3498db]" />
                )}
              </button>
              {editingId === item.id ? (
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => handleSave(item.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave(item.id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className="flex-1 px-2 py-1 border-2 border-[#3498db] rounded focus:outline-none"
                  autoFocus
                />
              ) : (
                <>
                  <span
                    className={`flex-1 text-lg ${
                      item.checked ? "line-through text-gray-400" : "text-[#2c3e50]"
                    }`}
                  >
                    {item.name}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(item.id, item.name)}
                      className="sketch-button p-1.5 hover:bg-[#ecf0f1] rounded transition-colors"
                      title="編輯"
                    >
                      <Pencil className="w-4 h-4 sketch-icon text-[#3498db]" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="sketch-button p-1.5 hover:bg-[#ecf0f1] rounded transition-colors"
                      title="刪除"
                    >
                      <Trash2 className="w-4 h-4 sketch-icon text-[#e74c3c]" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Category B: Essential Gear */}
      <div className="sketch-box p-6 bg-white">
        <h3 className="text-2xl font-bold mb-4 text-[#34495e] transform rotate-1">
          類別 B：必備裝備
        </h3>
        <div className="space-y-3">
          {gearItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 bg-[#f8f9fa] border-2 border-[#2c3e50]"
              style={{
                borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
                transform: 'rotate(-0.5deg)',
              }}
            >
              <button
                onClick={() => handleToggle(item.id)}
                className="flex-shrink-0 w-6 h-6 border-3 border-[#3498db] flex items-center justify-center transition-colors hover:bg-[#3498db]/10"
                style={{
                  borderRadius: '50%',
                  transform: 'rotate(2deg)',
                }}
              >
                {item.checked && (
                  <Check className="w-4 h-4 text-[#3498db]" />
                )}
              </button>
              {editingId === item.id ? (
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => handleSave(item.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave(item.id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className="flex-1 px-2 py-1 border-2 border-[#3498db] rounded focus:outline-none"
                  autoFocus
                />
              ) : (
                <>
                  <span
                    className={`flex-1 text-lg ${
                      item.checked ? "line-through text-gray-400" : "text-[#2c3e50]"
                    }`}
                  >
                    {item.name}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(item.id, item.name)}
                      className="sketch-button p-1.5 hover:bg-[#ecf0f1] rounded transition-colors"
                      title="編輯"
                    >
                      <Pencil className="w-4 h-4 sketch-icon text-[#3498db]" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="sketch-button p-1.5 hover:bg-[#ecf0f1] rounded transition-colors"
                      title="刪除"
                    >
                      <Trash2 className="w-4 h-4 sketch-icon text-[#e74c3c]" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add New Item */}
      {showAddForm ? (
        <div className="sketch-box p-6 bg-white">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="輸入物品名稱（例如：相機）"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="w-full px-4 py-2 border-2 border-[#3498db] rounded focus:outline-none"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => setNewItemCategory("clothing")}
                className={`px-4 py-2 rounded ${
                  newItemCategory === "clothing"
                    ? "bg-[#3498db] text-white"
                    : "bg-[#ecf0f1] text-[#2c3e50]"
                }`}
              >
                衣物
              </button>
              <button
                onClick={() => setNewItemCategory("gear")}
                className={`px-4 py-2 rounded ${
                  newItemCategory === "gear"
                    ? "bg-[#3498db] text-white"
                    : "bg-[#ecf0f1] text-[#2c3e50]"
                }`}
              >
                裝備
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="washi-tape-button flex-1 px-4 py-2 bg-[#27ae60] text-white hover:bg-[#229954] transition-colors font-semibold"
              >
                新增
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewItemName("");
                }}
                className="washi-tape-button px-4 py-2 bg-[#95a5a6] text-white hover:bg-[#7f8c8d] transition-colors font-semibold"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="sketch-box w-full p-6 flex flex-col items-center justify-center gap-2 hover:bg-white transition-colors"
        >
          <Plus className="w-8 h-8 text-[#3498db] sketch-icon" />
          <span className="text-lg text-[#2c3e50]">
            新增物品（例如：相機）
          </span>
        </button>
      )}
    </div>
  );
}

