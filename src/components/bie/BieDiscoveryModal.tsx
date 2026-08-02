import React, { useState, useEffect } from "react";
import { X, Search, Sparkles, Brain, CheckCircle2, ShieldOff, Filter, RefreshCw, User, Lightbulb, ArrowRight, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import {
  getPendingBieQueue,
  searchBieSemantics,
  confirmPendingBieItem,
  rejectPendingBieItem,
  undoAppliedBieItem,
  GetPendingBieResult,
} from "../../pie/bie/bieDiscoveryService";
import { BieReviewCard } from "./BieReviewCard";
import type { BiePendingKind } from "../../pie/bie/types";
import { runBieAnalysisOrchestrator } from "../../pie/bie/bieOrchestrator";
import { RoomBrainIntelligenceRepository } from "../../pie/bie/RoomBrainIntelligenceRepository";
import type { BrainEvidence, BrainTreeDimension, BrainTreeTag } from "../../types";
import type { BIEGraphNode } from "../../pie/bie/graph/types";

interface BieDiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  bieEnabled?: boolean;
  onOpenIdentityReview?: () => void;
  onOpenInsightCenter?: () => void;
}

export const BieDiscoveryModal: React.FC<BieDiscoveryModalProps> = ({
  isOpen,
  onClose,
  bieEnabled = true,
  onOpenIdentityReview,
  onOpenInsightCenter,
}) => {
  const [selectedKind, setSelectedKind] = useState<BiePendingKind | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ id: string; text: string; score: number }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showTechFooter, setShowTechFooter] = useState(false);

  const [queueResult, setQueueResult] = useState<GetPendingBieResult>({
    items: [],
    total: 0,
    hasMore: false,
  });

  const loadQueue = () => {
    const kindFilter = selectedKind === "all" ? undefined : selectedKind;
    const result = getPendingBieQueue({
      kind: kindFilter,
      bieEnabled,
    });
    setQueueResult(result);
  };

  useEffect(() => {
    if (isOpen) {
      loadQueue();
    }
  }, [isOpen, selectedKind, bieEnabled]);

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

  const handleConfirm = (id: string, editedPayload?: Record<string, unknown>) => {
    confirmPendingBieItem(id, editedPayload);
    loadQueue();
  };

  const handleReject = (id: string) => {
    rejectPendingBieItem(id);
    loadQueue();
  };

  const handleUndo = (kind: string, targetId: string) => {
    undoAppliedBieItem(kind, targetId);
    loadQueue();
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
      loadQueue();
    } catch (err) {
      console.warn("[BieDiscoveryModal] Analyze failed:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0A0E0A] border border-[#6B9361]/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#6B9361]/20 bg-[#141A14]/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30">
              <Brain size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#EBF1EA] flex items-center gap-2">
                สิ่งที่ AI ค้นพบ
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                  รอการตัดสินใจของคุณ
                </span>
              </h2>
              <p className="text-xs text-[#869883]">
                AI พบเรื่องที่น่าสนใจจากบันทึกและเรื่องราวของคุณ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#869883] hover:text-[#EBF1EA] hover:bg-white/10 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick-Nav: Identity Review + Insight Center */}
        {bieEnabled && (onOpenIdentityReview || onOpenInsightCenter) && (
          <div className="flex items-center gap-2 px-5 py-2.5 bg-[#141A14]/30 border-b border-[#6B9361]/12">
            <span className="text-[11px] text-[#869883] shrink-0">ดูเพิ่มเติม:</span>
            {onOpenIdentityReview && (
              <button
                onClick={() => { onClose(); onOpenIdentityReview(); }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-semibold bg-violet-500/10 border border-violet-500/20 text-violet-300 hover:bg-violet-500/20 transition-all"
              >
                <User size={12} />
                <span>AI เข้าใจคุณอย่างไร</span>
                <ArrowRight size={11} />
              </button>
            )}
            {onOpenInsightCenter && (
              <button
                onClick={() => { onClose(); onOpenInsightCenter(); }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20 transition-all"
              >
                <Lightbulb size={12} />
                <span>สิ่งที่ AI สังเกตเห็น</span>
                <ArrowRight size={11} />
              </button>
            )}
          </div>
        )}


        {/* Disabled State Banner */}
        {!bieEnabled ? (
          <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
            <div className="p-4 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldOff size={32} />
            </div>
            <h3 className="text-sm font-semibold text-[#EBF1EA]">
              AI ยังไม่พร้อมทำงาน
            </h3>
            <p className="text-xs text-[#869883] max-w-md">
              ขณะนี้ใช้ระบบพื้นฐาน AI จะยังไม่แสดงข้อค้นพบใหม่จนกว่าจะเปิดใช้งาน
            </p>
          </div>
        ) : (
          <>
            {/* Search Bar */}
            <div className="p-4 border-b border-[#6B9361]/15 bg-[#141A14]/30">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#869883]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาจากเรื่องราวของคุณ..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0A0E0A] border border-[#6B9361]/30 text-xs text-[#EBF1EA] placeholder-[#869883] focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Search Results Preview */}
              {searchQuery.trim() !== "" && (
                <div className="mt-2 p-3 rounded-xl bg-[#0A0E0A] border border-[#6B9361]/20">
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

            {/* Kind Filter Tabs */}
            <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-[#6B9361]/15 overflow-x-auto text-xs">
              <span className="text-[#869883] flex items-center gap-1 shrink-0 mr-1 text-[11px]">
                <Filter size={12} />
                <span>ประเภท:</span>
              </span>

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
                  className={`px-3 py-1 rounded-lg text-xs transition-all shrink-0 font-medium ${
                    selectedKind === tab.id
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "text-[#869883] hover:text-[#EBF1EA] hover:bg-white/5"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Queue Items List */}
            <div className="p-4 space-y-3 overflow-y-auto flex-1">
              {queueResult.items.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
                  <CheckCircle2 size={32} className="text-emerald-400/60 mb-1" />
                  <p className="text-xs text-[#EBF1EA] font-medium">
                    ไม่มีสิ่งที่รอการตัดสินใจ
                  </p>
                  <p className="text-[11px] text-[#869883]">
                    คุณได้ตรวจสอบทุกเรื่องที่ AI ค้นพบแล้ว
                  </p>
                </div>
              ) : (
                queueResult.items.map((item) => (
                  <BieReviewCard
                    key={item.id}
                    item={item}
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
        <div className="px-6 py-3 border-t border-[#6B9361]/15 bg-[#141A14]/40 flex items-center justify-between text-xs text-[#869883]">
          <button
            onClick={() => setShowTechFooter((v) => !v)}
            className="flex items-center gap-1 hover:text-[#EBF1EA] transition-all text-[11px]"
          >
            {showTechFooter ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            <span>รายละเอียดเพิ่มเติม</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="flex items-center gap-1 hover:text-[#EBF1EA] transition-all text-xs font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-2 py-1 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              <span>วิเคราะห์ตอนนี้</span>
            </button>
            <button
              onClick={loadQueue}
              className="flex items-center gap-1 hover:text-[#EBF1EA] transition-all text-xs font-medium"
            >
              <RefreshCw size={12} />
              <span>รีเฟรช</span>
            </button>
          </div>
        </div>

        {/* Technical Detail (expandable) */}
        {showTechFooter && (
          <div className="px-6 py-3 bg-[#0A0E0A]/80 border-t border-[#6B9361]/10 text-[10px] font-mono text-[#869883] space-y-0.5">
            <div>engine: BIE (Brain Intelligence Engine)</div>
            <div>hitl_safeguard: true — proposals are applied only after user confirmation</div>
            <div>pending_count: {queueResult.total}</div>
            <div>has_more: {String(queueResult.hasMore)}</div>
            <div>bie_enabled: {String(bieEnabled)}</div>
          </div>
        )}
      </div>
    </div>
  );
};
