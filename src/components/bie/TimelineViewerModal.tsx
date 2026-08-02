import React, { useState, useEffect } from "react";
import { X, Calendar, RefreshCw, ShieldOff, Sparkles, Award, PieChart, Layers, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { getBieTimelineItems } from "../../pie/bie/bieDiscoveryService";
import type { TimelineItem, TimelinePeriodKind } from "../../pie/bie/types";

interface TimelineViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  bieEnabled?: boolean;
}

const PERIOD_TABS: { id: TimelinePeriodKind | "all"; label: string }[] = [
  { id: "all",     label: "ทั้งหมด" },
  { id: "month",   label: "รายเดือน" },
  { id: "quarter", label: "รายไตรมาส" },
  { id: "year",    label: "รายปี" },
];

/**
 * Map internal dimension IDs (e.g. bt-dim-finance-..., fnv1a:...) to
 * human-readable Thai labels. Falls back to the raw value if no match.
 */
function humanizeDimension(raw: string): string {
  // Exact known slugs
  const DIMENSION_MAP: Record<string, string> = {
    finance:       "การเงิน",
    programming:   "การเขียนโปรแกรม",
    coding:        "การเขียนโปรแกรม",
    work:          "งาน",
    career:        "อาชีพ",
    health:        "สุขภาพ",
    relationship:  "ความสัมพันธ์",
    family:        "ครอบครัว",
    education:     "การศึกษา",
    learning:      "การเรียนรู้",
    personal:      "การพัฒนาตนเอง",
    hobby:         "งานอดิเรก",
    travel:        "การเดินทาง",
    mindfulness:   "สติและความสงบ",
    creativity:    "ความคิดสร้างสรรค์",
    social:        "สังคม",
    fitness:       "การออกกำลังกาย",
    spiritual:     "จิตใจ",
  };

  // Strip prefixes like "bt-dim-" or "fnv1a:" and get the core slug
  const cleaned = raw
    .replace(/^bt-dim-/i, "")
    .replace(/^fnv1a:[a-f0-9]+-/i, "")
    .replace(/-[a-f0-9]{6,}$/i, "") // strip trailing hash suffixes
    .toLowerCase()
    .trim();

  for (const [key, label] of Object.entries(DIMENSION_MAP)) {
    if (cleaned === key || cleaned.startsWith(key)) return label;
  }

  // Title-case the cleaned slug as a last resort
  return cleaned
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Format the periodKey (e.g. "2025-03", "2025-Q1", "2025") into
 * a human-readable Thai date label.
 */
function humanizePeriodKey(periodKey: string, periodKind: string): string {
  if (periodKind === "year") {
    return `ปี ${periodKey}`;
  }
  if (periodKind === "quarter") {
    const [year, q] = periodKey.split("-");
    const quarterLabel: Record<string, string> = { Q1: "ไตรมาส 1", Q2: "ไตรมาส 2", Q3: "ไตรมาส 3", Q4: "ไตรมาส 4" };
    return `${quarterLabel[q] ?? q} ${year}`;
  }
  if (periodKind === "month") {
    // "2025-03" → Thai month name
    const [year, month] = periodKey.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString("th-TH", { year: "numeric", month: "long" });
  }
  return periodKey;
}

export const TimelineViewerModal: React.FC<TimelineViewerModalProps> = ({
  isOpen,
  onClose,
  bieEnabled = true,
}) => {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [selectedKind, setSelectedKind] = useState<TimelinePeriodKind | "all">("all");
  const [expandedTech, setExpandedTech] = useState<Record<string, boolean>>({});

  const reload = () => {
    const filter = selectedKind === "all" ? undefined : { periodKind: selectedKind };
    const res = getBieTimelineItems(filter, bieEnabled);
    setItems(res.sort((a, b) => b.periodKey.localeCompare(a.periodKey)));
  };

  useEffect(() => {
    if (isOpen) reload();
  }, [isOpen, selectedKind, bieEnabled]);

  const toggleTech = (key: string) =>
    setExpandedTech((prev) => ({ ...prev, [key]: !prev[key] }));

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
              <h2 className="text-base font-bold text-[#EBF1EA]">
                เส้นทางชีวิตของคุณ
              </h2>
              <p className="text-xs text-[#869883]">
                ช่วงเวลาและเหตุการณ์สำคัญที่ AI สังเกตเห็นในชีวิตของคุณ
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
            <p className="text-xs text-[#869883]">เปิดใช้งาน AI เพื่อดูเส้นทางชีวิตของคุณ</p>
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
                  <p className="text-xs text-[#EBF1EA] font-medium">ยังไม่มีข้อมูลเส้นทางชีวิต</p>
                  <p className="text-[11px] text-[#869883]">
                    ข้อมูลจะปรากฏเมื่อมีกิจกรรมสะสมเพียงพอ
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.periodKey} className="p-4 rounded-xl bg-[#141A14]/80 border border-[#6B9361]/20 space-y-3">
                    {/* Item Header — Human-readable */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-teal-500/15 text-teal-300 border border-teal-500/30 text-xs font-bold">
                          {humanizePeriodKey(item.periodKey, item.periodKind)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-[#869883]">
                        <Clock size={10} />
                        <span>อัปเดต {new Date(item.generatedAt).toLocaleDateString("th-TH", { month: "short", day: "numeric" })}</span>
                      </div>
                    </div>

                    {/* Theme Breakdown — humanized dimension labels */}
                    {item.themeBreakdown && item.themeBreakdown.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-semibold text-[#869883] flex items-center gap-1">
                          <PieChart size={12} className="text-emerald-400" />
                          <span>ด้านต่างๆ ของชีวิต</span>
                        </div>
                        <div className="space-y-1.5">
                          {item.themeBreakdown.map((theme, i) => (
                            <div key={i} className="space-y-0.5">
                              <div className="flex justify-between text-[11px] text-[#EBF1EA]">
                                <span>{humanizeDimension(theme.dimension)}</span>
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
                          <span>เหตุการณ์สำคัญ</span>
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

                    {/* Technical Details (expandable per item) */}
                    <div>
                      <button
                        onClick={() => toggleTech(item.periodKey)}
                        className="flex items-center gap-1 text-[10px] text-[#869883]/50 hover:text-[#869883] transition-all"
                      >
                        {expandedTech[item.periodKey] ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                        <span>รายละเอียดเพิ่มเติม</span>
                      </button>
                      {expandedTech[item.periodKey] && (
                        <div className="mt-1.5 px-3 py-2 rounded-lg bg-[#0A0E0A] border border-white/8 text-[10px] font-mono text-[#869883] space-y-0.5">
                          <div>periodKey: {item.periodKey}</div>
                          <div>periodKind: {item.periodKind}</div>
                          <div>contentHash: {item.contentHash}</div>
                          <div>generatedAt: {item.generatedAt}</div>
                          <div>engine: BIE Timeline Cache</div>
                          {item.themeBreakdown && item.themeBreakdown.map((t, i) => (
                            <div key={i}>dimension[{i}]: {t.dimension} ({t.percent}%)</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#6B9361]/15 bg-[#141A14]/40 text-[11px] text-[#869883]">
          เส้นทางชีวิตสร้างจากบันทึกและเรื่องราวของคุณ — ข้อมูลสามารถสร้างใหม่ได้จากหลักฐานเดิม
        </div>
      </div>
    </div>
  );
};
