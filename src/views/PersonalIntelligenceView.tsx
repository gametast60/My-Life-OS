import React, { useState, useEffect } from "react";
import {
  Brain,
  Sparkles,
  User,
  Lightbulb,
  Calendar,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
  Loader2,
  ShieldOff,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  PieChart,
  Award,
  Clock,
} from "lucide-react";
import {
  getPendingBieQueue,
  searchBieSemantics,
  confirmPendingBieItem,
  rejectPendingBieItem,
  undoAppliedBieItem,
  GetPendingBieResult,
  getBieIdentityProfile,
  confirmBieIdentity,
  saveBieIdentityProfile,
  getBieInsights,
  confirmBieInsight,
  rejectBieInsight,
  getBieTimelineItems,
} from "../pie/bie/bieDiscoveryService";
import { BieReviewCard } from "../components/bie/BieReviewCard";
import { IdentityProfileCard } from "../components/bie/IdentityProfileCard";
import { InsightCard } from "../components/bie/InsightCard";
import type { BiePendingKind, IdentityRow, Insight, InsightKind, TimelineItem, TimelinePeriodKind } from "../pie/bie/types";
import { runBieAnalysisOrchestrator } from "../pie/bie/bieOrchestrator";
import { RoomBrainIntelligenceRepository } from "../pie/bie/RoomBrainIntelligenceRepository";
import type { BrainEvidence, BrainTreeDimension, BrainTreeTag } from "../types";
import type { BIEGraphNode } from "../pie/bie/graph/types";

interface PersonalIntelligenceViewProps {
  bieEnabled?: boolean;
}

/**
 * Humanize internal dimension strings into clean Thai labels.
 */
