import React, { useState, useEffect } from "react";
import { Brain, User, Lightbulb, Calendar, Check, ShieldOff, Sparkles } from "lucide-react";
import { getBieContextSummary } from "../../pie/bie/bieDiscoveryService";

interface BieContextStatusBadgeProps {
  bieEnabled?: boolean;
  onOpenDiscovery?: () => void;
  onOpenIdentityReview?: () => void;
  onOpenInsightCenter?: () => void;
  onOpenTimelineViewer?: () => void;
}

export const BieContextStatusBadge: React.FC<BieContextStatusBadgeProps> = ({
  bieEnabled = true,
  onOpenDiscovery,
  onOpenIdentityReview,
  onOpenInsightCenter,
  onOpenTimelineViewer,
}) => {
  const [summary, setSummary] = useState(() => getBieContextSummary(bieEnabled));

  useEffect(() => {
    setSummary(getBieContextSummary(bieEnabled));
  }, [bieEnabled]);

  if (!bieEnabled) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
        <ShieldOff size={13} />
        <span>AI ยังไม่พร้อมทำงาน</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 rounded-xl bg-[#141A14]/90 border border-[#6B9361]/25">
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
        <Brain size={14} className="text-emerald-400" />
        <span>AI Context</span>
      </div>

      {/* Identity Badge */}
      <button
        onClick={onOpenIdentityReview}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
          summary.identityApplied
            ? "bg-violet-500/15 text-violet-300 border-violet-500/30 hover:bg-violet-500/25"
            : "bg-white/5 text-[#869883] border-white/10 hover:bg-white/10 hover:text-[#EBF1EA]"
        }`}
        title="ดู AI เข้าใจคุณอย่างไร"
      >
        <User size={12} />
        <span>ความเข้าใจ: {summary.identityApplied ? "✅ ยืนยันแล้ว" : "⏳ รอการตัดสินใจ"}</span>
      </button>

      {/* Insights Badge */}
      <button
        onClick={onOpenInsightCenter}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
          summary.appliedInsightCount > 0
            ? "bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25"
            : "bg-white/5 text-[#869883] border-white/10 hover:bg-white/10 hover:text-[#EBF1EA]"
        }`}
        title="ดูสิ่งที่ AI สังเกตเห็น"
      >
        <Lightbulb size={12} />
        <span>ข้อสังเกต: {summary.appliedInsightCount} รายการ</span>
        {summary.pendingInsightCount > 0 && (
          <span className="text-[10px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
            +{summary.pendingInsightCount}
          </span>
        )}
      </button>

      {/* Timeline Badge */}
      <button
        onClick={onOpenTimelineViewer}
        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border border-teal-500/30 bg-teal-500/15 text-teal-300 hover:bg-teal-500/25 transition-all"
        title="ดูเส้นทางชีวิตของคุณ"
      >
        <Calendar size={12} />
        <span>เส้นทางชีวิต: {summary.timelineBucketCount} ช่วง</span>
      </button>

      {/* Discovery Hub */}
      {onOpenDiscovery && (
        <button
          onClick={onOpenDiscovery}
          className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:brightness-110 transition-all"
        >
          <Sparkles size={12} />
          <span>สิ่งที่ AI ค้นพบ</span>
        </button>
      )}
    </div>
  );
};
