import React, { useEffect, useState, useRef } from "react";
import {
  BrainCard,
  BrainType,
  LifeDimension,
  BRAIN_TYPES,
  LIFE_DIMENSIONS,
  JournalEntry,
} from "../types";
import { X, Plus, ChevronDown, Search, Link } from "lucide-react";

interface BrainCardModalProps {
  isOpen: boolean;
  editingCard: BrainCard | null;
  journals: JournalEntry[];
  onSave: (card: BrainCard) => void;
  onClose: () => void;
}

export const BrainCardModal: React.FC<BrainCardModalProps> = ({
  isOpen,
  editingCard,
  journals,
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState(editingCard?.title ?? "");
  const [description, setDescription] = useState(editingCard?.description ?? "");
  const [dimension, setDimension] = useState<LifeDimension>(editingCard?.dimension ?? "goal");
  const [brainType, setBrainType] = useState<BrainType>(editingCard?.brainType ?? "Goal");
  const [tags, setTags] = useState<string[]>(editingCard?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [linkedJournalIds, setLinkedJournalIds] = useState<string[]>(editingCard?.linkedJournalIds ?? []);
  const [isDimOpen, setIsDimOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [linkSearch, setLinkSearch] = useState("");
  const [errors, setErrors] = useState<{ title?: string; dimension?: string; brainType?: string }>({});
  const tagInputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens/editingCard changes
  React.useEffect(() => {
    if (isOpen) {
      setTitle(editingCard?.title ?? "");
      setDescription(editingCard?.description ?? "");
      setDimension(editingCard?.dimension ?? "goal");
      setBrainType(editingCard?.brainType ?? "Goal");
      setTags(editingCard?.tags ?? []);
      setLinkedJournalIds(editingCard?.linkedJournalIds ?? []);
      setTagInput("");
      setErrors({});
    }
  }, [isOpen, editingCard]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const selectedDim = LIFE_DIMENSIONS.find((d) => d.id === dimension);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!title.trim()) newErrors.title = "กรุณากรอก Title";
    if (!dimension) newErrors.dimension = "กรุณาเลือก Dimension";
    if (!brainType) newErrors.brainType = "กรุณาเลือก Brain Type";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const now = Date.now();
    const card: BrainCard = {
      id: editingCard?.id ?? `brain-${now}-${Math.random().toString(36).slice(2, 7)}`,
      title: title.trim(),
      description: description.trim(),
      dimension,
      brainType,
      tags,
      linkedJournalIds,
      createdAt: editingCard?.createdAt ?? now,
      updatedAt: now,
    };
    onSave(card);
  };

  const addTag = (e?: React.KeyboardEvent) => {
    if (e && e.key !== "Enter" && e.key !== ",") return;
    e?.preventDefault();
    const t = tagInput.trim().replace(/^#/, "");
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const toggleJournalLink = (jid: string) => {
    setLinkedJournalIds((prev) =>
      prev.includes(jid) ? prev.filter((id) => id !== jid) : [...prev, jid]
    );
  };

  const filteredJournals = journals
    .filter((j) => {
      const q = linkSearch.toLowerCase();
      return !q || j.title.toLowerCase().includes(q) || j.content.toLowerCase().includes(q);
    })
    .slice(0, 20);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl overflow-hidden flex flex-col"
        style={{ background: "#131a13", border: "1px solid rgba(107,147,97,0.2)", maxHeight: "92vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4" style={{ borderBottom: "1px solid rgba(107,147,97,0.1)" }}>
          <h2 className="text-lg font-bold" style={{ color: "#EBF1EA" }}>
            {editingCard ? "แก้ไข Brain Card" : "เพิ่ม Brain Card"}
          </h2>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all hover:bg-white/10"
            style={{ color: "#869883", border: "1px solid rgba(107,147,97,0.15)" }}
          >
            <X size={14} />
            <span>ปิด</span>
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#869883" }}>
              Title <span style={{ color: "#B07070" }}>*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น เป็น Trader เต็มเวลา"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${errors.title ? "#B07070" : "rgba(107,147,97,0.2)"}`,
                color: "#EBF1EA",
              }}
            />
            {errors.title && <p className="text-xs mt-1" style={{ color: "#B07070" }}>{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#869883" }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="รายละเอียดเพิ่มเติม..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all resize-none"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(107,147,97,0.2)", color: "#EBF1EA" }}
            />
          </div>

          {/* Life Dimension */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#869883" }}>
              Life Dimension <span style={{ color: "#B07070" }}>*</span>
            </label>
            <div className="relative">
              <button
                onClick={() => setIsDimOpen(!isDimOpen)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${errors.dimension ? "#B07070" : "rgba(107,147,97,0.2)"}`,
                  color: "#EBF1EA",
                }}
              >
                <span>{selectedDim ? `${selectedDim.emoji} ${selectedDim.label}` : "เลือก Dimension"}</span>
                <ChevronDown size={14} style={{ color: "#869883" }} />
              </button>
              {isDimOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 z-20 rounded-xl overflow-hidden shadow-2xl" style={{ background: "#1a221a", border: "1px solid rgba(107,147,97,0.2)" }}>
                  <div className="max-h-52 overflow-y-auto">
                    {LIFE_DIMENSIONS.map((dim) => (
                      <button
                        key={dim.id}
                        onClick={() => { setDimension(dim.id); setIsDimOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left"
                        style={{ color: dimension === dim.id ? "#6B9361" : "#EBF1EA" }}
                      >
                        <span className="text-base">{dim.emoji}</span>
                        <span className="text-sm">{dim.label}</span>
                        {dimension === dim.id && <span className="ml-auto text-xs" style={{ color: "#6B9361" }}>✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {errors.dimension && <p className="text-xs mt-1" style={{ color: "#B07070" }}>{errors.dimension}</p>}
          </div>

          {/* Brain Type */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#869883" }}>
              Brain Type <span style={{ color: "#B07070" }}>*</span>
            </label>
            <div className="relative">
              <button
                onClick={() => setIsTypeOpen(!isTypeOpen)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${errors.brainType ? "#B07070" : "rgba(107,147,97,0.2)"}`,
                  color: "#EBF1EA",
                }}
              >
                <span>{brainType || "เลือก Brain Type"}</span>
                <ChevronDown size={14} style={{ color: "#869883" }} />
              </button>
              {isTypeOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 z-20 rounded-xl overflow-hidden shadow-2xl" style={{ background: "#1a221a", border: "1px solid rgba(107,147,97,0.2)" }}>
                  <div className="max-h-52 overflow-y-auto">
                    {BRAIN_TYPES.map((type) => (
                      <button
                        key={type}
                        onClick={() => { setBrainType(type); setIsTypeOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors"
                        style={{ color: brainType === type ? "#6B9361" : "#EBF1EA" }}
                      >
                        {type}
                        {brainType === type && <span className="ml-2 text-xs" style={{ color: "#6B9361" }}>✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#869883" }}>Tags</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs"
                  style={{ background: "rgba(107,147,97,0.15)", color: "#6B9361" }}
                >
                  #{tag}
                  <button onClick={() => removeTag(tag)}><X size={10} /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                ref={tagInputRef}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={addTag}
                placeholder="พิมพ์ tag แล้วกด Enter"
                className="flex-1 px-3 py-2 rounded-lg text-xs outline-none"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(107,147,97,0.2)", color: "#EBF1EA" }}
              />
              <button
                onClick={() => addTag()}
                className="px-3 py-2 rounded-lg text-xs"
                style={{ background: "rgba(107,147,97,0.15)", color: "#6B9361" }}
              >
                <Plus size={12} />
              </button>
            </div>
          </div>

          {/* Link Journal */}
          <div>
            <button
              onClick={() => setIsLinkOpen(!isLinkOpen)}
              className="flex items-center gap-2 text-xs font-medium mb-2 transition-colors"
              style={{ color: isLinkOpen ? "#6B9361" : "#869883" }}
            >
              <Link size={12} />
              Link Journal ({linkedJournalIds.length} รายการ)
              <ChevronDown size={12} className={`transition-transform ${isLinkOpen ? "rotate-180" : ""}`} />
            </button>
            {isLinkOpen && (
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(107,147,97,0.15)" }}>
                <div className="p-2" style={{ borderBottom: "1px solid rgba(107,147,97,0.1)" }}>
                  <div className="relative">
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "#869883" }} />
                    <input
                      value={linkSearch}
                      onChange={(e) => setLinkSearch(e.target.value)}
                      placeholder="ค้นหา journal..."
                      className="w-full pl-7 pr-3 py-1.5 text-xs rounded-lg outline-none"
                      style={{ background: "rgba(255,255,255,0.04)", color: "#EBF1EA" }}
                    />
                  </div>
                </div>
                <div className="max-h-40 overflow-y-auto">
                  {filteredJournals.length === 0 ? (
                    <p className="text-center py-4 text-xs" style={{ color: "#576656" }}>ไม่พบ Journal</p>
                  ) : (
                    filteredJournals.map((j) => (
                      <button
                        key={j.id}
                        onClick={() => toggleJournalLink(j.id)}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 transition-colors text-left"
                      >
                        <div
                          className="w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border transition-all"
                          style={{
                            background: linkedJournalIds.includes(j.id) ? "#4E7345" : "transparent",
                            borderColor: linkedJournalIds.includes(j.id) ? "#4E7345" : "#576656",
                          }}
                        >
                          {linkedJournalIds.includes(j.id) && <span className="text-white text-xs">✓</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate" style={{ color: "#EBF1EA" }}>
                            {j.title || j.date}
                          </p>
                          <p className="text-xs truncate" style={{ color: "#869883" }}>{j.date}</p>
                        </div>
                        <span className="text-sm">{j.mood}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex gap-3" style={{ borderTop: "1px solid rgba(107,147,97,0.1)" }}>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-medium transition-colors"
            style={{ background: "rgba(255,255,255,0.05)", color: "#869883" }}
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-95"
            style={{ background: "linear-gradient(135deg, #4E7345, #6B9361)", color: "white" }}
          >
            {editingCard ? "บันทึกการแก้ไข" : "เพิ่มลง Brain"}
          </button>
        </div>
      </div>
    </div>
  );
};
