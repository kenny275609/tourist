"use client";

import { useState } from "react";
import { Pencil, Trash2, Plus, Check, X, Eye, EyeOff } from "lucide-react";
import { useDefaultGearTemplates, type GearTemplate } from "@/hooks/useDefaultGearTemplates";

export default function AdminGearTemplateManager() {
  const {
    templates,
    loading,
    addTemplate,
    updateTemplate,
    deleteTemplate,
  } = useDefaultGearTemplates();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState<"clothing" | "gear">("gear");
  const [newItemOrder, setNewItemOrder] = useState(0);

  const handleEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditValue(currentName);
  };

  const handleSave = async (id: string) => {
    if (editValue.trim()) {
      try {
        await updateTemplate(id, { name: editValue.trim() });
        setEditingId(null);
        setEditValue("");
      } catch (error) {
        console.error("無法更新模板:", error);
        alert("無法更新模板，請稍後再試");
      }
    } else {
      setEditingId(null);
      setEditValue("");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("確定要刪除這個模板嗎？新成員將不會再看到此物品。")) {
      try {
        await deleteTemplate(id);
      } catch (error) {
        console.error("無法刪除模板:", error);
        alert("無法刪除模板，請稍後再試");
      }
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateTemplate(id, { is_active: !currentStatus });
    } catch (error) {
      console.error("無法更新模板狀態:", error);
      alert("無法更新模板狀態，請稍後再試");
    }
  };

  const handleAdd = async () => {
    if (newItemName.trim()) {
      try {
        await addTemplate({
          name: newItemName.trim(),
          category: newItemCategory,
          display_order: newItemOrder,
          is_active: true,
        });
        setNewItemName("");
        setNewItemCategory("gear");
        setNewItemOrder(0);
        setShowAddForm(false);
      } catch (error) {
        console.error("無法新增模板:", error);
        alert("無法新增模板，請稍後再試");
      }
    }
  };

  const clothingTemplates = templates.filter((t) => t.category === "clothing");
  const gearTemplates = templates.filter((t) => t.category === "gear");

  if (loading) {
    return (
      <div className="text-center py-8 text-[#5a6c7d]">
        載入中...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-yellow-800">
          <strong>管理者設定：</strong>這裡設定的物品會自動加入新成員的裝備清單中。
          成員可以自行新增、編輯或刪除自己的物品。
        </p>
      </div>

      {/* 類別 A: 衣物 */}
      <div className="sketch-box p-6 bg-white">
        <h3 className="text-2xl font-bold mb-4 text-[#34495e] transform -rotate-1">
          類別 A：衣物（分層系統）
        </h3>
        {clothingTemplates.length === 0 ? (
          <p className="text-gray-400 text-center py-4">尚無模板</p>
        ) : (
          <div className="space-y-3">
            {clothingTemplates.map((template) => (
              <div
                key={template.id}
                className={`flex items-center gap-3 p-3 border-2 ${
                  template.is_active
                    ? "bg-[#f8f9fa] border-[#2c3e50]"
                    : "bg-gray-100 border-gray-400 opacity-60"
                }`}
                style={{
                  borderRadius: template.is_active 
                    ? '255px 15px 225px 15px / 15px 225px 15px 255px'
                    : '15px 255px 15px 225px / 225px 15px 255px 15px',
                  transform: template.is_active ? 'rotate(-0.5deg)' : 'rotate(0.5deg)',
                }}
              >
                <button
                  onClick={() => handleToggleActive(template.id, template.is_active)}
                  className="flex-shrink-0"
                  title={template.is_active ? "停用" : "啟用"}
                >
                  {template.is_active ? (
                    <Eye className="w-5 h-5 text-green-600" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {editingId === template.id ? (
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => handleSave(template.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSave(template.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="flex-1 px-2 py-1 border-2 border-[#3498db] rounded focus:outline-none"
                    autoFocus
                  />
                ) : (
                  <>
                    <span
                      className={`flex-1 text-lg ${
                        template.is_active ? "text-[#2c3e50]" : "text-gray-400 line-through"
                      }`}
                    >
                      {template.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      順序: {template.display_order}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(template.id, template.name)}
                        className="sketch-button p-1.5 hover:bg-[#ecf0f1] rounded transition-colors"
                        title="編輯"
                      >
                        <Pencil className="w-4 h-4 sketch-icon text-[#3498db]" />
                      </button>
                      <button
                        onClick={() => handleDelete(template.id)}
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
        )}
      </div>

      {/* 類別 B: 必備裝備 */}
      <div className="sketch-box p-6 bg-white">
        <h3 className="text-2xl font-bold mb-4 text-[#34495e] transform rotate-1">
          類別 B：必備裝備
        </h3>
        {gearTemplates.length === 0 ? (
          <p className="text-gray-400 text-center py-4">尚無模板</p>
        ) : (
          <div className="space-y-3">
            {gearTemplates.map((template) => (
              <div
                key={template.id}
                className={`flex items-center gap-3 p-3 border-2 ${
                  template.is_active
                    ? "bg-[#f8f9fa] border-[#2c3e50]"
                    : "bg-gray-100 border-gray-400 opacity-60"
                }`}
                style={{
                  borderRadius: template.is_active 
                    ? '255px 15px 225px 15px / 15px 225px 15px 255px'
                    : '15px 255px 15px 225px / 225px 15px 255px 15px',
                  transform: template.is_active ? 'rotate(-0.5deg)' : 'rotate(0.5deg)',
                }}
              >
                <button
                  onClick={() => handleToggleActive(template.id, template.is_active)}
                  className="flex-shrink-0"
                  title={template.is_active ? "停用" : "啟用"}
                >
                  {template.is_active ? (
                    <Eye className="w-5 h-5 text-green-600" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {editingId === template.id ? (
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => handleSave(template.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSave(template.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="flex-1 px-2 py-1 border-2 border-[#3498db] rounded focus:outline-none"
                    autoFocus
                  />
                ) : (
                  <>
                    <span
                      className={`flex-1 text-lg ${
                        template.is_active ? "text-[#2c3e50]" : "text-gray-400 line-through"
                      }`}
                    >
                      {template.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      順序: {template.display_order}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(template.id, template.name)}
                        className="sketch-button p-1.5 hover:bg-[#ecf0f1] rounded transition-colors"
                        title="編輯"
                      >
                        <Pencil className="w-4 h-4 sketch-icon text-[#3498db]" />
                      </button>
                      <button
                        onClick={() => handleDelete(template.id)}
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
        )}
      </div>

      {/* 新增模板 */}
      {showAddForm ? (
        <div className="sketch-box p-6 bg-white rounded-lg">
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
            <div className="flex items-center gap-2">
              <label className="text-sm text-[#5a6c7d]">顯示順序：</label>
              <input
                type="number"
                value={newItemOrder}
                onChange={(e) => setNewItemOrder(parseInt(e.target.value) || 0)}
                className="w-20 px-2 py-1 border-2 border-[#ecf0f1] rounded focus:outline-none"
              />
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
                  setNewItemOrder(0);
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
            新增預設裝備模板
          </span>
        </button>
      )}
    </div>
  );
}

