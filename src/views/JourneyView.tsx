import React, { useState } from "react";
import { BrainCard, JournalEntry, UserSettings, LIFE_DIMENSIONS } from "../types";
import { Brain, Sparkles, Layers, ArrowUpDown, Filter, BookOpen, Target } from "lucide-react";

interface JourneyViewProps {
  brainCards: BrainCard[];
  journals: JournalEntry[];
  settings: UserSettings;
  onOpenLifeBrain?: () => void;
}

type SortOption = "most-used" | "a-z" | "manual";

export const JourneyView: React.FC<JourneyViewProps> = ({ brainCards, journals, onOpenLifeBrain }) => {
  const [sortOption, setSortOption] = useState<SortOption>("most-used");
  const [filterQuery, setFilterQuery] = useState("");

  // Aggregate all dynamic topics across Brain Cards and Journals
  const topicMap: Record<string, { name: string; emoji: string; count: number; cardCount: number; journalCount: number }> = {};

  // 1. Initialize from LIFE_DIMENSIONS
  LIFE_DIMENSIONS.forEach((dim) => {
    topicMap[dim.id] = {
      name: dim.label,
      emoji: dim.emoji,
      count: 0,
      cardCount: 0,
      journalCount: 0,
    };
  });

  // 2. Count Brain Cards per topic/dimension
  brainCards.forEach((card) => {
    const dimKey = card.dimension || "mindset";
    if (!topicMap[dimKey]) {
      topicMap[dimKey] = { name: dimKey, emoji: "💡", count: 0, cardCount: 0, journalCount: 0 };
    }
    topicMap[dimKey].count += 1;
    topicMap[dimKey].cardCount += 1;

    // Custom tags as dynamic topics
    card.tags.forEach((tag) => {
      const cleanTag = tag.trim().replace(/^#/, "");
      if (cleanTag) {
        if (!topicMap[cleanTag]) {
          topicMap[cleanTag] = { name: cleanTag, emoji: "🏷️", count: 0, cardCount: 0, journalCount: 0 };
        }
        topicMap[cleanTag].count += 1;
        topicMap[cleanTag].cardCount += 1;
      }
    });
  });

  // Convert to array and filter out empty topics if query typed
  let topicsList = Object.values(topicMap).filter((t) =>
    t.name.toLowerCase().includes(filterQuery.toLowerCase())
  );

  // Maximum count for percentage progress bar calculation
  const maxCount = Math.max(1, ...topicsList.map((t) => t.count));

  // Sorting logic
  if (sortOption === "most-used") {
    topicsList.sort((a, b) => b.count - a.count);
  } else if (sortOption === "a-z") {
    topicsList.sort((a, b) => a.name.localeCompare(b.name, "th"));
  }

  const totalEntriesAccumulated = brainCards.length;

  return (
    <div className="space-y-6 pb-28 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3">
        <div>
          <span className="text-xs font-bold tracking-[0.2em] text-[#6B9361] uppercase flex items-center gap-1.5">
            <Brain className="w-4 h-4 text-[#6B9361]" /> Brain Topic Status
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#EBF1EA]">Brain Dashboard</h2>
          <p className="text-xs text-[#869883]">
            แสดงสถานะและจำนวนสะสมของหัวข้อในสมองของคุณ (Dynamic Topic Tracking)
          </p>
        </div>

        {/* Total Badge */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-[#131913] border border-[#1F2B1F] shadow-sm text-right">
            <span className="text-[10px] font-mono text-[#869883] uppercase block">ข้อมูลสะสมทั้งหมด</span>
            <span className="text-lg font-bold text-[#6B9361] font-mono">{totalEntriesAccumulated} รายการ</span>
          </div>
          {onOpenLifeBrain && (
            <button
              onClick={onOpenLifeBrain}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/20 text-emerald-300 transition-all"
            >
              <Brain size={14} />
              Life Brain ({brainCards.length})
            </button>
          )}
        </div>
      </div>

      {/* Control Bar: Search & Sort */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-3.5 rounded-2xl bg-[#131913] border border-[#1F2B1F] shadow-md">
        {/* Search */}
        <div className="w-full sm:w-72 relative">
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="ค้นหาหัวข้อสมอง..."
            className="w-full px-3.5 py-2 rounded-xl bg-[#182018] border border-[#223022] text-xs text-[#EBF1EA] placeholder-[#556653] focus:outline-none focus:border-[#4E7345]"
          />
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-[#869883] flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#6B9361]" /> เรียงลำดับ:
          </span>
          <div className="flex gap-1 bg-[#182018] p-1 rounded-xl border border-[#223022]">
            <button
              onClick={() => setSortOption("most-used")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                sortOption === "most-used"
                  ? "bg-[#3F5C3A] text-white shadow-sm"
                  : "text-[#869883] hover:text-[#EBF1EA]"
              }`}
            >
              สะสมสูงสุด
            </button>
            <button
              onClick={() => setSortOption("a-z")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                sortOption === "a-z"
                  ? "bg-[#3F5C3A] text-white shadow-sm"
                  : "text-[#869883] hover:text-[#EBF1EA]"
              }`}
            >
              ก-ฮ / A-Z
            </button>
            <button
              onClick={() => setSortOption("manual")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                sortOption === "manual"
                  ? "bg-[#3F5C3A] text-white shadow-sm"
                  : "text-[#869883] hover:text-[#EBF1EA]"
              }`}
            >
              ทั่วไป
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Topic Progress Bar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topicsList.map((topic) => {
          const percent = Math.min(100, Math.round((topic.count / maxCount) * 100));

          return (
            <div
              key={topic.name}
              className="p-4 rounded-2xl bg-[#131913] border border-[#1F2B1F] hover:border-[#273727] transition-all space-y-2.5 shadow-md"
            >
              {/* Topic Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{topic.emoji}</span>
                  <h3 className="font-bold text-sm text-[#EBF1EA] capitalize">{topic.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-extrabold text-[#6B9361] bg-[#182218] px-2.5 py-1 rounded-xl border border-[#273727]">
                    {topic.count} รายการ
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="h-2.5 w-full bg-[#182018] rounded-full overflow-hidden border border-[#223022]">
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[#4E7345] to-[#6B9361]"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono text-[#869883] pt-0.5">
                  <span className="flex items-center gap-2">
                    <span className="flex items-center gap-0.5">
                      <Brain className="w-3 h-3 text-[#6B9361]" /> {topic.cardCount} Cards
                    </span>
                  </span>
                  <span>{percent}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
