import React, { useState, useMemo } from "react";
import {
  ChevronRight,
  ChevronDown,
  TreeDeciduous,
  Leaf,
  Zap,
  BookOpen,
  Repeat,
  Target,
  CheckCircle2,
  Sparkles,
  CalendarDays,
  Brain,
  TrendingUp,
  Award,
  Star,
} from "lucide-react";
import type {
  FullTree,
  TypeNode,
  DimensionNode,
  TagNode,
} from "../lib/brainTree/brainTreeService";
import { STATUS_META } from "../lib/brainTree/growth";
import type { EvidenceKind } from "../types";

interface BrainTreeViewerProps {
  tree: FullTree;
  onTagClick?: (tagId: string) => void;
}

const EVIDENCE_ICON: Record<EvidenceKind, React.ComponentType<{ size?: number; className?: string }>> = {
  journal: BookOpen,
  habit_completed: Repeat,
  reminder_completed: CheckCircle2,
  goal_progress: Target,
  daily_checkin: CalendarDays,
  ai_memory: Sparkles,
  brain_card_legacy: Brain,
};

const EVIDENCE_LABEL: Record<EvidenceKind, string> = {
  journal: "Journal",
  habit_completed: "Habit",
  reminder_completed: "Reminder",
  goal_progress: "Goal",
  daily_checkin: "Check-in",
  ai_memory: "AI Memory",
  brain_card_legacy: "Legacy",
};

function ProgressBar({
  progressPct,
  color,
  height = 6,
}: {
  progressPct: number;
  color: string;
  height?: number;
}) {
  const pct = Math.max(0, Math.min(100, progressPct));
  return (
    <div
      className="w-full rounded-full overflow-hidden"
      style={{ background: "rgba(255,255,255,0.05)", height }}
    >
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
        }}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: keyof typeof STATUS_META }) {
  const meta = STATUS_META[status];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
      style={{
        background: `${meta.color}22`,
        color: meta.color,
        border: `1px solid ${meta.color}33`,
      }}
    >
      <span>{meta.emoji}</span>
      <span>{meta.label}</span>
    </span>
  );
}

function EvidenceBreakdownChips({
  breakdown,
}: {
  breakdown: Partial<Record<EvidenceKind, number>>;
}) {
  const entries = Object.entries(breakdown) as [EvidenceKind, number][];
  if (entries.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {entries.map(([kind, count]) => {
        const Icon = EVIDENCE_ICON[kind] ?? Sparkles;
        return (
          <span
            key={kind}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px]"
            style={{ background: "rgba(255,255,255,0.04)", color: "#869883" }}
            title={`${EVIDENCE_LABEL[kind]}: ${count}`}
          >
            <Icon size={10} />
            <span>{count}</span>
          </span>
        );
      })}
    </div>
  );
}

function LevelBadge({
  level,
  score,
}: {
  level: number;
  score: number;
}) {
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold"
      style={{
        background: "rgba(212,175,55,0.12)",
        color: "#D4AF37",
        border: "1px solid rgba(212,175,55,0.2)",
      }}
    >
      <Star size={10} />
      <span>Lv.{level}</span>
      <span className="opacity-60">·</span>
      <span className="opacity-80">{score.toFixed(1)}</span>
    </span>
  );
}

