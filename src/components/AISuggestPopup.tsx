import React, { useState, useEffect, useRef } from "react";
import { BrainCard, LifeDimension, LIFE_DIMENSIONS } from "../types";
import { Brain, X, Plus, Edit2, Check } from "lucide-react";
import { useAutoResizeTextarea } from "../hooks/useAutoResizeTextarea";

interface AISuggestPopupProps {
  card: Partial<BrainCard> | null;
  onConfirm: (card: Partial<BrainCard>) => void;
  onDismiss: () => void;
}

export const AISuggestPopup: React.FC<AISuggestPopupProps> = ({ card, onConfirm, onDismiss }) => {
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDesc, setEditedDesc] = useState("");
  const [editedDimension, setEditedDimension] = useState<LifeDimension>("mindset");
  const [editedTags, setEditedTags] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  const descField = useAutoResizeTextarea(editedDesc, { minRows: 3, maxRows: 9 });

  useEffect(() => {
    if (card) {
      setEditedTitle(card.title || "");
      setEditedDesc(card.description || "");
      setEditedDimension(card.dimension || "mindset");
      setEditedTags(card.tags || []);
      setIsEditing(false);
    }
  }, [card]);

  if (!card) return null;

  const handleConfirmSave = () => {
    onConfirm({
      ...card,
      title: editedTitle.trim() || card.title,
      description: editedDesc.trim(),
      dimension: editedDimension,
      tags: editedTags,
    });
  };

  return (
    <div
      className="fixed bottom-24 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300"
      style={{ maxWidth: "440px", margin: "0 auto" }}
    >
      <div
        className="rounded-3xl p-5 shadow-2xl space-y-4"
        style={{
          background: "linear-gradient(135deg, #131a13, #1a221a)",
          border: "1px solid rgba(107,147,97,0.35)",
          backdropFilter: "blur(16px)",
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #4E7345, #6B9361)" }}
            >
              <Brain size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#EBF1EA]">AI สกัดข้อมูลจากบทสนทนา (Thai Preview)</p>
              <p className="text-[11px] text-[#869883]">คุณสามารถตรวจสอบและแก้ไขข้อมูลก่อนบันทึกได้</p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 text-[#869883] hover:text-[#EBF1EA]"
          >
            <X size={14} />
          </button>
        </div>

        {/* Editable Preview Form */}
        <div className="space-y-3 p-3.5 rounded-2xl bg-[#182018] border border-[#223022]">
          {/* Title Edit */}
          <div>
            <label className="text-[11px] font-semibold text-[#869883] block mb-1">ชื่อหัวข้อ (Title):</label>
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-[#131913] border border-[#4E7345] text-xs text-[#EBF1EA] outline-none"
            />
          </div>

          {/* Description Edit */}
          <div>
            <label className="text-[11px] font-semibold text-[#869883] block mb-1">รายละเอียด (Description):</label>
            <textarea
              {...descField.textAreaProps}
              ref={descField.ref}
              onChange={(e) => setEditedDesc(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-[#131913] border border-[#4E7345] text-xs text-[#EBF1EA] outline-none resize-none leading-relaxed overflow-hidden"
            />
          </div>

          {/* Dimension Selector */}
          <div>
            <label className="text-[11px] font-semibold text-[#869883] block mb-1">หัวข้อ/มิติ (Dimension):</label>
            <select
              value={editedDimension}
              onChange={(e) => setEditedDimension(e.target.value as LifeDimension)}
              className="w-full px-3 py-1.5 rounded-xl bg-[#131913] border border-[#4E7345] text-xs text-[#EBF1EA] outline-none cursor-pointer"
            >
              {LIFE_DIMENSIONS.map((dim) => (
                <option key={dim.id} value={dim.id}>
                  {dim.emoji} {dim.label} ({dim.id})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons: Confirm (Save) / Cancel */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={onDismiss}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-gray-700 hover:bg-gray-600 text-white transition-colors"
          >
            ยกเลิก (Cancel)
          </button>
          <button
            onClick={handleConfirmSave}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all hover:scale-[1.02]"
            style={{ background: "linear-gradient(135deg, #4E7345, #6B9361)" }}
          >
            <Check size={14} />
            บันทึกลง Life Brain
          </button>
        </div>
      </div>
    </div>
  );
};
