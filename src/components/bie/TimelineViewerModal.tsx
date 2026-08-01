import React, { useState, useEffect } from "react";
import { X, Calendar, RefreshCw, ShieldOff, Sparkles, Award, PieChart, Layers, Clock } from "lucide-react";
import { getBieTimelineItems } from "../../pie/bie/bieDiscoveryService";
import type { TimelineItem, TimelinePeriodKind } from "../../pie/bie/types";

interface TimelineViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  bieEnabled?: boolean;
}

const PERIOD_TABS: { id: TimelinePeriodKind | "all"; label: string }[] = [
  { id: "all", label: "ทั้งหมด" },
  { id: "month", label: "รายเดือน (Month)" },
  { id: "quarter", label: "รายไตรมาส (Quarter)" },
  { id: "year", label: "รายปี (Year)" },
];

export const TimelineViewerModal: React.FC<TimelineViewerModalProps> = ({
  isOpen,
  onClose,
  bieEnabled = true,
}) => {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [selectedKind, setSelectedKind] = useState<TimelinePeriodKind | "all">("all");

  const reload = () => {
    const filter = selectedKind === "all" ? undefined : { periodKind: selectedKind };
    const res = getBieTimelineItems(filter, bieEnabled);
    setItems(res.sort((a, b) => b.periodKey.localeCompare(a.periodKey)));
  };

  useEffect(() => {
    if (isOpen) reload();
  }, [isOpen, selectedKind, bieEnabled]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0A0E0A] border border-[#6B9361]/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#6B9361]/20 bg-[#141A14]/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 text-teal-400 border border-teal-500/30">
              <Calendar size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#EBF1EA] flex items-center gap-2">
                Life Timeline Explorer
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-medium">
                  Cache Layer
                </span>
              </h2>
              <p className="text-xs text-[#869883]">
                สำรวจช่วงเวลาและเหตุการณ์สำคัญในชีวิตที่สังเคราะห์โดย BIE
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
            <h3 className="text-sm font-semibold text-[#EBF1EA]">BIE Engine ปิดใช้งาน</h3>
            <p className="text-xs text-[#869883]">Timeline Explorer ไม่พร้อมใช้งานเมื่อ bieEnabled=false</p>
          </div>
        ) : (
          <>
            {/* Period Tabs */}
            <div className="flex items-center gap-1.5 px-4 py-2 border-b border-[#6B9361]/12 overflow-x-auto">
              {PERIOD_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedKind(tab.id as TimelinePeriodKind | "all")}
                  className={`shrink-0 px-3 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    selectedKind === tab.id
                      ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                      : "text-[#869883] hover:text-[#EBF1EA] hover:bg-white/5"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              {items.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center gap-2">
                  <Sparkles size={28} className="text-teal-400/50 mb-1" />
                  <p className="text-xs text-[#EBF1EA] font-medium">ยังไม่มีข้อมูล Timeline บันทึกไว้</p>
                  <p className="text-[11px] text-[#869883]">
                    ข้อมูลไทม์ไลน์จะถูกสร้างอัตโนมัติเมื่อมีกิจกรรมย้อนหลังในระบบ
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.periodKey} className="p-4 rounded-xl bg-[#141A14]/80 border border-[#6B9361]/20 space-y-3">
                    {/* Item Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-teal-500/15 text-teal-300 border border-teal-500/30 text-xs font-bold font-mono">
                          {item.periodKey}
                        </span>
                        <span className="text-[11px] text-[#869883] capitalize">
                          ({item.periodKind})
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-[#869883] font-mono">
                        <Layers size={11} />
                        <span>hash: {item.contentHash.slice(0, 8)}</span>
                      </div>
                    </div>

                    {/* Theme Breakdown */}
                    {item.themeBreakdown && item.themeBreakdown.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-semibold text-[#869883] flex items-center gap-1">
                          <PieChart size={12} className="text-emerald-400" />
                          <span>สัดส่วนมิติชีวิต (Theme Breakdown)</span>
                        </div>
                        <div className="space-y-1.5">
                          {item.themeBreakdown.map((theme, i) => (
                            <div key={i} className="space-y-0.5">
                              <div className="flex justify-between text-[11px] text-[#EBF1EA]">
                                <span className="capitalize">{theme.dimension}</span>
                                <span>{theme.percent}%</span>
                              </div>
                              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-emerald-400 to-teal-400 h-full rounded-full"
                                  style={{ width: `${Math.min(100, Math.max(0, theme.percent))}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Milestones */}
                    {item.milestones && item.milestones.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-white/5">
                        <div className="text-[11px] font-semibold text-[#869883] flex items-center gap-1">
                          <Award size={12} className="text-amber-400" />
                          <span>เหตุการณ์สำคัญ (Milestones)</span>
                        </div>
                        <div className="space-y-1">
                          {item.milestones.map((ms) => (
                            <div key={ms.id} className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-white/3">
                              <span className="text-[#EBF1EA] font-medium">{ms.label}</span>
                              <span className="text-[10px] text-[#869883]">
                                {new Date(ms.occurredAt).toLocaleDateString("th-TH", { month: "short", day: "numeric" })}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-[10px] text-[#869883] pt-1">
                      <Clock size={10} />
                      <span>อัปเดตล่าสุด: {new Date(item.generatedAt).toLocaleDateString("th-TH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#6B9361]/15 bg-[#141A14]/40 text-[11px] text-[#869883]">
          BIE Cache Safeguard: ไทม์ไลน์เป็นข้อมูลสังเคราะห์แบบ Rebuildable จากหลักฐาน (BrainEvidence)
        </div>
      </div>
    </div>
  );
};
