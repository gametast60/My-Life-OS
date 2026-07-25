import React, { useState } from "react";
import { Search, X, BookOpen, Target, Heart, Calendar } from "lucide-react";
import { JournalEntry, GoalItem, HabitItem, AffirmationItem, TimelineEvent } from "../types";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  journals: JournalEntry[];
  goals: GoalItem[];
  habits: HabitItem[];
  affirmations: AffirmationItem[];
  timeline: TimelineEvent[];
  onSelectJournal: (j: JournalEntry) => void;
  onSelectGoal: (g: GoalItem) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  journals,
  goals,
  habits,
  affirmations,
  timeline,
  onSelectJournal,
  onSelectGoal,
}) => {
  const [query, setQuery] = useState("");

  if (!isOpen) return null;

  const filteredJournals = journals.filter(
    (j) =>
      j.title?.toLowerCase().includes(query.toLowerCase()) ||
      j.content?.toLowerCase().includes(query.toLowerCase()) ||
      j.tags?.some((t) => t.toLowerCase().includes(query.toLowerCase()))
  );

  const filteredGoals = goals.filter((g) =>
    g.title?.toLowerCase().includes(query.toLowerCase()) ||
    g.category?.toLowerCase().includes(query.toLowerCase())
  );

  const filteredHabits = habits.filter((h) =>
    h.title?.toLowerCase().includes(query.toLowerCase())
  );

  const filteredAffirmations = affirmations.filter((a) =>
    a.text?.toLowerCase().includes(query.toLowerCase())
  );

  const filteredTimeline = timeline.filter((t) =>
    t.title?.toLowerCase().includes(query.toLowerCase()) ||
    t.description?.toLowerCase().includes(query.toLowerCase())
  );

  const totalResults =
    filteredJournals.length +
    filteredGoals.length +
    filteredHabits.length +
    filteredAffirmations.length +
    filteredTimeline.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#131913] rounded-3xl p-6 border border-[#1F2B1F] shadow-2xl space-y-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1F2B1F] pb-4">
          <div className="flex items-center gap-3 flex-1">
            <Search className="w-5 h-5 text-[#6B9361]" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาทุกอย่างใน ไลฟ์ OS (บันทึก, เป้าหมาย, นิสัย, ความคิด)..."
              className="w-full bg-transparent border-none text-[#EBF1EA] focus:outline-none focus:ring-0 placeholder-[#697A66] text-base"
            />
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#869883] hover:text-[#EBF1EA] hover:bg-[#182018]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Results */}
        <div className="overflow-y-auto flex-1 space-y-6 pr-2 hide-scrollbar">
          {query.trim() === "" ? (
            <div className="text-center py-8 text-[#869883] text-sm">
              พิมพ์คำค้นหาเพื่อสำรวจบันทึก, เป้าหมาย, นิสัย และประวัติใน ไลฟ์ OS ของคุณ
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-8 text-[#869883] text-sm">
              ไม่พบผลลัพธ์ที่ตรงกับ "{query}"
            </div>
          ) : (
            <>
              {/* Journals */}
              {filteredJournals.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-mono text-[#6B9361] uppercase tracking-widest flex items-center gap-1.5 font-bold">
                    <BookOpen className="w-3.5 h-3.5" /> บันทึกไดอารี่ ({filteredJournals.length})
                  </h4>
                  <div className="space-y-2">
                    {filteredJournals.map((j) => (
                      <div
                        key={j.id}
                        onClick={() => {
                          onSelectJournal(j);
                          onClose();
                        }}
                        className="p-3 rounded-2xl bg-[#182018] hover:bg-[#1F2B1F] cursor-pointer transition-colors border border-[#223022]"
                      >
                        <div className="flex justify-between items-center text-xs text-[#869883] mb-1">
                          <span>{j.date}</span>
                          <span>{j.mood}</span>
                        </div>
                        <h5 className="font-semibold text-[#EBF1EA] text-sm">{j.title || "บันทึกรายวัน"}</h5>
                        <p className="text-xs text-[#869883] line-clamp-1">{j.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Goals */}
              {filteredGoals.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-mono text-[#6B9361] uppercase tracking-widest flex items-center gap-1.5 font-bold">
                    <Target className="w-3.5 h-3.5" /> เป้าหมาย ({filteredGoals.length})
                  </h4>
                  <div className="space-y-2">
                    {filteredGoals.map((g) => (
                      <div
                        key={g.id}
                        onClick={() => {
                          onSelectGoal(g);
                          onClose();
                        }}
                        className="p-3 rounded-2xl bg-[#182018] hover:bg-[#1F2B1F] cursor-pointer transition-colors flex justify-between items-center border border-[#223022]"
                      >
                        <div>
                          <h5 className="font-semibold text-[#EBF1EA] text-sm">{g.title}</h5>
                          <span className="text-xs text-[#869883]">{g.category} • ความคืบหน้า {g.progressPercent}%</span>
                        </div>
                        <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#182218] text-[#6B9361] border border-[#273727]">
                          {g.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Affirmations */}
              {filteredAffirmations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-mono text-[#6B9361] uppercase tracking-widest flex items-center gap-1.5 font-bold">
                    <Heart className="w-3.5 h-3.5" /> พลังบวก ({filteredAffirmations.length})
                  </h4>
                  <div className="space-y-2">
                    {filteredAffirmations.map((a) => (
                      <div key={a.id} className="p-3 rounded-2xl bg-[#182018] border border-[#223022] text-xs text-[#EBF1EA]">
                        "{a.text}"
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline */}
              {filteredTimeline.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-mono text-[#6B9361] uppercase tracking-widest flex items-center gap-1.5 font-bold">
                    <Calendar className="w-3.5 h-3.5" /> Timeline ({filteredTimeline.length})
                  </h4>
                  <div className="space-y-2">
                    {filteredTimeline.map((t) => (
                      <div key={t.id} className="p-3 rounded-2xl bg-[#182018] border border-[#223022] text-xs space-y-1">
                        <span className="text-[10px] text-[#869883]">{t.dateStr}</span>
                        <p className="font-medium text-[#EBF1EA]">{t.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
