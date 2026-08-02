import React, { useState } from "react";
import type { PendingLearning } from "../../pie/bie/types";
import { Check, X, Edit3, RotateCcw, Sparkles, Brain, ChevronDown, ChevronUp } from "lucide-react";

interface BieReviewCardProps {
  item: PendingLearning;
  onConfirm: (id: string, editedPayload?: Record<string, unknown>) => void;
  onReject: (id: string) => void;
  onUndo?: (kind: string, targetId: string) => void;
}

export const BieReviewCard: React.FC<BieReviewCardProps> = ({
  item,
  onConfirm,
  onReject,
  onUndo,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const [showTechDetails, setShowTechDetails] = useState(false);
  const [editedText, setEditedText] = useState(() => {
    if (typeof item.payload === "string") return item.payload;
    if (item.payload && typeof item.payload === "object") {
      return (
        (item.payload.title as string) ||
        (item.payload.description as string) ||
        (item.payload.summary as string) ||
        JSON.stringify(item.payload)
      );
    }
    return item.reason || "";
  });

  // Human-readable kind label
  const getKindBadge = (kind: string) => {
    switch (kind) {
      case "identity_update":
        return { label: "ความเข้าใจตัวตน", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" };
      case "insight":
      case "insight_proposal":
        return { label: "ข้อสังเกตของ AI", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" };
      case "graph_edge":
        return { label: "ความเชื่อมโยง", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" };
      case "graph_merge":
        return { label: "การรวมหัวข้อ", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" };
      default:
        return { label: kind, color: "bg-gray-500/20 text-gray-300 border-gray-500/30" };
    }
  };

  const badge = getKindBadge(item.kind);

  // Human-readable description of what will happen on confirm
  const getConfirmEffect = (kind: string) => {
    switch (kind) {
      case "identity_update":
        return "AI จะเข้าใจตัวตนของคุณตามข้อมูลนี้";
      case "insight":
      case "insight_proposal":
        return "AI จะนำข้อสังเกตนี้มาใช้ในการเข้าใจคุณ";
      case "graph_edge":
        return "AI จะเชื่อมโยงเรื่องราวเหล่านี้เข้าด้วยกัน";
      case "graph_merge":
        return "AI จะรวมหัวข้อที่ซ้ำกันเป็นหนึ่งเดียว";
      default:
        return "AI จะนำข้อมูลนี้มาใช้";
    }
  };

  const handleConfirmAction = () => {
    let payloadToUse: Record<string, unknown> | undefined = undefined;
    if (isEditing && editedText.trim()) {
      if (item.payload && typeof item.payload === "object") {
        payloadToUse = { ...item.payload, title: editedText, summary: editedText, description: editedText };
      } else {
        payloadToUse = { title: editedText };
      }
    }
    onConfirm(item.id, payloadToUse);
    setIsConfirmed(true);
    setIsEditing(false);
  };

  const handleRejectAction = () => {
    onReject(item.id);
    setIsRejected(true);
  };

  const handleUndoAction = () => {
    if (onUndo && item.id) {
      onUndo(item.kind, item.id);
      setIsConfirmed(false);
    }
  };

  if (isRejected) {
    return (
      <div className="p-3 rounded-xl bg-red-950/20 border border-red-900/30 text-red-400 text-xs flex items-center justify-between">
        <span>ไม่ได้นำข้อมูลนี้ไปใช้</span>
        <span className="text-[10px] text-red-400/60">ไม่มีผลต่อ AI</span>
      </div>
    );
  }

  if (isConfirmed) {
    return (
      <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 text-xs flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Check size={14} />
          <span>AI กำลังใช้ข้อมูลนี้แล้ว</span>
        </div>
        {onUndo && (
          <button
            onClick={handleUndoAction}
            className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-emerald-300 transition-all text-[11px]"
          >
            <RotateCcw size={12} />
            <span>เปลี่ยนคำตอบ</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-[#141A14]/80 border border-[#6B9361]/20 hover:border-[#6B9361]/40 transition-all shadow-sm">
      {/* Header Badge & Confidence */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${badge.color}`}>
          {badge.label}
        </span>
        <div className="flex items-center gap-1.5 text-xs text-[#869883]">
          <Sparkles size={12} className="text-amber-400" />
          <span>ความมั่นใจของ AI: {Math.round((item.confidence ?? 0.8) * 100)}%</span>
        </div>
      </div>

      {/* AI Discovery Content */}
      <div className="mb-2">
        {isEditing ? (
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="w-full p-2.5 rounded-lg bg-[#0A0E0A] border border-[#6B9361]/40 text-[#EBF1EA] text-xs focus:outline-none focus:border-emerald-500 min-h-[60px]"
            placeholder="แก้ไขความเข้าใจของ AI..."
          />
        ) : (
          <p className="text-xs text-[#EBF1EA] leading-relaxed font-medium">
            {editedText}
          </p>
        )}

        {item.reason && !isEditing && (
          <p className="mt-1 text-[11px] text-[#869883] italic flex items-center gap-1">
            <Brain size={11} className="shrink-0" />
            <span>เหตุผลที่ AI คิดเช่นนี้: {item.reason}</span>
          </p>
        )}
      </div>

      {/* Confirm Effect Preview */}
      {!isEditing && (
        <div className="mb-3 px-2.5 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/15 text-[11px] text-emerald-400/80">
          ✦ ถ้ายืนยัน: {getConfirmEffect(item.kind)}
        </div>
      )}

      {/* Technical Details (expandable) */}
      <div className="mb-2">
        <button
          onClick={() => setShowTechDetails((v) => !v)}
          className="flex items-center gap-1 text-[10px] text-[#869883]/60 hover:text-[#869883] transition-all"
        >
          {showTechDetails ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
          <span>รายละเอียดเพิ่มเติม</span>
        </button>
        {showTechDetails && (
          <div className="mt-1.5 px-3 py-2 rounded-lg bg-[#0A0E0A] border border-white/8 text-[10px] font-mono text-[#869883] space-y-0.5">
            <div>id: {item.id}</div>
            <div>kind: {item.kind}</div>
            <div>confidence: {item.confidence ?? 0.8}</div>
            {item.payload && (
              <div>payload: {typeof item.payload === "object" ? JSON.stringify(item.payload) : String(item.payload)}</div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-[#869883] hover:text-[#EBF1EA] hover:bg-white/5 transition-all"
        >
          <Edit3 size={13} />
          <span>{isEditing ? "ยกเลิกแก้ไข" : "แก้ไขความเข้าใจของ AI"}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRejectAction}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all font-medium"
          >
            <X size={13} />
            <span>ไม่ใช่ฉัน</span>
          </button>

          <button
            onClick={handleConfirmAction}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-emerald-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:brightness-110 font-semibold shadow-sm transition-all"
          >
            <Check size={13} />
            <span>ใช่ เรื่องนี้ตรงกับฉัน</span>
          </button>
        </div>
      </div>
    </div>
  );
};
