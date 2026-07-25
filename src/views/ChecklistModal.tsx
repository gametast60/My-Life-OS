import React, { useState } from "react";
import { ChecklistItem } from "../types";
import { X, CheckSquare, Plus, CheckCircle2, Circle, Trash2 } from "lucide-react";

interface ChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  checklist: ChecklistItem[];
  onSaveChecklist: (checklist: ChecklistItem[]) => void;
}

export const ChecklistModal: React.FC<ChecklistModalProps> = ({
  isOpen,
  onClose,
  checklist,
  onSaveChecklist,
}) => {
  const [items, setItems] = useState<ChecklistItem[]>(checklist);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Work");
  const [newPriority, setNewPriority] = useState<"High" | "Medium" | "Low">("Medium");

  if (!isOpen) return null;

  const handleAddItem = () => {
    if (!newTitle.trim()) return;
    const newItem: ChecklistItem = {
      id: "c-" + Date.now(),
      title: newTitle.trim(),
      priority: newPriority,
      deadline: "วันนี้",
      completed: false,
      category: newCategory,
    };
    const updated = [newItem, ...items];
    setItems(updated);
    onSaveChecklist(updated);
    setNewTitle("");
  };

  const handleToggleItem = (id: string) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setItems(updated);
    onSaveChecklist(updated);
  };

  const handleDeleteItem = (id: string) => {
    const updated = items.filter((item) => item.id !== id);
    setItems(updated);
    onSaveChecklist(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#131913] rounded-3xl p-6 border border-[#1F2B1F] shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#1F2B1F] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#182218] text-[#6B9361] border border-[#273727] rounded-xl">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#EBF1EA]">จัดการภารกิจ (Checklist & Tasks)</h3>
              <p className="text-xs text-[#869883]">รายการงานด่วนประจำวันและภารกิจย่อย</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#182018] text-[#869883] hover:text-[#EBF1EA] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add Checklist Item */}
        <div className="p-4 rounded-2xl bg-[#182018] border border-[#223022] space-y-3">
          <h4 className="text-xs font-bold text-[#6B9361] uppercase tracking-wider">เพิ่มภารกิจใหม่</h4>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="ชื่อภารกิจ เช่น ทบทวนแผนงาน..."
              className="flex-1 p-2.5 rounded-xl bg-[#101610] border border-[#1F2B1F] text-xs text-[#EBF1EA] focus:outline-none focus:border-[#4E7345]"
            />
            <button
              onClick={handleAddItem}
              className="px-4 py-2.5 rounded-xl bg-[#3F5C3A] text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#4E7345] transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่ม</span>
            </button>
          </div>
        </div>

        {/* List */}
        <div className="space-y-2.5">
          {items.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                item.completed
                  ? "bg-[#101610] border-[#1F2B1F] opacity-70"
                  : "bg-[#182018] border-[#223022] shadow-sm hover:border-[#273727]"
              }`}
            >
              <div
                onClick={() => handleToggleItem(item.id)}
                className="flex items-center gap-3 cursor-pointer flex-1"
              >
                {item.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-[#6B9361] flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-[#869883]/40 flex-shrink-0" />
                )}
                <div>
                  <p
                    className={`text-sm font-medium text-[#EBF1EA] ${
                      item.completed ? "line-through text-[#869883]" : ""
                    }`}
                  >
                    {item.title}
                  </p>
                  <span className="text-[10px] font-semibold text-[#869883] uppercase">
                    {item.category} • {item.deadline}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleDeleteItem(item.id)}
                className="p-1.5 text-[#869883] hover:text-rose-400 rounded-lg transition-colors"
                title="ลบภารกิจ"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
