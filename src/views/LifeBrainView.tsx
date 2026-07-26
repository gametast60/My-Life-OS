import React, { useState, useMemo } from "react";
import {
  BrainCard,
  BrainType,
  LifeDimension,
  BRAIN_TYPES,
  LIFE_DIMENSIONS,
  JournalEntry,
} from "../types";
import {
  Brain,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  ChevronDown,
  Link,
  Tag,
  Calendar,
  BookOpen,
} from "lucide-react";
import { BrainCardModal } from "../components/BrainCardModal";

interface LifeBrainViewProps {
  brainCards: BrainCard[];
  journals: JournalEntry[];
  onAddCard: (card: BrainCard) => void;
  onEditCard: (card: BrainCard) => void;
  onDeleteCard: (id: string) => void;
}

const DIM_COLORS: Record<LifeDimension, string> = {
  work:         "#6B9361",
  finance:      "#B8860B",
  relationship: "#B07070",
  health:       "#4E8080",
  mindset:      "#7B68EE",
  learning:     "#4682B4",
  emotion:      "#CD853F",
  goal:         "#8FBC8F",
  lifestyle:    "#708090",
  values:       "#9370DB",
  hobby:        "#DA70D6",
  identity:     "#5F9EA0",
};

const TYPE_COLORS: Record<BrainType, string> = {
  Goal:         "#4E7345",
  Habit:        "#6B9361",
  Knowledge:    "#4682B4",
  Belief:       "#9370DB",
  Identity:     "#5F9EA0",
  Preference:   "#CD853F",
  Skill:        "#4E8080",
  Strength:     "#8FBC8F",
  Weakness:     "#B07070",
  Decision:     "#708090",
  Relationship: "#B07070",
};

