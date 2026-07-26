import React, { useState } from "react";
import {
  JournalEntry,
  GoalItem,
  HabitItem,
  AffirmationItem,
  TimelineEvent,
  BrainCard,
  LIFE_DIMENSIONS,
  BRAIN_TYPES,
  LifeDimension,
  BrainType,
} from "../types";
import { Search, X, BookOpen, Target, Activity, Heart, Calendar, Brain, Filter } from "lucide-react";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  journals: JournalEntry[];
  goals: GoalItem[];
  habits: HabitItem[];
  affirmations: AffirmationItem[];
  timeline: TimelineEvent[];
  brainCards?: BrainCard[];
  onSelectJournal?: (entry: JournalEntry) => void;
  onSelectGoal?: (goal: GoalItem) => void;
  onSelectBrainCard?: (card: BrainCard) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  journals,
  goals,
  habits,
  affirmations,
  timeline,
  brainCards = [],
  onSelectJournal,
  onSelectGoal,
  onSelectBrainCard,
}) => {
  const [query, setQuery] = useState("");
  const [selectedDimension, setSelectedDimension] = useState<LifeDimension | "all">("all");
  const [selectedBrainType, setSelectedBrainType] = useState<BrainType | "all">("all");

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Filter Journals
  const filteredJournals = journals.filter((j) => {
    const dimOk = selectedDimension === "all" || j.dimension === selectedDimension;
    const match = !q || j.title.toLowerCase().includes(q) || j.content.toLowerCase().includes(q) || j.tags.some((t) => t.toLowerCase().includes(q));
    return dimOk && match;
  });

  // Filter Brain Cards
  const filteredBrainCards = brainCards.filter((b) => {
    const dimOk = selectedDimension === "all" || b.dimension === selectedDimension;
    const typeOk = selectedBrainType === "all" || b.brainType === selectedBrainType;
    const match = !q || b.title.toLowerCase().includes(q) || b.description.toLowerCase().includes(q) || b.tags.some((t) => t.toLowerCase().includes(q));
    return dimOk && typeOk && match;
  });

  // Filter Goals
  const filteredGoals = goals.filter((g) => {
    const dimOk = selectedDimension === "all" || g.dimension === selectedDimension;
    const match = !q || g.title.toLowerCase().includes(q) || g.category.toLowerCase().includes(q);
    return dimOk && match;
  });

  // Filter Habits
  const filteredHabits = habits.filter((h) => {
    const dimOk = selectedDimension === "all" || h.dimension === selectedDimension;
    const match = !q || h.title.toLowerCase().includes(q) || h.category.toLowerCase().includes(q);
    return dimOk && match;
  });

  const totalResults = filteredJournals.length + filteredBrainCards.length + filteredGoals.length + filteredHabits.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/80 backdrop-blur-md">
      <div
        className="w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-emerald-900/40"
        style={{ background: "#131a13", maxHeight: "80vh" }}
      >
        {/* Search Header */}
        <div className="p-4 border-b border-emerald-900/30 flex items-center gap-3">
          <Search size={20} className="text-emerald-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาใน Journal, Life Brain, Goals, Habits..."
            className="flex-1 bg-transparent text-sm text-gray-200 outline-none placeholder-gray-500"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-gray-500 hover:text-gray-300">
              <X size={16} />
            </button>
          )}
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Filters */}
        <div className="px-4 py-2 border-b border-emerald-900/20 flex flex-wrap items-center gap-2 bg-emerald-950/20 text-xs">
          <div className="flex items-center gap-1 text-gray-400 mr-1">
            <Filter size={12} />
            <span>กรอง:</span>
          </div>

          <select
            value={selectedDimension}
            onChange={(e) => setSelectedDimension(e.target.value as any)}
            className="bg-black/40 border border-emerald-900/40 text-gray-300 rounded-lg px-2 py-1 outline-none text-xs"
          >
            <option value="all">ทุก Dimension</option>
            {LIFE_DIMENSIONS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.emoji} {d.label}
              </option>
            ))}
          </select>

          <select
            value={selectedBrainType}
            onChange={(e) => setSelectedBrainType(e.target.value as any)}
            className="bg-black/40 border border-emerald-900/40 text-gray-300 rounded-lg px-2 py-1 outline-none text-xs"
          >
            <option value="all">ทุก Brain Type</option>
            {BRAIN_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {!q && selectedDimension === "all" && selectedBrainType === "all" ? (
            <div className="py-12 text-center text-gray-500 text-xs">
              พิมพ์คำค้นหา หรือเลือกตัวกรองด้านบนเพื่อเริ่มค้นหา
            </div>
          ) : totalResults === 0 ? (
            <div className="py-12 text-center text-gray-500 text-xs">
              ไม่พบผลลัพธ์ที่ตรงกับคำค้นหา
            </div>
          ) : (
            <>
              {/* Brain Cards Section */}
              {filteredBrainCards.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase">
                    <Brain size={14} /> Life Brain ({filteredBrainCards.length})
                  </h3>
                  <div className="space-y-2">
                    {filteredBrainCards.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => {
                          if (onSelectBrainCard) onSelectBrainCard(b);
                          onClose();
                        }}
                        className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/30 hover:border-emerald-700/50 cursor-pointer transition-all space-y-1"
                      >
                        <div className="flex items-center justify-between text-xs font-semibold text-gray-200">
                          <span>{b.title}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-800/40 text-emerald-300">
                            {b.brainType}
                          </span>
                        </div>
                        {b.description && (
                          <p className="text-xs text-gray-400 line-clamp-2">{b.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Journal Section */}
              {filteredJournals.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase">
                    <BookOpen size={14} /> Journal ({filteredJournals.length})
                  </h3>
                  <div className="space-y-2">
                    {filteredJournals.map((j) => (
                      <div
                        key={j.id}
                        onClick={() => {
                          if (onSelectJournal) onSelectJournal(j);
                          onClose();
                        }}
                        className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/30 hover:border-emerald-700/50 cursor-pointer transition-all space-y-1"
                      >
                        <div className="flex items-center justify-between text-xs font-semibold text-gray-200">
                          <span>{j.title}</span>
                          <span className="text-[10px] text-gray-400">{j.date}</span>
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-2">{j.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Goals Section */}
              {filteredGoals.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase">
                    <Target size={14} /> Goals ({filteredGoals.length})
                  </h3>
                  <div className="space-y-2">
                    {filteredGoals.map((g) => (
                      <div
                        key={g.id}
                        onClick={() => {
                          if (onSelectGoal) onSelectGoal(g);
                          onClose();
                        }}
                        className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/30 hover:border-emerald-700/50 cursor-pointer transition-all flex items-center justify-between text-xs"
                      >
                        <span className="font-semibold text-gray-200">{g.title}</span>
                        <span className="text-gray-400">{g.progressPercent}% Completed</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Habits Section */}
              {filteredHabits.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase">
                    <Activity size={14} /> Habits ({filteredHabits.length})
                  </h3>
                  <div className="space-y-2">
                    {filteredHabits.map((h) => (
                      <div
                        key={h.id}
                        className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/30 flex items-center justify-between text-xs"
                      >
                        <span className="font-semibold text-gray-200">{h.title}</span>
                        <span className="text-emerald-400">🔥 Streak: {h.currentStreak} วัน</span>
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
