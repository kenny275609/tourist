"use client";

import { useState, useEffect } from "react";
import { Pencil, Trash2, Plus, Lock } from "lucide-react";
import { useSharedItinerary, type Checkpoint } from "@/hooks/useSharedItinerary";
import { useAuth } from "@/hooks/useAuth";

export default function ItineraryTimeline() {
  const { user } = useAuth();
  const { checkpoints, updateItinerary, loading, isAdmin } = useSharedItinerary();
  
  const handleSetCheckpoints = async (newCheckpoints: Checkpoint[]) => {
    await updateItinerary(newCheckpoints);
  };
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditValue(currentName);
  };

  const handleSave = async (id: string) => {
    const newCheckpoints = checkpoints.map((cp) =>
      cp.id === id ? { ...cp, name: editValue } : cp
    );
    await handleSetCheckpoints(newCheckpoints);
    setEditingId(null);
    setEditValue("");
  };

  const handleDelete = async (id: string) => {
    const newCheckpoints = checkpoints.filter((cp) => cp.id !== id);
    await handleSetCheckpoints(newCheckpoints);
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
        請先登入以查看行程
      </div>
    );
  }

  const days = [1, 2, 3];
  const getCheckpointsForDay = (day: number) =>
    checkpoints.filter((cp) => cp.day === day);

  const handleAddCheckpoint = async (day: number) => {
    const newId = Date.now().toString();
    const newCheckpoint: Checkpoint = {
      id: newId,
      name: "新檢查點",
      day: day,
    };
    const newCheckpoints = [...checkpoints, newCheckpoint];
    await handleSetCheckpoints(newCheckpoints);
  };

  return (
    <div className="space-y-8">
      {/* 管理員提示 */}
      {isAdmin && (
        <div className="sketch-box p-4 bg-blue-50 border-2 border-blue-200 mb-4">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-blue-800">
              <strong>管理員模式：</strong>您正在編輯共享行程，所有用戶都會看到這些變更。
            </p>
          </div>
        </div>
      )}

      {days.map((day) => {
        const dayCheckpoints = getCheckpointsForDay(day);
        return (
          <div key={day} className="relative">
            {/* Day Header */}
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-[#34495e] transform rotate-1">第 {day} 天</h3>
              {isAdmin && (
                <button
                  onClick={() => handleAddCheckpoint(day)}
                  className="sketch-button px-3 py-1 bg-[#27ae60] text-white hover:bg-[#229954] transition-colors flex items-center gap-1 text-sm font-semibold"
                  title="新增檢查點"
                >
                  <Plus className="w-4 h-4" />
                  <span>新增</span>
                </button>
              )}
            </div>

            {/* Timeline Path */}
            <div className="relative pl-8 border-l-4 border-[#3498db]" style={{
              borderStyle: 'dashed',
              borderImage: 'repeating-linear-gradient(0deg, transparent, transparent 5px, #3498db 5px, #3498db 7px) 1',
            }}>
              {dayCheckpoints.map((checkpoint, index) => (
                <div
                  key={checkpoint.id}
                  className="relative mb-6 last:mb-0"
                >
                  {/* Timeline Dot */}
                  <div className="absolute -left-[18px] top-2 w-4 h-4 bg-[#3498db] rounded-full border-2 border-white shadow-md"></div>

                  {/* Checkpoint Card */}
                  <div className="sketch-box bg-white p-4 ml-4">
                    <div className="flex items-center justify-between">
                      {isAdmin && editingId === checkpoint.id ? (
                        <div className="flex-1 flex items-center gap-2">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => handleSave(checkpoint.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSave(checkpoint.id);
                              if (e.key === "Escape") setEditingId(null);
                            }}
                            className="flex-1 px-2 py-1 border-2 border-[#3498db] rounded focus:outline-none"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <>
                          <span className="text-xl text-[#2c3e50]">
                            {checkpoint.name}
                          </span>
                          {isAdmin && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(checkpoint.id, checkpoint.name)}
                                className="sketch-button p-1.5 hover:bg-[#ecf0f1] rounded transition-colors"
                                title="編輯"
                              >
                                <Pencil className="w-4 h-4 sketch-icon text-[#3498db]" />
                              </button>
                              <button
                                onClick={() => handleDelete(checkpoint.id)}
                                className="sketch-button p-1.5 hover:bg-[#ecf0f1] rounded transition-colors"
                                title="刪除"
                              >
                                <Trash2 className="w-4 h-4 sketch-icon text-[#e74c3c]" />
                              </button>
                            </div>
                          )}
                          {!isAdmin && (
                            <div className="flex items-center" title="只有管理員可以編輯">
                              <Lock className="w-4 h-4 text-[#95a5a6]" />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Connector Line (except last) */}
                  {index < dayCheckpoints.length - 1 && (
                    <div className="absolute left-[-14px] top-8 w-0.5 h-6 bg-[#3498db] border-dashed"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