export const LifeBrainView: React.FC<LifeBrainViewProps> = ({
  brainCards,
  journals,
  onAddCard,
  onEditCard,
  onDeleteCard,
}) => {
  const [selectedDimension, setSelectedDimension] = useState<LifeDimension | "all">("all");
  const [selectedType, setSelectedType] = useState<BrainType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCard, setSelectedCard] = useState<BrainCard | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<BrainCard | null>(null);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Stats per dimension
  const dimStats = useMemo(() => {
    const counts: Partial<Record<LifeDimension, number>> = {};
    brainCards.forEach((c) => {
      counts[c.dimension] = (counts[c.dimension] || 0) + 1;
    });
    return counts;
  }, [brainCards]);

  // Filtered cards
  const filteredCards = useMemo(() => {
    return brainCards.filter((card) => {
      const dimOk = selectedDimension === "all" || card.dimension === selectedDimension;
      const typeOk = selectedType === "all" || card.brainType === selectedType;
      const q = searchQuery.toLowerCase();
      const searchOk =
        !q ||
        card.title.toLowerCase().includes(q) ||
        card.description.toLowerCase().includes(q) ||
        card.tags.some((t) => t.toLowerCase().includes(q));
      return dimOk && typeOk && searchOk;
    });
  }, [brainCards, selectedDimension, selectedType, searchQuery]);

  // Linked journals for selected card
  const linkedJournals = useMemo(() => {
    if (!selectedCard) return [];
    return journals.filter(
      (j) =>
        selectedCard.linkedJournalIds.includes(j.id) ||
        j.linkedBrainCardIds.includes(selectedCard.id)
    );
  }, [selectedCard, journals]);

  const handleAdd = () => {
    setEditingCard(null);
    setIsModalOpen(true);
  };

  const handleEdit = (card: BrainCard, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCard(card);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmId(id);
  };

  const confirmDelete = (id: string) => {
    onDeleteCard(id);
    setDeleteConfirmId(null);
    if (selectedCard?.id === id) setSelectedCard(null);
  };

  const handleSaveCard = (card: BrainCard) => {
    if (editingCard) {
      onEditCard(card);
    } else {
      onAddCard(card);
    }
    setIsModalOpen(false);
    setEditingCard(null);
  };

  return (
    <div className="min-h-screen" style={{ background: "#0A0E0A" }}>
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 pt-4 pb-3" style={{ background: "rgba(10,14,10,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(107,147,97,0.15)" }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #4E7345, #6B9361)" }}>
                <Brain size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: "#EBF1EA" }}>Life Brain</h1>
                <p className="text-xs" style={{ color: "#869883" }}>{brainCards.length} Brain Cards</p>
              </div>
            </div>
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(135deg, #4E7345, #6B9361)", color: "white" }}
            >
              <Plus size={16} />
              เพิ่มการ์ด
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#869883" }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหา Brain Cards..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(107,147,97,0.2)", color: "#EBF1EA" }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#869883" }}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Dimension Filter */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setSelectedDimension("all")}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: selectedDimension === "all" ? "rgba(107,147,97,0.3)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${selectedDimension === "all" ? "#6B9361" : "rgba(107,147,97,0.15)"}`,
                color: selectedDimension === "all" ? "#6B9361" : "#869883",
              }}
            >
              ทั้งหมด ({brainCards.length})
            </button>
            {LIFE_DIMENSIONS.map((dim) => {
              const count = dimStats[dim.id] || 0;
              if (count === 0) return null;
              return (
                <button
                  key={dim.id}
                  onClick={() => setSelectedDimension(dim.id === selectedDimension ? "all" : dim.id)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: selectedDimension === dim.id ? `${DIM_COLORS[dim.id]}22` : "rgba(255,255,255,0.04)",
                    border: `1px solid ${selectedDimension === dim.id ? DIM_COLORS[dim.id] : "rgba(107,147,97,0.15)"}`,
                    color: selectedDimension === dim.id ? DIM_COLORS[dim.id] : "#869883",
                  }}
                >
                  <span>{dim.emoji}</span>
                  <span>{dim.label}</span>
                  <span style={{ opacity: 0.7 }}>({count})</span>
                </button>
              );
            })}
          </div>

          {/* Brain Type Filter */}
          <div className="mt-2 relative">
            <button
              onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: selectedType !== "all" ? "rgba(107,147,97,0.15)" : "rgba(255,255,255,0.04)",
                border: "1px solid rgba(107,147,97,0.2)",
                color: selectedType !== "all" ? "#6B9361" : "#869883",
              }}
            >
              <span>Brain Type: {selectedType === "all" ? "ทั้งหมด" : selectedType}</span>
              <ChevronDown size={12} />
            </button>
            {isTypeDropdownOpen && (
              <div
                className="absolute top-full left-0 mt-1 z-20 rounded-xl overflow-hidden shadow-2xl"
                style={{ background: "#131a13", border: "1px solid rgba(107,147,97,0.2)", minWidth: "160px" }}
              >
                <button
                  onClick={() => { setSelectedType("all"); setIsTypeDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-white/5 transition-colors"
                  style={{ color: "#EBF1EA" }}
                >
                  ทั้งหมด
                </button>
                {BRAIN_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => { setSelectedType(type); setIsTypeDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-xs hover:bg-white/5 transition-colors"
                    style={{ color: selectedType === type ? "#6B9361" : "#869883" }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        {filteredCards.length === 0 ? (
          <div className="text-center py-20">
            <Brain size={48} className="mx-auto mb-4 opacity-20" style={{ color: "#6B9361" }} />
            <p className="text-lg font-semibold mb-2" style={{ color: "#869883" }}>
              {brainCards.length === 0 ? "Life Brain ว่างอยู่" : "ไม่พบ Brain Card ที่ตรงกัน"}
            </p>
            <p className="text-sm mb-6" style={{ color: "#576656" }}>
              {brainCards.length === 0
                ? "เริ่มสร้าง Brain Card แรกของคุณ — บันทึกเป้าหมาย ความเชื่อ ทักษะ หรือสิ่งที่สำคัญในชีวิต"
                : "ลองเปลี่ยน Filter หรือคำค้นหา"}
            </p>
            {brainCards.length === 0 && (
              <button
                onClick={handleAdd}
                className="px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #4E7345, #6B9361)", color: "white" }}
              >
                + สร้าง Brain Card แรก
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredCards.map((card) => {
              const dim = LIFE_DIMENSIONS.find((d) => d.id === card.dimension);
              const dimColor = DIM_COLORS[card.dimension];
              const typeColor = TYPE_COLORS[card.brainType];
              const isSelected = selectedCard?.id === card.id;

              return (
                <div
                  key={card.id}
                  onClick={() => setSelectedCard(isSelected ? null : card)}
                  className="rounded-xl p-4 cursor-pointer transition-all duration-200 hover:scale-[1.01] group relative"
                  style={{
                    background: isSelected ? `${dimColor}15` : "rgba(255,255,255,0.03)",
                    border: `1px solid ${isSelected ? dimColor : "rgba(107,147,97,0.12)"}`,
                  }}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-lg flex-shrink-0">{dim?.emoji}</span>
                      <h3 className="font-semibold text-sm leading-tight truncate" style={{ color: "#EBF1EA" }}>
                        {card.title}
                      </h3>
                    </div>
                    {/* Actions */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        onClick={(e) => handleEdit(card, e)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                        style={{ color: "#869883" }}
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={(e) => handleDelete(card.id, e)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-500/10 transition-colors"
                        style={{ color: "#B07070" }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  {card.description && (
                    <p className="text-xs mb-3 line-clamp-2" style={{ color: "#869883" }}>
                      {card.description}
                    </p>
                  )}

                  {/* Badges */}
                  <div className="flex items-center flex-wrap gap-1.5">
                    <span
                      className="px-2 py-0.5 rounded-md text-xs font-medium"
                      style={{ background: `${typeColor}20`, color: typeColor }}
                    >
                      {card.brainType}
                    </span>
                    {card.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-md text-xs" style={{ background: "rgba(255,255,255,0.05)", color: "#869883" }}>
                        #{tag}
                      </span>
                    ))}
                    {card.tags.length > 3 && (
                      <span className="text-xs" style={{ color: "#576656" }}>+{card.tags.length - 3}</span>
                    )}
                    {card.linkedJournalIds.length > 0 && (
                      <span className="flex items-center gap-1 text-xs ml-auto" style={{ color: "#576656" }}>
                        <Link size={10} />
                        {card.linkedJournalIds.length}
                      </span>
                    )}
                  </div>

                  {/* Expanded Detail */}
                  {isSelected && (
                    <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(107,147,97,0.15)" }}>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs" style={{ color: "#869883" }}>
                          <span>{dim?.emoji} {dim?.label}</span>
                          <span>•</span>
                          <span style={{ color: typeColor }}>{card.brainType}</span>
                          <span>•</span>
                          <Calendar size={10} />
                          <span>{new Date(card.updatedAt).toLocaleDateString("th-TH")}</span>
                        </div>

                        {/* Linked Journals */}
                        {linkedJournals.length > 0 && (
                          <div>
                            <p className="text-xs font-medium mb-2 flex items-center gap-1.5" style={{ color: "#6B9361" }}>
                              <BookOpen size={11} />
                              Journal ที่เกี่ยวข้อง ({linkedJournals.length})
                            </p>
                            <div className="space-y-1.5">
                              {linkedJournals.slice(0, 3).map((j) => (
                                <div key={j.id} className="flex items-start gap-2 p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                                  <span className="text-sm">{j.mood}</span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate" style={{ color: "#EBF1EA" }}>{j.title || j.date}</p>
                                    <p className="text-xs line-clamp-1" style={{ color: "#869883" }}>{j.content.slice(0, 60)}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* All tags */}
                        {card.tags.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Tag size={10} style={{ color: "#576656" }} />
                            {card.tags.map((tag) => (
                              <span key={tag} className="text-xs px-2 py-0.5 rounded-md" style={{ background: "rgba(107,147,97,0.1)", color: "#6B9361" }}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirm */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="rounded-2xl p-6 w-full max-w-sm" style={{ background: "#131a13", border: "1px solid rgba(107,147,97,0.2)" }}>
            <h3 className="font-bold text-lg mb-2" style={{ color: "#EBF1EA" }}>ลบ Brain Card?</h3>
            <p className="text-sm mb-6" style={{ color: "#869883" }}>การลบไม่สามารถย้อนกลับได้</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: "rgba(255,255,255,0.05)", color: "#869883" }}
              >
                ยกเลิก
              </button>
              <button
                onClick={() => confirmDelete(deleteConfirmId)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: "rgba(176,112,112,0.2)", color: "#B07070" }}
              >
                ลบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Brain Card Modal */}
      <BrainCardModal
        isOpen={isModalOpen}
        editingCard={editingCard}
        journals={journals}
        onSave={handleSaveCard}
        onClose={() => { setIsModalOpen(false); setEditingCard(null); }}
      />
    </div>
  );
};
