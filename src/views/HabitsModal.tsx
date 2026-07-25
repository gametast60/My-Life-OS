import React, { useState } from "react";
import { HabitItem } from "../types";
import { X, Repeat, Plus, Flame, Check, Trash2 } from "lucide-react";

interface HabitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  habits: HabitItem[];
  onSaveHabits: (habits: HabitItem[]) => void;
}

export const HabitsModal: React.FC<HabitsModalProps> = ({
  isOpen,
  onClose,
  habits,
  onSaveHabits,
}) => {
  const [habitList, setHabitList] = useState<HabitItem[]>(habits);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Health");

  if (!isOpen) return null;

  const handleAddHabit = () => {
    if (!newTitle.trim()) return;
    const newHabit: HabitItem = {
      id: "h-" + Date.now(),
      title: newTitle.trim(),
      category: newCategory,
      repeatSchedule: "ทุกวัน",
      reminderTime: "08:00",
      currentStreak: 0,
      bestStreak: 0,
      completedDates: [],
      completionRate: 0,
    };
    const updated = [newHabit, ...habitList];
    setHabitList(updated);
    onSaveHabits(updated);
    setNewTitle("");
  };

  const handleToggleHabitToday = (id: string) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const updated = habitList.map((h) => {
      if (h.id !== id) return h;
      const isDone = h.completedDates.includes(todayStr);
      const newDates = isDone
        ? h.completedDates.filter((d) => d !== todayStr)
        : [...h.completedDates, todayStr];
      const newStreak = isDone ? Math.max(0, h.currentStreak - 1) : h.currentStreak + 1;
      return {
        ...h,
        completedDates: newDates,
        currentStreak: newStreak,
        bestStreak: Math.max(h.bestStreak, newStreak),
        completionRate: Math.min(100, Math.round((newDates.length / 30) * 100)),
      };
    });
    setHabitList(updated);
    onSaveHabits(updated);
  };

  const handleDeleteHabit = (id: string) => {
    const updated = habitList.filter((h) => h.id !== id);
    setHabitList(updated);
    onSaveHabits(updated);
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#131913] rounded-3xl p-6 border border-[#1F2B1F] shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#1F2B1F] pb-4">
          <div className="flex items-center gap-2">
            <Repeat className="w-6 h-6 text-[#6B9361]" />
            <div>
              <h3 className="text-xl font-bold text-[#EBF1EA]">สร้างและติดตามนิสัย (Habit Tracker)</h3>
              <p className="text-xs text-[#869883]">สร้างรูปแบบพฤติกรรมเชิงบวกอย่างยั่งยืน</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#182018] text-[#869883] hover:text-[#EBF1EA]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add Habit */}
        <div className="p-4 rounded-2xl bg-[#182018] border border-[#223022] space-y-3">
          <h4 className="text-xs font-mono text-[#6B9361] uppercase font-bold">เพิ่มนิสัยใหม่</h4>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="พฤติกรรมใหม่ เช่น ดื่มน้ำ 2 ลิตร"
              className="flex-1 p-2.5 rounded-xl bg-[#101610] border border-[#1F2B1F] text-xs text-[#EBF1EA]"
            />
            <button
              onClick={handleAddHabit}
              className="px-4 py-2.5 rounded-xl bg-[#3F5C3A] text-white text-xs font-mono font-bold flex items-center gap-1 hover:bg-[#4E7345]"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่ม</span>
            </button>
          </div>
        </div>

        {/* Habit List */}
        <div className="space-y-3">
          {habitList.map((h) => {
            const isDoneToday = h.completedDates.includes(todayStr);
            return (
              <div
                key={h.id}
                className="p-4 rounded-2xl bg-[#182018] border border-[#223022] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleHabitToday(h.id)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all ${
                      isDoneToday
                        ? "bg-[#3F5C3A] text-white shadow-md"
                        : "bg-[#101610] border border-[#1F2B1F] text-[#869883]/40 hover:border-[#6B9361]"
                    }`}
                  >
                    {isDoneToday ? <Check className="w-5 h-5" /> : ""}
                  </button>
                  <div>
                    <h4 className="text-sm font-bold text-[#EBF1EA]">{h.title}</h4>
                    <span className="text-xs text-[#869883]">
                      {h.category} • เวลาเตือน {h.reminderTime}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-xs font-mono text-[#6B9361]">
                    <Flame className="w-4 h-4" />
                    <span>{h.currentStreak} วัน</span>
                  </div>
                  <button onClick={() => handleDeleteHabit(h.id)} className="text-[#869883] hover:text-rose-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