function humanizeDimension(raw: string): string {
  const DIMENSION_MAP: Record<string, string> = {
    finance: "การเงิน",
    programming: "การเขียนโปรแกรม",
    coding: "การเขียนโปรแกรม",
    work: "งาน",
    career: "อาชีพ",
    health: "สุขภาพ",
    relationship: "ความสัมพันธ์",
    family: "ครอบครัว",
    education: "การศึกษา",
    learning: "การเรียนรู้",
    personal: "การพัฒนาตนเอง",
    hobby: "งานอดิเรก",
    travel: "การเดินทาง",
    mindfulness: "สติและความสงบ",
    creativity: "ความคิดสร้างสรรค์",
    social: "สังคม",
    fitness: "การออกกำลังกาย",
    spiritual: "จิตใจ",
  };

  const cleaned = raw
    .replace(/^bt-dim-/i, "")
    .replace(/^fnv1a:[a-f0-9]+-/i, "")
    .replace(/-[a-f0-9]{6,}$/i, "")
    .toLowerCase()
    .trim();

  for (const [key, label] of Object.entries(DIMENSION_MAP)) {
    if (cleaned === key || cleaned.startsWith(key)) return label;
  }

  return cleaned
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Humanize period keys (e.g. "2025-03", "2025-Q1", "2025") into Thai format.
 */
function humanizePeriodKey(periodKey: string, periodKind: string): string {
  if (periodKind === "year") {
    return `ปี ${periodKey}`;
  }
  if (periodKind === "quarter") {
    const [year, q] = periodKey.split("-");
    const quarterLabel: Record<string, string> = {
      Q1: "ไตรมาส 1",
      Q2: "ไตรมาส 2",
      Q3: "ไตรมาส 3",
      Q4: "ไตรมาส 4",
    };
    return `${quarterLabel[q] ?? q} ${year}`;
  }
  if (periodKind === "month") {
    const [year, month] = periodKey.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString("th-TH", { year: "numeric", month: "long" });
  }
  return periodKey;
}

export const PersonalIntelligenceView: React.FC<PersonalIntelligenceViewProps> = ({
  bieEnabled = true,
}) => {
  // ── Pending Review Queue State ──────────────────────────────────────────
  const [selectedKind, setSelectedKind] = useState<BiePendingKind | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ id: string; text: string; score: number }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [queueResult, setQueueResult] = useState<GetPendingBieResult>({
    items: [],
    total: 0,
    hasMore: false,
  });

  // ── Identity Profile State ──────────────────────────────────────────────
  const [identityProfile, setIdentityProfile] = useState<IdentityRow | undefined>(undefined);

  // ── Insights State ──────────────────────────────────────────────────────
  const [insights, setInsights] = useState<Insight[]>([]);
  const [filterInsightKind, setFilterInsightKind] = useState<InsightKind | "all">("all");
  const [showAppliedInsightsOnly, setShowAppliedInsightsOnly] = useState(false);
  const [isInsightsExpanded, setIsInsightsExpanded] = useState(false);

  // ── Timeline State ──────────────────────────────────────────────────────
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [selectedTimelinePeriod, setSelectedTimelinePeriod] = useState<TimelinePeriodKind | "all">("all");
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);
  const [expandedTimelineTech, setExpandedTimelineTech] = useState<Record<string, boolean>>({});

  // ── Data Loaders ────────────────────────────────────────────────────────
  const loadAllData = () => {
    // 1. Pending Queue
    const kindFilter = selectedKind === "all" ? undefined : selectedKind;
    setQueueResult(getPendingBieQueue({ kind: kindFilter, bieEnabled }));

    // 2. Identity
    setIdentityProfile(getBieIdentityProfile(bieEnabled));

    // 3. Insights
    setInsights(getBieInsights(undefined, bieEnabled));

    // 4. Timeline
    const periodFilter = selectedTimelinePeriod === "all" ? undefined : { periodKind: selectedTimelinePeriod };
    const tItems = getBieTimelineItems(periodFilter, bieEnabled);
    setTimelineItems(tItems.sort((a, b) => b.periodKey.localeCompare(a.periodKey)));
  };

  useEffect(() => {
    loadAllData();
  }, [selectedKind, selectedTimelinePeriod, bieEnabled]);

  // Semantic Search Effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      const res = await searchBieSemantics(searchQuery, { bieEnabled });
      setSearchResults(res.matches);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, bieEnabled]);

  // ── Action Handlers ──────────────────────────────────────────────────────
  const handleConfirmPending = (id: string, editedPayload?: Record<string, unknown>) => {
    confirmPendingBieItem(id, editedPayload);
    loadAllData();
  };

  const handleRejectPending = (id: string) => {
    rejectPendingBieItem(id);
    loadAllData();
  };

  const handleUndoPending = (kind: string, targetId: string) => {
    undoAppliedBieItem(kind, targetId);
    loadAllData();
  };

  const handleConfirmIdentity = () => {
    confirmBieIdentity();
    loadAllData();
  };

  const handleUndoIdentity = () => {
    if (identityProfile) {
      saveBieIdentityProfile({ ...identityProfile, applied: false });
      loadAllData();
    }
  };

  const handleConfirmInsight = (id: string) => {
    confirmBieInsight(id);
    loadAllData();
  };

  const handleRejectInsight = (id: string) => {
    rejectBieInsight(id);
    loadAllData();
  };

  const handleUndoInsight = (id: string) => {
    undoAppliedBieItem("insight", id);
    loadAllData();
  };

  const handleAnalyze = async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    try {
      const repo = new RoomBrainIntelligenceRepository();
      const evidences: BrainEvidence[] = (window as any).__BIE_EVIDENCES__ || [];
      const tags: BrainTreeTag[] = (window as any).__BIE_TAGS__ || [];
      const dimensions: BrainTreeDimension[] = (window as any).__BIE_DIMENSIONS__ || [];
      const graphNodes: BIEGraphNode[] = (window as any).__BIE_GRAPH_NODES__ || [];

      await runBieAnalysisOrchestrator({
        evidences,
        tags,
        dimensions,
        graphNodes,
        bieRepo: repo,
      });
      loadAllData();
    } catch (err) {
      console.warn("[PersonalIntelligenceView] Analyze failed:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Filtered insights
  const displayedInsights = insights.filter((ins) => {
    if (filterInsightKind !== "all" && ins.kind !== filterInsightKind) return false;
    if (showAppliedInsightsOnly && !ins.applied) return false;
    return true;
  });
  const limitedInsights = isInsightsExpanded ? displayedInsights : displayedInsights.slice(0, 3);

  // Filtered timeline
  const limitedTimeline = isTimelineExpanded ? timelineItems : timelineItems.slice(0, 2);

  return (
    <div className="space-y-8 pb-28 animate-in fade-in duration-300 max-w-5xl mx-auto px-4">
      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="pt-2 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1F2B1F] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#4E7345] to-[#6B9361] flex items-center justify-center text-white shadow-lg shadow-[#4E7345]/20">
              <Brain size={22} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#EBF1EA]">
                ความเข้าใจของฉัน
              </h1>
              <p className="text-xs text-[#869883] mt-0.5">
                ศูนย์กลางการสังเคราะห์และประมวลผลความเข้าใจชีวิตของคุณ (Personal Intelligence Hub)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition-all disabled:opacity-50"
          >
            {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            <span>วิเคราะห์ตอนนี้</span>
          </button>
          <button
            onClick={loadAllData}
            className="p-2 rounded-xl text-[#869883] hover:text-[#EBF1EA] hover:bg-white/5 border border-[#1F2B1F] transition-all"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {!bieEnabled ? (
        <div className="p-12 text-center flex flex-col items-center justify-center gap-3 bg-[#131913] rounded-3xl border border-[#1F2B1F]">
          <div className="p-4 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ShieldOff size={36} />
          </div>
          <h3 className="text-base font-bold text-[#EBF1EA]">
            ระบบความเข้าใจยังไม่ได้เปิดใช้งาน
          </h3>
          <p className="text-xs text-[#869883] max-w-md leading-relaxed">
            เปิดใช้งานการประมวลผลความเข้าใจ เพื่อให้ AI สังเคราะห์ตัวตน ข้อสังเกต และเส้นทางชีวิตของคุณ
          </p>
        </div>
      ) : (
        <>
          {/* ── SECTION 1 (FIRST): สิ่งที่ AI อยากให้คุณตรวจสอบ ────────────────── */}
          <section className="bg-[#131913] rounded-3xl p-5 sm:p-6 border border-[#1F2B1F] shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-[#1F2B1F] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#EBF1EA] flex items-center gap-2">
                    สิ่งที่ AI อยากให้คุณตรวจสอบ
                    {queueResult.total > 0 && (
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                        {queueResult.total} รายการ
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-[#869883]">
                    AI พบเรื่องใหม่ที่ต้องการให้คุณยืนยันเพื่อทำความเข้าใจชีวิตคุณได้แม่นยำยิ่งขึ้น
                  </p>
                </div>
              </div>
            </div>

            {/* Filter Tabs & Search */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#869883]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ค้นหาข้อค้นพบของ AI..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#182018] border border-[#223022] text-xs text-[#EBF1EA] placeholder-[#556653] focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                  {[
                    { id: "all", label: `ทั้งหมด (${queueResult.total})` },
                    { id: "identity_update", label: "ความเข้าใจตัวตน" },
                    { id: "insight_proposal", label: "ข้อสังเกต" },
                    { id: "graph_edge", label: "ความเชื่อมโยง" },
                    { id: "graph_merge", label: "การรวมหัวข้อ" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedKind(tab.id as BiePendingKind | "all")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                        selectedKind === tab.id
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold"
                          : "text-[#869883] hover:text-[#EBF1EA] bg-[#182018] border border-[#223022]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Semantic Search Results Preview */}
              {searchQuery.trim() !== "" && (
                <div className="p-3 rounded-xl bg-[#182018] border border-[#223022]">
                  <div className="text-[11px] font-semibold text-[#869883] mb-2 flex items-center gap-1">
                    <Sparkles size={12} className="text-amber-400" />
                    <span>เรื่องราวที่เกี่ยวข้อง ({searchResults.length})</span>
                  </div>
                  {isSearching ? (
                    <p className="text-xs text-[#869883]">กำลังค้นหา...</p>
                  ) : searchResults.length === 0 ? (
                    <p className="text-xs text-[#869883]">ไม่พบเรื่องราวที่ตรงกับคำค้นหา</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {searchResults.map((m) => (
                        <span
                          key={m.id}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-medium"
                        >
                          {m.text} ({Math.round(m.score * 100)}%)
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Queue List */}
            <div className="space-y-3">
              {queueResult.items.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center gap-2 bg-[#182018] rounded-2xl border border-[#223022]">
                  <CheckCircle2 size={36} className="text-emerald-400/80 mb-1" />
                  <p className="text-sm font-bold text-[#EBF1EA]">
                    ไม่มีสิ่งที่รอการตัดสินใจ
                  </p>
                  <p className="text-xs text-[#869883]">
                    คุณได้ตรวจสอบทุกเรื่องที่ AI ค้นพบในขณะนี้แล้ว
                  </p>
                </div>
              ) : (
                queueResult.items.map((item) => (
                  <BieReviewCard
                    key={item.id}
                    item={item}
                    onConfirm={handleConfirmPending}
                    onReject={handleRejectPending}
                    onUndo={handleUndoPending}
                  />
                ))
              )}
            </div>
          </section>

          {/* ── SECTION 2 (SECOND): AI เข้าใจคุณอย่างไร & AI สังเกตเห็นอะไร ────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 👤 AI เข้าใจคุณอย่างไร (Identity Profile) */}
            <section className="bg-[#131913] rounded-3xl p-5 sm:p-6 border border-[#1F2B1F] shadow-lg space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#1F2B1F] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/30">
                      <User size={18} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-[#EBF1EA]">
                        AI เข้าใจคุณอย่างไร
                      </h2>
                      <p className="text-xs text-[#869883]">
                        สรุปตัวตนและความเข้าใจเกี่ยวกับตัวคุณ
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  {!identityProfile ? (
                    <div className="p-6 text-center flex flex-col items-center justify-center gap-2 bg-[#182018] rounded-2xl border border-[#223022]">
                      <Sparkles size={28} className="text-violet-400/60 mb-1" />
                      <p className="text-xs font-semibold text-[#EBF1EA]">
                        AI ยังรู้จักคุณไม่เพียงพอ
                      </p>
                      <p className="text-[11px] text-[#869883] leading-relaxed">
                        สะสมบันทึกและเรื่องราวเพิ่มเติม เพื่อให้ระบบสร้างสรุปความเข้าใจตัวตนของคุณ
                      </p>
                    </div>
                  ) : (
                    <IdentityProfileCard
                      profile={identityProfile}
                      onConfirm={handleConfirmIdentity}
                      onUndo={handleUndoIdentity}
                    />
                  )}
                </div>
              </div>
            </section>

            {/* 💡 AI สังเกตเห็นอะไร (Insights) */}
            <section className="bg-[#131913] rounded-3xl p-5 sm:p-6 border border-[#1F2B1F] shadow-lg space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#1F2B1F] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <Lightbulb size={18} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-[#EBF1EA]">
                        AI สังเกตเห็นอะไร
                      </h2>
                      <p className="text-xs text-[#869883]">
                        รูปแบบ แนวโน้ม และข้อสังเกตในชีวิตของคุณ
                      </p>
                    </div>
                  </div>
                  {displayedInsights.length > 3 && (
                    <button
                      onClick={() => setIsInsightsExpanded((v) => !v)}
                      className="text-xs font-semibold text-amber-300 hover:underline flex items-center gap-1"
                    >
                      <span>{isInsightsExpanded ? "ย่อลง" : `ดูทั้งหมด (${displayedInsights.length})`}</span>
                      {isInsightsExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  )}
                </div>

                {/* Insight Filter Options */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {[
                    { id: "all", label: "ทั้งหมด" },
                    { id: "trend", label: "แนวโน้ม" },
                    { id: "anomaly", label: "ความผิดปกติ" },
                    { id: "pattern", label: "รูปแบบ" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFilterInsightKind(f.id as InsightKind | "all")}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all shrink-0 ${
                        filterInsightKind === f.id
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold"
                          : "text-[#869883] hover:text-[#EBF1EA] bg-[#182018]"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Insights List */}
                <div className="space-y-3">
                  {limitedInsights.length === 0 ? (
                    <div className="p-6 text-center flex flex-col items-center justify-center gap-2 bg-[#182018] rounded-2xl border border-[#223022]">
                      <Sparkles size={28} className="text-amber-400/50 mb-1" />
                      <p className="text-xs font-semibold text-[#EBF1EA]">ยังไม่มีข้อสังเกตใหม่</p>
                      <p className="text-[11px] text-[#869883]">
                        ข้อสังเกตจะปรากฏขึ้นเมื่อมีข้อมูลสะสมเพียงพอ
                      </p>
                    </div>
                  ) : (
                    limitedInsights.map((ins) => (
                      <InsightCard
                        key={ins.id}
                        insight={ins}
                        onConfirm={handleConfirmInsight}
                        onReject={handleRejectInsight}
                        onUndo={handleUndoInsight}
                      />
                    ))
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* ── SECTION 3 (THIRD): เส้นทางชีวิตของคุณ (Timeline Trajectory) ─────── */}
          <section className="bg-[#131913] rounded-3xl p-5 sm:p-6 border border-[#1F2B1F] shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-[#1F2B1F] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
                  <Calendar size={18} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#EBF1EA]">
                    เส้นทางชีวิตของคุณ
                  </h2>
                  <p className="text-xs text-[#869883]">
                    ช่วงเวลาสำคัญและประวัติการเติบโตที่คุณผ่านมา
                  </p>
                </div>
              </div>

              {timelineItems.length > 2 && (
                <button
                  onClick={() => setIsTimelineExpanded((v) => !v)}
                  className="text-xs font-semibold text-teal-300 hover:underline flex items-center gap-1"
                >
                  <span>{isTimelineExpanded ? "ย่อลง" : `ดูเส้นทางทั้งหมด (${timelineItems.length})`}</span>
                  {isTimelineExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              )}
            </div>

            {/* Period Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { id: "all", label: "ทั้งหมด" },
                { id: "month", label: "รายเดือน" },
                { id: "quarter", label: "รายไตรมาส" },
                { id: "year", label: "รายปี" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTimelinePeriod(tab.id as TimelinePeriodKind | "all")}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all shrink-0 ${
                    selectedTimelinePeriod === tab.id
                      ? "bg-teal-500/20 text-teal-300 border border-teal-500/30 font-semibold"
                      : "text-[#869883] hover:text-[#EBF1EA] bg-[#182018]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Timeline Cards */}
            <div className="space-y-4">
              {limitedTimeline.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center gap-2 bg-[#182018] rounded-2xl border border-[#223022]">
                  <Sparkles size={28} className="text-teal-400/50 mb-1" />
                  <p className="text-xs font-semibold text-[#EBF1EA]">ยังไม่มีข้อมูลเส้นทางชีวิต</p>
                  <p className="text-[11px] text-[#869883]">
                    บันทึกกิจกรรมและเรื่องราวอย่างต่อเนื่อง ข้อมูลเส้นทางชีวิตจะสังเคราะห์ให้อัตโนมัติ
                  </p>
                </div>
              ) : (
                limitedTimeline.map((item) => (
                  <div
                    key={item.periodKey}
                    className="p-4 sm:p-5 rounded-2xl bg-[#182018] border border-[#223022] space-y-3 hover:border-[#273727] transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-xl bg-teal-500/15 text-teal-300 border border-teal-500/30 text-xs font-extrabold">
                        {humanizePeriodKey(item.periodKey, item.periodKind)}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] text-[#869883]">
                        <Clock size={12} />
                        <span>อัปเดต {new Date(item.generatedAt).toLocaleDateString("th-TH", { month: "short", day: "numeric" })}</span>
                      </div>
                    </div>

                    {/* Theme Breakdown */}
                    {item.themeBreakdown && item.themeBreakdown.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-semibold text-[#869883] flex items-center gap-1">
                          <PieChart size={12} className="text-emerald-400" />
                          <span>สัดส่วนด้านชีวิตในช่วงนี้</span>
                        </div>
                        <div className="space-y-1.5">
                          {item.themeBreakdown.map((theme, i) => (
                            <div key={i} className="space-y-0.5">
                              <div className="flex justify-between text-xs text-[#EBF1EA]">
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
                            <div
                              key={ms.id}
                              className="flex items-center justify-between text-xs px-3 py-1.5 rounded-xl bg-[#131913] border border-[#223022]"
                            >
                              <span className="text-[#EBF1EA] font-medium">{ms.label}</span>
                              <span className="text-[10px] text-[#869883]">
                                {new Date(ms.occurredAt).toLocaleDateString("th-TH", { month: "short", day: "numeric" })}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
};
