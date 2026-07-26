import React, { useEffect, useRef } from "react";
import { BrainCard, BRAIN_TYPES, LIFE_DIMENSIONS } from "../types";
import { Brain, X, Plus } from "lucide-react";

interface AISuggestPopupProps {
  card: Partial<BrainCard> | null;
  onConfirm: (card: Partial<BrainCard>) => void;
  onDismiss: () => void;
}

export const AISuggestPopup: React.FC<AISuggestPopupProps> = ({ card, onConfirm, onDismiss }) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (card) {
      timerRef.current = setTimeout(onDismiss, 15000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [card, onDismiss]);

  if (!card) return null;

  const dim = LIFE_DIMENSIONS.find((d) => d.id === card.dimension);

  return (
    <div
      className="fixed bottom-24 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300"
      style={{ maxWidth: "420px", margin: "0 auto" }}
    >
      <div
        className="rounded-2xl p-4 shadow-2xl"
        style={{
          background: "linear-gradient(135deg, #131a13, #1a221a)",
          border: "1px solid rgba(107,147,97,0.35)",
          backdropFilter: "blur(16px)",
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #4E7345, #6B9361)" }}
            >
              <Brain size={15} className="text-white" />
            </div>
            <p className="text-sm font-semibold" style={{ color: "#EBF1EA" }}>
              AI พบข้อมูลที่น่าบันทึก
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors flex-shrink-0"
            style={{ color: "#869883" }}
          >
            <X size={13} />
          </button>
        </div>

        {/* Card Preview */}
        <div
          className="rounded-xl p-3 mb-4"
          style={{ background: "rgba(107,147,97,0.08)", border: "1px solid rgba(107,147,97,0.15)" }}
        >
          <p className="text-sm font-semibold mb-1" style={{ color: "#EBF1EA" }}>
            {card.title}
          </p>
          {card.description && (
            <p className="text-xs mb-2" style={{ color: "#869883" }}>
              {card.description.slice(0, 80)}
            </p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            {dim && (
              <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: "rgba(107,147,97,0.15)", color: "#6B9361" }}>
                {dim.emoji} {dim.label}
              </span>
            )}
            {card.brainType && (
              <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: "rgba(78,115,69,0.15)", color: "#8FBC8F" }}>
                {card.brainType}
              </span>
            )}
            {card.tags?.slice(0, 2).map((tag) => (
              <span key={tag} className="text-xs" style={{ color: "#576656" }}>
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onDismiss}
            className="flex-1 py-2.5 rounded-xl text-xs font-medium transition-colors"
            style={{ background: "rgba(255,255,255,0.04)", color: "#869883" }}
          >
            ยกเลิก
          </button>
          <button
            onClick={() => onConfirm(card)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02] active:scale-95"
            style={{ background: "linear-gradient(135deg, #4E7345, #6B9361)", color: "white" }}
          >
            <Plus size={13} />
            เพิ่มลง Life Brain
          </button>
        </div>

        {/* Auto-dismiss indicator */}
        <div className="mt-2 h-0.5 rounded-full overflow-hidden" style={{ background: "rgba(107,147,97,0.15)" }}>
          <div
            className="h-full rounded-full"
            style={{
              background: "#6B9361",
              animation: "shrink-x 15s linear forwards",
              transformOrigin: "left",
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes shrink-x {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
};
