import React, { useState, useRef, useEffect } from "react";
import { ReminderItem } from "../types";
import { Bell, Check, Edit2, Trash2, X, Plus } from "lucide-react";

interface NotificationBellProps {
  reminders: ReminderItem[];
  onAddReminder: (text: string) => void;
  onEditReminder: (id: string, newText: string) => void;
  onDeleteReminder: (id: string) => void;
  onCompleteReminder: (item: ReminderItem) => void;
  onClearAllReminders: () => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  reminders,
  onAddReminder,
  onEditReminder,
  onDeleteReminder,
  onCompleteReminder,
  onClearAllReminders,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [inputText, setInputText] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setEditingId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStartEdit = (r: ReminderItem) => {
    setEditingId(r.id);
    setEditingText(r.text);
  };

  const handleSaveEdit = (id: string) => {
    const trimmed = editingText.trim();
    if (trimmed) {
      onEditReminder(id, trimmed);
    }
    setEditingId(null);
  };

  const handleAdd = () => {
    const trimmed = inputText.trim();
    if (trimmed) {
      onAddReminder(trimmed);
      setInputText("");
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-[#869883] hover:text-[#EBF1EA] hover:bg-white/5 transition-all flex items-center gap-1.5"
        title="เตือนความจำ"
      >
        <Bell className="w-5 h-5" />
        {reminders.length > 0 && (
          <span className="text-[10px] font-mono bg-[#273727] text-[#6B9361] px-2 py-0.5 rounded-full border border-[#354B35]">
            {reminders.length}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="fixed left-4 right-4 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-96 max-w-md sm:max-w-none mx-auto sm:mx-0 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
          style={{ background: "#131913", border: "1px solid #1F2B1F" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1F2B1F]">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#6B9361]" />
              <h3 className="text-xs font-bold text-[#EBF1EA]">เตือนความจำ</h3>
              {reminders.length > 0 && (
                <span className="text-[10px] font-mono bg-[#273727] text-[#6B9361] px-2 py-0.5 rounded-full border border-[#354B35]">
                  {reminders.length}
                </span>
              )}
            </div>
            {reminders.length > 0 && (
              <button
                onClick={onClearAllReminders}
                className="text-[11px] text-[#869883] hover:text-red-400 transition-colors"
              >
                ลบทั้งหมด
              </button>
            )}
          </div>

          {/* Quick Add Input */}
          <div className="p-3 border-b border-[#1F2B1F] flex items-center gap-2 bg-[#182018]">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
              }}
              placeholder="จดสิ่งที่กลัวลืม..."
              className="flex-1 px-3 py-1.5 rounded-xl bg-[#131913] border border-[#223022] text-xs text-[#EBF1EA] placeholder-[#556653] focus:outline-none focus:border-[#4E7345]"
            />
            <button
              onClick={handleAdd}
              disabled={!inputText.trim()}
              className="w-7 h-7 flex items-center justify-center rounded-xl bg-[#3F5C3A] hover:bg-[#4E7345] text-white disabled:opacity-40 transition-colors flex-shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* List */}
          <div className="max-h-72 overflow-y-auto divide-y divide-[#1F2B1F]">
            {reminders.length === 0 ? (
              <div className="py-8 text-center text-[#869883] text-xs">
                ไม่มีรายการเตือนความจำ ✨
              </div>
            ) : (
              reminders.map((r) => (
                <div
                  key={r.id}
                  className="p-3 hover:bg-[#182018] transition-colors flex items-center gap-2.5 group"
                >
                  {/* Complete Circle Button */}
                  <button
                    onClick={() => {
                      onCompleteReminder(r);
                      setIsOpen(false);
                    }}
                    className="w-5 h-5 rounded-full border-2 border-[#374E37] flex items-center justify-center flex-shrink-0 hover:border-[#6B9361] hover:bg-[#1F2B1F] transition-all"
                    title="ทำเสร็จแล้ว — บันทึกเข้าไดอารี่"
                  >
                    <span className="sr-only">ทำเสร็จแล้ว</span>
                  </button>

                  {/* Inline Edit or Text */}
                  {editingId === r.id ? (
                    <div className="flex-1 flex items-center gap-1.5">
                      <input
                        type="text"
                        autoFocus
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit(r.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        className="flex-1 bg-[#131913] border border-[#4E7345] rounded-lg px-2 py-1 text-xs text-[#EBF1EA] outline-none"
                      />
                      <button
                        onClick={() => handleSaveEdit(r.id)}
                        className="p-1 text-emerald-400 hover:bg-emerald-950/40 rounded"
                        title="บันทึก"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 text-gray-400 hover:bg-white/5 rounded"
                        title="ยกเลิก"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <p
                        onClick={() => handleStartEdit(r)}
                        className="flex-1 text-sm text-[#EBF1EA] leading-relaxed cursor-pointer hover:text-emerald-300 transition-colors"
                        title="คลิกเพื่อแก้ไข"
                      >
                        {r.text}
                      </p>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => handleStartEdit(r)}
                          className="p-1.5 rounded-lg text-white bg-[#1F2B1F] hover:bg-[#273727] transition-all"
                          title="แก้ไข"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-white" />
                        </button>
                        <button
                          onClick={() => onDeleteReminder(r.id)}
                          className="p-1.5 rounded-lg text-red-400 bg-[#2A1818] hover:bg-[#3D1D1D] transition-all"
                          title="ลบ"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
