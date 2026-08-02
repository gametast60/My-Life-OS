import React, { useState, useEffect } from "react";
import { X, Lightbulb, RefreshCw, ShieldOff, Filter, Sparkles } from "lucide-react";
import {
  getBieInsights,
  confirmBieInsight,
  rejectBieInsight,
  undoAppliedBieItem,
} from "../../pie/bie/bieDiscoveryService";
import type { Insight, InsightKind } from "../../pie/bie/types";
import { InsightCard } from "./InsightCard";

interface InsightCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  bieEnabled?: boolean;
}

const KIND_FILTERS: { id: InsightKind | "all"; label: string }[] = [
  { id: "all",           label: "ทั้งหมด" },
  { id: "trend",         label: "แนวโน้ม" },
  { id: "anomaly",       label: "ความผิดปกติ" },
  { id: "progress",      label: "ความก้าวหน้า" },
  { id: "milestone",     label: "เหตุการณ์สำคัญ" },
  { id: "conflict_alert",label: "ความขัดแย้ง" },
  { id: "pattern",       label: "รูปแบบ" },
];

export const InsightCenterModal: React.FC<InsightCenterModalProps> = ({
  isOpen,
  onClose,
  bieEnabled = true,
}) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [filterKind, setFilterKind] = useState<InsightKind | "all">("all");
  const [showAppliedOnly, setShowAppliedOnly] = useState(false);

  const reload = () => {
    const all = getBieInsights(undefined, bieEnabled);
    setInsights(all);
  };

  useEffect(() => {
    if (isOpen) reload();
  }, [isOpen, bieEnabled]);

  const displayed = insights.filter((ins) => {
    if (filterKind !== "all" && ins.kind !== filterKind) return false;
    if (showAppliedOnly && !ins.applied) return false;
    return true;
  });

  const pendingCount = insights.filter((i) => !i.applied).length;
  const appliedCount = insights.filter((i) => i.applied).length;

  const handleConfirm = (id: string) => {
    confirmBieInsight(id);
    reload();
  };

  const handleReject = (id: string) => {
    rejectBieInsight(id);
    reload();
  };

  const handleUndo = (id: string) => {
    undoAppliedBieItem("insight", id);
    reload();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0A0E0A] border border-[#6B9361]/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#6B9361]/20 bg-[#141A14]/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 text-amber-400 border border-amber-500/30">
              <Lightbulb size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#EBF1EA] flex items-center gap-2">
                สิ่งที่ AI สังเกตเห็น
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                  รอการตัดสินใจ
                </span>
              </h2>
              <p className="text-xs text-[#869883]">
                ตรวจสอบสิ่งที่ AI สังเกตเห็นจากพฤติกรรมและเรื่องราวของคุณ
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={reload} className="p-1.5 rounded-lg text-[#869883] hover:text-[#EBF1EA] hover:bg-white/10 transition-all" title="รีเฟรช">
              <RefreshCw size={16} />
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-[#869883] hover:text-[#EBF1EA] hover:bg-white/10 transition-all">
              <X size={18} />
            </button>
          </div>
        </div>

        {!bieEnabled ? (
          <div className="p-8 text-center flex flex-col items-center gap-3">
            <div className="p-4 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldOff size={32} />
            </div>
            <h3 className="text-sm font-semibold text-[#EBF1EA]">AI ยังไม่พร้อมทำงาน</h3>
            <p className="text-xs text-[#869883]">เปิดใช้งาน AI เพื่อให้ระบบสังเกตเห็นรูปแบบในชีวิตของคุณ</p>
          </div>
        ) : (
          <>
            {/* Summary Strip */}
            <div className="flex items-center gap-4 px-5 py-2.5 bg-[#141A14]/40 border-b border-[#6B9361]/12 text-xs">
              <span className="text-[#869883]">ข้อสังเกตทั้งหมด: <span className="text-[#EBF1EA] font-semibold">{insights.length}</span></span>
              <span className="text-amber-400">รอการตัดสินใจ: <span className="font-semibold">{pendingCount}</span></span>
              <span className="text-emerald-400">นำไปใช้แล้ว: <span className="font-semibold">{appliedCount}</span></span>
              <button
                onClick={() => setShowAppliedOnly((v) => !v)}
                className={`ml-auto flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                  showAppliedOnly
                    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                    : "text-[#869883] border-white/10 hover:text-[#EBF1EA] hover:bg-white/5"
                }`}
              >
                <Filter size={11} />
                <span>{showAppliedOnly ? "แสดงที่ยืนยันแล้ว" : "แสดงทั้งหมด"}</span>
              </button>
            </div>

            {/* Kind Filters */}
            <div className="flex items-center gap-1.5 px-4 py-2 border-b border-[#6B9361]/12 overflow-x-auto">
              {KIND_FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterKind(f.id as InsightKind | "all")}
                  className={`shrink-0 px-3 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    filterKind === f.id
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "text-[#869883] hover:text-[#EBF1EA] hover:bg-white/5"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Insights List */}
            <div className="p-4 space-y-3 overflow-y-auto flex-1">
              {displayed.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center gap-2">
                  <Sparkles size={28} className="text-amber-400/50 mb-1" />
                  <p className="text-xs text-[#EBF1EA] font-medium">ไม่มีข้อสังเกตที่ตรงกับตัวกรอง</p>
                  <p className="text-[11px] text-[#869883]">
                    {insights.length === 0
                      ? "AI ยังไม่มีข้อสังเกตใหม่ — จะปรากฏเมื่อมีข้อมูลเพียงพอ"
                      : "ลองเปลี่ยนตัวกรองเพื่อดูข้อสังเกตประเภทอื่น"}
                  </p>
                </div>
              ) : (
                displayed.map((ins) => (
                  <InsightCard
                    key={ins.id}
                    insight={ins}
                    onConfirm={handleConfirm}
                    onReject={handleReject}
                    onUndo={handleUndo}
                  />
                ))
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#6B9361]/15 bg-[#141A14]/40 text-[11px] text-[#869883]">
          การยืนยันช่วยให้ AI เรียนรู้จากชีวิตของคุณ — คุณสามารถเปลี่ยนคำตอบได้ตลอดเวลา
        </div>
      </div>
    </div>
  );
};