export const BrainTreeViewer: React.FC<BrainTreeViewerProps> = ({ tree, onTagClick }) => {
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());
  const [expandedDims, setExpandedDims] = useState<Set<string>>(new Set());

  const toggleType = (id: string) => {
    setExpandedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleDim = (id: string) => {
    setExpandedDims((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const globalGrowth = useMemo(() => {
    const config = tree.config;
    const levelConstant = config.growthLevelConstant;
    if (levelConstant <= 0) return { level: 0, progressPct: 0 };
    const s = Math.max(0, tree.globalRawScore);
    let level = Math.floor(Math.sqrt(s / levelConstant));
    while (levelConstant * (level + 1) * (level + 1) <= s) level++;
    while (level > 0 && levelConstant * level * level > s) level--;
    const reqForLevel = levelConstant * level * level;
    const reqForNext = levelConstant * (level + 1) * (level + 1);
    const span = reqForNext - reqForLevel;
    const within = span > 0 ? Math.min(1, Math.max(0, (s - reqForLevel) / span)) : 0;
    return { level, progressPct: Math.round(within * 100) };
  }, [tree]);

  const globalStatus = useMemo(() => {
    const pct = globalGrowth.progressPct;
    const t = tree.config.statusThresholds;
    if (pct <= t.seedling) return "seedling";
    if (pct <= t.growing) return "growing";
    if (pct <= t.strong) return "strong";
    return "mastery";
  }, [globalGrowth.progressPct, tree.config.statusThresholds]);

  return (
    <div className="space-y-4">
      {/* Global Summary */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: "linear-gradient(135deg, rgba(78,115,69,0.18), rgba(107,147,97,0.08))",
          border: "1px solid rgba(107,147,97,0.25)",
        }}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #4E7345, #6B9361)",
                boxShadow: "0 6px 16px rgba(78,115,69,0.35)",
              }}
            >
              <TreeDeciduous size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#EBF1EA]">Life Brain Tree</h2>
              <p className="text-xs text-[#869883]">
                {tree.types.length} Types · {tree.types.reduce((a, t) => a + t.dimensions.length, 0)} Dimensions · {" "}
                {tree.types.reduce((a, t) => a + t.dimensions.reduce((b, d) => b + d.tags.length, 0), 0)} Tags
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <StatusBadge status={globalStatus as keyof typeof STATUS_META} />
            <LevelBadge level={globalGrowth.level} score={tree.globalRawScore} />
          </div>
        </div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] text-[#869883] flex items-center gap-1.5">
            <TrendingUp size={11} />
            ผลการเติบโตโดยรวม
          </span>
          <span className="text-[11px] font-semibold text-[#6B9361]">
            {globalGrowth.progressPct}% · {tree.globalEvidenceCount} Evidence
          </span>
        </div>
        <ProgressBar progressPct={globalGrowth.progressPct} color="#6B9361" height={8} />
      </div>

      {/* Empty state */}
      {tree.types.length === 0 && (
        <div className="text-center py-16 rounded-2xl" style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px dashed rgba(107,147,97,0.2)"
        }}>
          <Brain size={40} className="mx-auto mb-3 opacity-20" style={{ color: "#6B9361" }} />
          <p className="text-sm font-semibold mb-1 text-[#869883]">
            ยังไม่มี Brain Tree
          </p>
          <p className="text-xs text-[#576656] max-w-xs mx-auto">
            ไปที่ Brain Manager เพื่อสร้างโครงสร้างต้นไม้ หรือบันทึก Journal แล้ว AI จะช่วยเสนอตำแหน่งให้เอง
          </p>
        </div>
      )}

      {/* Type list */}
      {tree.types.map((tNode) => (
        <TypeRow
          key={tNode.type.id}
          tNode={tNode}
          expanded={expandedTypes.has(tNode.type.id)}
          onToggle={() => toggleType(tNode.type.id)}
          expandedDims={expandedDims}
          onToggleDim={toggleDim}
          onTagClick={onTagClick}
        />
      ))}
    </div>
  );
};

function TypeRow({
  tNode,
  expanded,
  onToggle,
  expandedDims,
  onToggleDim,
  onTagClick,
}: {
  key?: string | number;
  tNode: TypeNode;
  expanded: boolean;
  onToggle: () => void;
  expandedDims: Set<string>;
  onToggleDim: (id: string) => void;
  onTagClick?: (tagId: string) => void;
}) {
  const color = tNode.type.color;
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${color}33`,
      }}
    >
      {/* Type Header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left p-4 flex items-start gap-3 hover:bg-white/[0.02] transition-colors"
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}22` }}
        >
          <TreeDeciduous size={18} style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <h3 className="font-bold text-sm text-[#EBF1EA] truncate">{tNode.type.name}</h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded" style={{
                background: "rgba(255,255,255,0.05)",
                color: "#869883",
              }}>
                {tNode.dimensions.length} มิติ · {tNode.totalEvidence} Ev
              </span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <LevelBadge level={tNode.growth.level} score={tNode.rawScore} />
              {expanded ? (
                <ChevronDown size={14} className="text-[#869883]" />
              ) : (
                <ChevronRight size={14} className="text-[#869883]" />
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <StatusBadge status={tNode.status} />
            <span className="text-[10px] text-[#576656]">
              Lv.{tNode.growth.level} → Lv.{tNode.growth.level + 1}
            </span>
          </div>
          <ProgressBar progressPct={tNode.growth.progressPct} color={color} height={5} />
          {tNode.totalEvidence > 0 && (
            <div className="mt-2">
              <EvidenceBreakdownChips breakdown={tNode.evidenceBreakdown} />
            </div>
          )}
        </div>
      </button>

      {/* Expanded: Dimensions */}
      {expanded && tNode.dimensions.length > 0 && (
        <div
          className="space-y-1 px-2 pb-3"
          style={{ borderTop: `1px solid ${color}22` }}
        >
          {tNode.dimensions.map((dNode) => (
            <DimRow
              key={dNode.dimension.id}
              dNode={dNode}
              parentColor={color}
              expanded={expandedDims.has(dNode.dimension.id)}
              onToggle={() => onToggleDim(dNode.dimension.id)}
              onTagClick={onTagClick}
            />
          ))}
        </div>
      )}

      {expanded && tNode.dimensions.length === 0 && (
        <div className="px-4 pb-3 pt-1 text-xs text-[#576656]" style={{ borderTop: `1px solid ${color}15` }}>
          ยังไม่มี Dimension — เพิ่มได้ใน Brain Manager
        </div>
      )}
    </div>
  );
}

