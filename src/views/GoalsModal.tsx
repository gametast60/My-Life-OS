import React, { useState } from "react";
import { GoalItem } from "../types";
import { X, Target, Plus, CheckCircle2, Circle, Sparkles, Trash2 } from "lucide-react";

interface GoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  goals: GoalItem[];
  onSaveGoals: (goals: GoalItem[]) => void;
}

export const GoalsModal: React.FC<GoalsModalProps> = ({
  isOpen,
  onClose,
  goals,
  onSaveGoals,
}) => {
  const [goalList, setGoalList] = useState<GoalItem[]>(goals);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Languages");
  const [newPriority, setNewPriority] = useState<"High" | "Medium" | "Low">("High");

  if (!isOpen) return null;

  const handleAddGoal = () => {
    if (!newTitle.trim()) return;
    const newGoal: GoalItem = {
      id: "g-" + Date.now(),
      title: newTitle.trim(),
      category: newCategory,
      priority: newPriority,
      progressPercent: 0,
      deadline: "2026-12-31",
      milestones: [
        { id: "m1", title: "วางแผนขั้นตอนแรก", completed: false },
        { id: "m2", title: "ลงมือทำสัปดาห์แรก", completed: false },
      ],
      vision: "ความสำเร็จในเป้าหมายนี้จะยกระดับชีวิตขึ้นอีกขั้น",
      aiSuggestions: ["ซอยย่อยเป้าหมายเป็นงาน 15 นาทีทำทุกวัน"],
      completed: false,
      archived: false,
      createdAt: new Date().toISOString().split("T")[0],
    };
    const updated = [newGoal, ...goalList];
    setGoalList(updated);
    onSaveGoals(updated);
    setNewTitle("");
  };

  const handleToggleMilestone = (goalId: string, milestoneId: string) => {
    const updated = goalList.map((g) => {
      if (g.id !== goalId) return g;
      const updatedMilestones = g.milestones.map((m) =>
        m.id === milestoneId ? { ...m, completed: !m.completed } : m
      );
      const completedCount = updatedMilestones.filter((m) => m.completed).length;
      const percent = Math.round((completedCount / updatedMilestones.length) * 100);
      return {
        ...g,
        milestones: updatedMilestones,
        progressPercent: percent,
        completed: percent === 100,
      };
    });
    setGoalList(updated);
    onSaveGoals(updated);
  };

  const handleDeleteGoal = (id: string) => {
    const updated = goalList.filter((g) => g.id !== id);
    setGoalList(updated);
    onSaveGoals(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#131913] rounded-3xl p-6 border border-[#1F2B1F] shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#1F2B1F] pb-4">
          <div className="flex items-center gap-2">
            <Target className="w-6 h-6 text-[#6B9361]" />
            <div>
              <h3 className="text-xl font-bold text-[#EBF1EA]">ตัวติดตามเป้าหมาย (Goal Tracker)</h3>
              <p className="text-xs text-[#869883]">วางแผน ย่อขั้นตอน และก้าวไปสู่ชีวิตในฝัน</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#182018] text-[#869883] hover:text-[#EBF1EA]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add Goal Bar */}
        <div className="p-4 rounded-2xl bg-[#182018] border border-[#223022] space-y-3">
          <h4 className="text-xs font-mono text-[#6B9361] uppercase font-bold">สร้างเป้าหมายใหม่</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="ชื่อเป้าหมาย เช่น เรียนภาษาอังกฤษ"
              className="sm:col-span-2 p-2.5 rounded-xl bg-[#101610] border border-[#1F2B1F] text-xs text-[#EBF1EA]"
            />
            <button
              onClick={handleAddGoal}
              className="px-4 py-2.5 rounded-xl bg-[#3F5C3A] text-white text-xs font-mono font-bold flex items-center justify-center gap-1 hover:bg-[#4E7345]"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มเป้าหมาย</span>
            </button>
          </div>
        </div>

        {/* Goals List */}
        <div className="space-y-4">
          {goalList.map((g) => (
            <div key={g.id} className="p-4 rounded-2xl bg-[#182018] border border-[#223022] space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono text-[#6B9361] uppercase font-bold">{g.category}</span>
                  <h4 className="text-base font-bold text-[#EBF1EA]">{g.title}</h4>
                </div>
                <button onClick={() => handleDeleteGoal(g.id)} className="text-[#869883] hover:text-rose-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#869883]">ความคืบหน้า</span>
                  <span className="font-mono text-[#6B9361] font-bold">{g.progressPercent}%</span>
                </div>
                <div className="h-2 bg-[#101610] rounded-full overflow-hidden border border-[#1F2B1F]">
                  <div className="h-full bg-[#4E7345] rounded-full transition-all" style={{ width: `${g.progressPercent}%` }} />
                </div>
              </div>

              {/* Milestones */}
              <div className="space-y-1.5 pt-2">
                <p className="text-[11px] font-mono text-[#869883]">ขั้นตอนย่อย (Milestones):</p>
                {g.milestones.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => handleToggleMilestone(g.id, m.id)}
                    className="flex items-center gap-2 text-xs text-[#EBF1EA] hover:text-[#6B9361] cursor-pointer"
                  >
                    {m.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-[#6B9361]" />
                    ) : (
                      <Circle className="w-4 h-4 text-[#869883]/40" />
                    )}
                    <span className={m.completed ? "line-through opacity-60" : ""}>{m.title}</span>
                  </div>
                ))}
              </div>

              {g.aiSuggestions && g.aiSuggestions.length > 0 && (
                <div className="p-2.5 rounded-xl bg-[#182218] border border-[#273727] text-xs text-[#6B9361] space-y-1">
                  <span className="font-mono font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> AI Suggestion:
                  </span>
                  <p className="text-[11px] text-[#869883]">{g.aiSuggestions[0]}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
