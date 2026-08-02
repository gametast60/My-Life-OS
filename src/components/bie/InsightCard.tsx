import React, { useState } from "react";
import type { Insight, InsightKind } from "../../pie/bie/types";
import {
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Award,
  AlertTriangle,
  Repeat,
  Check,
  X,
  RotateCcw,
  Sparkles,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface InsightCardProps {
  insight: Insight;
  onConfirm: (id: string) => void;
  onReject: (id: string) => void;
  onUndo: (id: string) => void;
}

const KIND_CONFIG: Record<InsightKind, { labelTh: string; icon: React.ReactNode; color: string }> = {
  trend:          { labelTh: "แนวโน้ม",        icon: <TrendingUp size={13} />,  color: "text-sky-400 bg-sky-500/10 border-sky-500/30" },
  anomaly:        { labelTh: "สิ่งผิดปกติ",     icon: <AlertCircle size={13} />, color: "text-red-400 bg-red-500/10 border-red-500/30" },
  progress:       { labelTh: "ความก้าวหน้า",    icon: <CheckCircle2 size={13} />, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  milestone:      { labelTh: "เหตุการณ์สำคัญ", icon: <Award size={13} />,       color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  conflict_alert: { labelTh: "ความขัดแย้ง",     icon: <AlertTriangle size={13} />, color: "text-orange-400 bg-orange-500/10 border-orange-500/30" },
  pattern:        { labelTh: "รูปแบบที่พบ",     icon: <Repeat size={13} />,      color: "text-violet-400 bg-violet-500/10 border-violet-500/30" },
};

export const InsightCard: React.FC<InsightCardProps> = ({
  insight,
  onConfirm,
  onReject,
  onUndo,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [actionDone, setActionDone] = useState<"confirmed" | "rejected" | null>(null);

  const cfg = KIND_CONFIG[insight.kind] ?? {
    labelTh: insight.kind,
    icon: <Sparkles size={13} />,
    color: "text-gray-400 bg-gray-500/10 border-gray-500/30",
  };

  const generatedDate = new Date(insight.generatedAt).toLocaleDateString("th-TH", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  if (actionDone === "rejected") {
    return (
      <div className="p-3 rounded-xl bg-red-950/20 border border-red-900/30 text-red-400 text-xs">
        ไม่ได้นำข้อสังเกตนี้ไปใช้
      </div>
    );
  }

  if (actionDone === "confirmed") {
    return (
      <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 text-xs flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Check size={13} />
          <span>AI กำลังใช้ข้อสังเกตนี้แล้ว</span>
        </div>
        <button
          onClick={() => { onUndo(insight.id); setActionDone(null); }}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-emerald-300 text-[11px] transition-all"
        >
          <RotateCcw size={11} />
          <span>เปลี่ยนคำตอบ</span>
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-[#141A14]/80 border border-[#6B9361]/20 hover:border-[#6B9361]/40 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.color}`}>
            {cfg.icon}
            {cfg.labelTh}
          </span>
          <h4 className="text-xs font-semibold text-[#EBF1EA] truncate">{insight.title}</h4>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${
            insight.applied
              ? "bg-emerald-500/15 text-emerald-400"
              : "bg-amber-500/15 text-amber-400"
          }`}>
            {insight.applied ? "✅ ใช้งานแล้ว" : "⏳ รอการตัดสินใจ"}
          </span>
          <div className="flex items-center gap-1 text-[11px] text-[#869883]">
            <Sparkles size={11} className="text-amber-400" />
            <span>{Math.round((insight.confidence ?? 0.8) * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-[#B0BDB0] leading-relaxed mb-2">{insight.description}</p>

      {/* Evidence Context (expandable) */}
      {insight.dataContext && Object.keys(insight.dataContext).length > 0 && (
        <div>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-[11px] text-[#869883] hover:text-[#EBF1EA] transition-all mb-1"
          >
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            <span>รายละเอียดเพิ่มเติม</span>
          </button>
          {expanded && (
            <div className="px-3 py-2 rounded-lg bg-[#0A0E0A] border border-white/8 text-[11px] text-[#869883] font-mono">
              {Object.entries(insight.dataContext).map(([k, v]) => (
                <div key={k}>
                  <span className="text-emerald-400">{k}:</span>{" "}
                  <span>{typeof v === "object" ? JSON.stringify(v) : String(v)}</span>
                </div>
              ))}
              <div className="mt-1 pt-1 border-t border-white/5">
                <span className="text-emerald-400">id:</span> {insight.id}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer: date + actions */}
      <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-white/5 mt-2">
        <div className="flex items-center gap-1 text-[11px] text-[#869883]">
          <Clock size={11} />
          <span>{generatedDate}</span>
        </div>

        {insight.applied ? (
          <button
            onClick={() => { onUndo(insight.id); }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-500/10 border border-orange-500/20 text-orange-300 hover:bg-orange-500/20 transition-all"
          >
            <RotateCcw size={12} />
            <span>เปลี่ยนคำตอบ</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => { onReject(insight.id); setActionDone("rejected"); }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
            >
              <X size={12} />
              <span>ไม่ใช่ฉัน</span>
            </button>
            <button
              onClick={() => { onConfirm(insight.id); setActionDone("confirmed"); }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-400 to-teal-400 text-emerald-950 hover:brightness-110 transition-all shadow-sm"
            >
              <Check size={12} />
              <span>ใช่ เรื่องนี้ตรงกับฉัน</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
