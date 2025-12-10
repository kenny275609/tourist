"use client";

import { useState, useEffect } from "react";
import { Pencil, Trash2, Plus, User, Check } from "lucide-react";
import { useSharedGearState } from "@/hooks/useSharedGearState";
import { useAuth } from "@/hooks/useAuth";

interface SharedGearItem {
  id: string;
  name: string;
  claimedBy: string | null; // 認領者名稱
}

const initialSharedGear: SharedGearItem[] = [
  { id: "1", name: "帳篷", claimedBy: null },
  { id: "2", name: "爐具", claimedBy: null },
  { id: "3", name: "公糧", claimedBy: null },
  { id: "4", name: "急救包（公）", claimedBy: null },
];

export default function SharedGearClaim() {
  const { user } = useAuth();
  const [sharedGearData, updateSharedGear, loading] = useSharedGearState("default-team");
  
  const [sharedGear, setSharedGear] = useState<SharedGearItem[]>(initialSharedGear);
  
  useEffect(() => {
    if (sharedGearData.length > 0) {
      setSharedGear(
        sharedGearData.map((item) => ({
          id: item.id,
          name: item.name,
          claimedBy: item.claimed_by,
        }))
      );
    } else if (sharedGearData.length === 0 && !loading) {
      // 初始化數據
      updateSharedGear(
        initialSharedGear.map((item) => ({
          id: item.id,
          name: item.name,
          claimed_by: item.claimedBy,
        }))
      );
    }
  }, [sharedGearData, loading, updateSharedGear]);

  const handleSetSharedGear = async (newGear: SharedGearItem[]) => {
    setSharedGear(newGear);
    await updateSharedGear(
      newGear.map((item) => ({
        id: item.id,
        name: item.name,
        claimed_by: item.claimedBy,
      }))
    );
  };
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimantName, setClaimantName] = useState("");

  const handleEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditValue(currentName);
  };

  const handleSave = async (id: string) => {
    const newGear = sharedGear.map((item) =>
      item.id === id ? { ...item, name: editValue } : item
    );
    await handleSetSharedGear(newGear);
    setEditingId(null);
    setEditValue("");
  };

  const handleDelete = async (id: string) => {
    const newGear = sharedGear.filter((item) => item.id !== id);
    await handleSetSharedGear(newGear);
  };

  const handleAdd = async () => {
    if (newItemName.trim()) {
      const newItem: SharedGearItem = {
        id: Date.now().toString(),
        name: newItemName.trim(),
        claimedBy: null,
      };
      const newGear = [...sharedGear, newItem];
      await handleSetSharedGear(newGear);
      setNewItemName("");
      setShowAddForm(false);
    }
  };

  const handleClaim = async (id: string) => {
    if (claimantName.trim()) {
      const newGear = sharedGear.map((item) =>
        item.id === id
          ? { ...item, claimedBy: claimantName.trim() }
          : item
      );
      await handleSetSharedGear(newGear);
      setClaimingId(null);
      setClaimantName("");
    }
  };

  const handleUnclaim = async (id: string) => {
    const newGear = sharedGear.map((item) =>
      item.id === id ? { ...item, claimedBy: null } : item
    );
    await handleSetSharedGear(newGear);
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-[#5a6c7d]">
        載入中...
      </div>
    );
  }

  const unclaimedItems = sharedGear.filter((item) => !item.claimedBy);
  const claimedItems = sharedGear.filter((item) => item.claimedBy);

  return (
    <div className="space-y-6">
      {/* 未認領物品 */}
      <div className="sketch-box p-6 bg-white">
        <h3 className="text-2xl font-bold mb-4 text-[#34495e] transform -rotate-1">
          🔓 待認領的共同裝備
        </h3>
        {unclaimedItems.length === 0 ? (
          <p className="text-lg text-[#95a5a6] text-center py-4">
            所有物品都已認領！👍
          </p>
        ) : (
          <div className="space-y-3">
            {unclaimedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 bg-[#fff3cd] border-2 border-[#ffc107]"
                style={{
                  borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px',
                  transform: 'rotate(0.5deg)',
                }}
              >
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
                    <span className="flex-1 text-lg font-semibold text-[#2c3e50]">
                      {item.name}
                    </span>
                    <div className="flex gap-2 items-center">
                      {claimingId === item.id ? (
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            placeholder="輸入您的名字"
                            value={claimantName}
                            onChange={(e) => setClaimantName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleClaim(item.id);
                              if (e.key === "Escape") {
                                setClaimingId(null);
                                setClaimantName("");
                              }
                            }}
                            className="px-2 py-1 border-2 border-[#27ae60] rounded focus:outline-none w-32"
                            autoFocus
                          />
                          <button
                            onClick={() => handleClaim(item.id)}
                            className="px-3 py-1 bg-[#27ae60] text-white rounded hover:bg-[#229954] transition-colors text-sm"
                          >
                            確認
                          </button>
                          <button
                            onClick={() => {
                              setClaimingId(null);
                              setClaimantName("");
                            }}
                            className="px-3 py-1 bg-[#95a5a6] text-white rounded hover:bg-[#7f8c8d] transition-colors text-sm"
                          >
                            取消
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => setClaimingId(item.id)}
                            className="washi-tape-button px-4 py-2 bg-[#27ae60] text-white hover:bg-[#229954] transition-colors text-sm font-semibold flex items-center gap-1"
                            title="認領"
                          >
                            <User className="w-4 h-4" />
                            認領
                          </button>
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
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 已認領物品 */}
      {claimedItems.length > 0 && (
        <div className="sketch-box p-6 bg-white">
          <h3 className="text-2xl font-bold mb-4 text-[#34495e] transform rotate-1">
            ✅ 已認領的共同裝備
          </h3>
          <div className="space-y-3">
            {claimedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 bg-[#d4edda] border-2 border-[#27ae60]"
                style={{
                  borderRadius: '15px 255px 15px 225px / 225px 15px 255px 15px',
                  transform: 'rotate(-0.5deg)',
                }}
              >
                <Check className="w-5 h-5 text-[#27ae60] flex-shrink-0" />
                <span className="flex-1 text-lg font-semibold text-[#2c3e50]">
                  {item.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-[#27ae60] text-white rounded-full text-sm font-semibold flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {item.claimedBy}
                  </span>
                  <button
                    onClick={() => handleUnclaim(item.id)}
                    className="washi-tape-button px-3 py-1 bg-[#95a5a6] text-white hover:bg-[#7f8c8d] transition-colors text-sm font-semibold"
                    title="取消認領"
                  >
                    取消認領
                  </button>
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
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 新增共同裝備 */}
      {showAddForm ? (
        <div className="sketch-box p-6 bg-white rounded-lg">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="輸入共同裝備名稱（例如：濾水器）"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
                if (e.key === "Escape") {
                  setShowAddForm(false);
                  setNewItemName("");
                }
              }}
              className="w-full px-4 py-2 border-2 border-[#3498db] rounded focus:outline-none"
              autoFocus
            />
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
            新增共同裝備（例如：濾水器）
          </span>
        </button>
      )}
    </div>
  );
}