function DimRow({
  dNode,
  parentColor,
  expanded,
  onToggle,
  onTagClick,
}: {
  key?: string | number;
  dNode: DimensionNode;
  parentColor: string;
  expanded: boolean;
  onToggle: () => void;
  onTagClick?: (tagId: string) => void;
}) {
  const accent = dNode.dimension.color || parentColor;
  return (
    <div
      className="rounded-xl overflow-hidden mt-2"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: `1px solid ${accent}22`,
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left p-3 flex items-start gap-2.5 hover:bg-white/[0.03] transition-colors"
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: `${accent}18` }}
        >
          <Leaf size={14} style={{ color: accent }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <h4 className="text-sm font-semibold text-[#EBF1EA] truncate">{dNode.dimension.name}</h4>
              <span className="text-[10px] text-[#576656] flex-shrink-0">
                {dNode.tags.length} Tags · {dNode.totalEvidence} Ev
              </span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{
                background: `${accent}15`,
                color: accent,
              }}>
                Lv.{dNode.growth.level}
              </span>
              {expanded ? (
                <ChevronDown size={12} className="text-[#576656]" />
              ) : (
                <ChevronRight size={12} className="text-[#576656]" />
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge status={dNode.status} />
            <span className="text-[10px] text-[#869883]">
              {dNode.growth.progressPct}%
            </span>
          </div>
          <ProgressBar progressPct={dNode.growth.progressPct} color={accent} height={4} />
        </div>
      </button>

      {expanded && dNode.tags.length > 0 && (
        <div className="space-y-1.5 px-2 pb-2.5">
          {dNode.tags.map((tNode) => (
            <TagRow
              key={tNode.tag.id}
              tNode={tNode}
              accent={accent}
              onClick={() => onTagClick?.(tNode.tag.id)}
            />
          ))}
        </div>
      )}

      {expanded && dNode.tags.length === 0 && (
        <div className="px-3 pb-2 pt-1 text-[11px] text-[#576656]">
          ยังไม่มี Tag — AI จะเสนอให้อัตโนมัติเมื่อมี Journal ใหม่
        </div>
      )}
    </div>
  );
}

function TagRow({
  tNode,
  accent,
  onClick,
}: {
  key?: string | number;
  tNode: TagNode;
  accent: string;
  onClick?: () => void;
}) {
  const { tag, growth, status, evidenceBreakdown, totalEvidence, rawScore } = tNode;
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left p-2.5 rounded-lg hover:bg-white/[0.04] transition-all active:scale-[0.99]"
      style={{
        border: `1px solid ${accent}15`,
        background: "rgba(255,255,255,0.015)",
      }}
    >
      <div className="flex items-start gap-2.5">
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: `${accent}14` }}
        >
          <Zap size={11} style={{ color: accent }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span
                className="text-xs font-bold truncate"
                style={{ color: accent }}
              >
                #{tag.name}
              </span>
              <span className="text-[10px] text-[#576656] flex-shrink-0">
                {totalEvidence} Evidence
              </span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <LevelBadge level={growth.level} score={rawScore} />
            </div>
          </div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <StatusBadge status={status} />
            <span className="text-[10px] text-[#576656]">
              {growth.progressPct}% · ต่อไป {growth.requiredForNext.toFixed(0)}
            </span>
          </div>
          <ProgressBar progressPct={growth.progressPct} color={accent} height={3} />
          {totalEvidence > 0 && (
            <div className="mt-1.5">
              <EvidenceBreakdownChips breakdown={evidenceBreakdown} />
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
