import React, { useMemo, useState, useEffect } from "react";
import { BottomSheet } from "./BottomSheet";
import {
  Brain,
  Check,
  Plus,
  X,
  Sparkles,
  Leaf,
  TreeDeciduous,
  ChevronRight,
  Search,
  Edit3,
  Target,
  Repeat,
  BookOpen,
  Heart,
  User,
  Calendar,
  AlertTriangle,
  Lightbulb,
  Zap,
} from "lucide-react";
import type { JournalEntry, BrainTreeType, BrainTreeDimension, BrainTreeTag } from "../types";
import type { AIBrainPlacementSuggestion } from "../lib/aiService";
import type { PlacementCandidate } from "../lib/brainTree/brainTreeService";

interface MissingNodeProposal {
  typeName: string;
  dimensionName: string;
  tagName: string;
  reasoning: string;
}

const TYPE_COLOR_PRESETS = [
  "#4E7345", "#6B9361", "#4682B4", "#9370DB", "#5F9EA0", "#CD853F",
  "#4E8080", "#8FBC8F", "#B07070", "#708090", "#DAA520", "#7B68EE",
  "#8B4513", "#8F8FBC", "#B0578D", "#6A8CAA",
];

const PICKER_TYPE_ICONS: Array<{ key: string; label: string; Comp: React.ComponentType<{ size?: number }> }> = [
  { key: "Target", label: "Target", Comp: Target },
  { key: "Repeat", label: "Repeat", Comp: Repeat },
  { key: "BookOpen", label: "BookOpen", Comp: BookOpen },
  { key: "Heart", label: "Heart", Comp: Heart },
  { key: "User", label: "User", Comp: User },
  { key: "Calendar", label: "Calendar", Comp: Calendar },
  { key: "AlertTriangle", label: "AlertTriangle", Comp: AlertTriangle },
  { key: "Lightbulb", label: "Lightbulb", Comp: Lightbulb },
  { key: "Zap", label: "Zap", Comp: Zap },
  { key: "Sparkles", label: "Sparkles", Comp: Sparkles },
  { key: "TreeDeciduous", label: "TreeDeciduous", Comp: TreeDeciduous },
  { key: "Brain", label: "Brain", Comp: Brain },
];

export interface JournalPlacementBottomSheetProps {
  isOpen: boolean;
  journal: JournalEntry | null;
  suggestion: AIBrainPlacementSuggestion | null;
  existingTypes: BrainTreeType[];
  existingDimensions: BrainTreeDimension[];
  existingTags: BrainTreeTag[];
  onConfirm: (selectedTagIds: string[]) => void;
  onDismiss: () => void;
  onRequestCreateMissing: (
    proposal: MissingNodeProposal
  ) => Promise<{ tagId: string } | null>;
}

type Mode = "review" | "edit";

export const JournalPlacementBottomSheet: React.FC<JournalPlacementBottomSheetProps> = ({
  isOpen,
  journal,
  suggestion,
  existingTypes,
  existingDimensions,
  existingTags,
  onConfirm,
  onDismiss,
  onRequestCreateMissing,
}) => {
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  const [creatingMissingIndex, setCreatingMissingIndex] = useState<number | null>(null);
  const [acceptedMissingTagIds, setAcceptedMissingTagIds] = useState<Record<number, string>>({});
  const [mode, setMode] = useState<Mode>("review");

  const [pickerTypeId, setPickerTypeId] = useState<string | null>(null);
  const [pickerDimId, setPickerDimId] = useState<string | null>(null);
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerSelectedTagIds, setPickerSelectedTagIds] = useState<Set<string>>(new Set());
  const [pickerCreating, setPickerCreating] = useState(false);

  const [showPickerCreateType, setShowPickerCreateType] = useState(false);
  const [pickerCreateTypeName, setPickerCreateTypeName] = useState("");
  const [pickerCreateTypeColor, setPickerCreateTypeColor] = useState(TYPE_COLOR_PRESETS[0]);
  const [pickerCreateTypeIcon, setPickerCreateTypeIcon] = useState("TreeDeciduous");

  const [showPickerCreateDim, setShowPickerCreateDim] = useState(false);
  const [pickerCreateDimName, setPickerCreateDimName] = useState("");

  const [showPickerCreateTag, setShowPickerCreateTag] = useState(false);
  const [pickerCreateTagName, setPickerCreateTagName] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setMode("review");
      setSelectedTagIds(new Set());
      setAcceptedMissingTagIds({});
      setPickerTypeId(null);
      setPickerDimId(null);
      setPickerSearch("");
      setPickerSelectedTagIds(new Set());
      setShowPickerCreateType(false);
      setShowPickerCreateDim(false);
      setShowPickerCreateTag(false);
      setPickerCreateTypeName("");
      setPickerCreateDimName("");
      setPickerCreateTagName("");
      setPickerCreateTypeColor(TYPE_COLOR_PRESETS[0]);
      setPickerCreateTypeIcon("TreeDeciduous");
      setCreatingMissingIndex(null);
      setPickerCreating(false);
    }
  }, [isOpen]);

  const candidates: PlacementCandidate[] = suggestion?.candidates ?? [];
  const missingNodes: MissingNodeProposal[] = suggestion?.missingNodeProposals ?? [];

  const candidatesById = useMemo(() => {
    const map = new Map<string, PlacementCandidate>();
    candidates.forEach((c) => map.set(c.tag.id, c));
    return map;
  }, [candidates]);

  const allSelectedIds = useMemo(() => {
    const ids = new Set(selectedTagIds);
    Object.values(acceptedMissingTagIds).forEach((tid) => ids.add(tid));
    return ids;
  }, [selectedTagIds, acceptedMissingTagIds]);

  const dimsOfType = useMemo(() => {
    const map = new Map<string, BrainTreeDimension[]>();
    existingDimensions.forEach((d) => {
      const arr = map.get(d.brainTreeTypeId) ?? [];
      arr.push(d);
      map.set(d.brainTreeTypeId, arr);
    });
    return map;
  }, [existingDimensions]);

  const tagsOfDim = useMemo(() => {
    const map = new Map<string, BrainTreeTag[]>();
    existingTags.forEach((t) => {
      const arr = map.get(t.brainTreeDimensionId) ?? [];
      arr.push(t);
      map.set(t.brainTreeDimensionId, arr);
    });
    return map;
  }, [existingTags]);

  const typeOf = (typeId: string) => existingTypes.find((t) => t.id === typeId);
  const dimOf = (dimId: string) => existingDimensions.find((d) => d.id === dimId);

  const handleToggleCandidate = (tagId: string) => {
    setSelectedTagIds((prev) => {
      const next = new Set(prev);
      if (next.has(tagId)) next.delete(tagId);
      else next.add(tagId);
      return next;
    });
  };

  const handleCreateMissing = async (index: number, proposal: MissingNodeProposal) => {
    if (acceptedMissingTagIds[index] != null) return;
    setCreatingMissingIndex(index);
    try {
      const result = await onRequestCreateMissing(proposal);
      if (result?.tagId) {
        setAcceptedMissingTagIds((prev) => ({ ...prev, [index]: result.tagId }));
        setSelectedTagIds((prev) => new Set(prev).add(result.tagId));
      }
    } finally {
      setCreatingMissingIndex(null);
    }
  };

  const handleConfirm = () => {
    const ids = Array.from(allSelectedIds);
    onConfirm(ids);
    setSelectedTagIds(new Set());
    setAcceptedMissingTagIds({});
    setMode("review");
  };

  const handleDismissAll = () => {
    setSelectedTagIds(new Set());
    setAcceptedMissingTagIds({});
    setMode("review");
    onDismiss();
  };

  const journalPreview = useMemo(() => {
    if (!journal) return null;
    const text = `${journal.title} ${journal.content}`;
    return text.slice(0, 120) + (text.length > 120 ? "…" : "");
  }, [journal]);

  const showEmpty = candidates.length === 0 && missingNodes.length === 0;

  const handleEnterEditMode = () => {
    setPickerSelectedTagIds(new Set(allSelectedIds));
    let firstTypeId = pickerTypeId;
    if (!firstTypeId && candidates.length > 0) {
      firstTypeId = candidates[0].type.id;
    }
    if (!firstTypeId && existingTypes.length > 0) {
      firstTypeId = existingTypes[0].id;
    }
    if (firstTypeId) setPickerTypeId(firstTypeId);
    const candidateDim = candidates[0]?.dimension.id;
    if (candidateDim && dimsOfType.get(firstTypeId!)?.some((d) => d.id === candidateDim)) {
      setPickerDimId(candidateDim);
    } else {
      const firstDimOfType = firstTypeId ? dimsOfType.get(firstTypeId)?.[0]?.id ?? null : null;
      setPickerDimId(firstDimOfType);
    }
    setPickerSearch("");
    setMode("edit");
  };

  const handleExitEditCancel = () => {
    setMode("review");
  };

  const handleSavePickerEdits = () => {
    setAcceptedMissingTagIds({});
    setSelectedTagIds(new Set(pickerSelectedTagIds));
    setMode("review");
  };

  const handleTogglePickerTag = (tagId: string) => {
    setPickerSelectedTagIds((prev) => {
      const next = new Set(prev);
      if (next.has(tagId)) next.delete(tagId);
      else next.add(tagId);
      return next;
    });
  };

  const currentType = pickerTypeId ? existingTypes.find((t) => t.id === pickerTypeId) : null;
  const currentDims = pickerTypeId ? dimsOfType.get(pickerTypeId) ?? [] : [];
  const currentDim = pickerDimId ? existingDimensions.find((d) => d.id === pickerDimId) : null;
  const currentTagsAll = pickerDimId ? tagsOfDim.get(pickerDimId) ?? [] : [];
  const currentTags = useMemo(() => {
    const q = pickerSearch.trim().toLowerCase();
    if (!q) return currentTagsAll;
    return currentTagsAll.filter(
      (t) => t.name.toLowerCase().includes(q)
    );
  }, [currentTagsAll, pickerSearch]);

  const handleSubmitCreatePickerType = async () => {
    const typeName = pickerCreateTypeName.trim();
    const dimName = pickerCreateDimName.trim() || "ทั่วไป";
    const tagName = pickerCreateTagName.trim() || "เริ่มต้น";
    if (!typeName) return;
    setPickerCreating(true);
    try {
      const res = await onRequestCreateMissing({
        typeName,
        dimensionName: dimName,
        tagName,
        reasoning: "Created by user via picker",
      });
      if (res?.tagId) {
        const nextTypes = [...existingTypes];
        const createdType = nextTypes.find((t) => t.name.toLowerCase() === typeName.toLowerCase());
        if (createdType) {
          const nextDims = [...existingDimensions].filter((d) => d.brainTreeTypeId === createdType.id);
          const createdDim = nextDims.find((d) => d.name.toLowerCase() === dimName.toLowerCase());
          setPickerTypeId(createdType.id);
          setPickerDimId(createdDim?.id ?? null);
          setPickerSelectedTagIds((prev) => new Set(prev).add(res.tagId));
        }
      }
      setShowPickerCreateType(false);
      setPickerCreateTypeName("");
      setPickerCreateDimName("");
      setPickerCreateTagName("");
    } finally {
      setPickerCreating(false);
    }
  };

  const handleSubmitCreatePickerDim = async () => {
    if (!pickerTypeId) return;
    const dimName = pickerCreateDimName.trim();
    const tagName = pickerCreateTagName.trim() || "เริ่มต้น";
    if (!dimName) return;
    const t = existingTypes.find((tt) => tt.id === pickerTypeId);
    if (!t) return;
    setPickerCreating(true);
    try {
      const res = await onRequestCreateMissing({
        typeName: t.name,
        dimensionName: dimName,
        tagName,
        reasoning: "Created by user via picker",
      });
      if (res?.tagId) {
        const nextDims = [...existingDimensions].filter((d) => d.brainTreeTypeId === pickerTypeId);
        const createdDim = nextDims.find((d) => d.name.toLowerCase() === dimName.toLowerCase());
        if (createdDim) setPickerDimId(createdDim.id);
        setPickerSelectedTagIds((prev) => new Set(prev).add(res.tagId));
      }
      setShowPickerCreateDim(false);
      setPickerCreateDimName("");
      setPickerCreateTagName("");
    } finally {
      setPickerCreating(false);
    }
  };

  const handleSubmitCreatePickerTag = async () => {
    if (!pickerTypeId || !pickerDimId) return;
    const tagName = pickerCreateTagName.trim();
    if (!tagName) return;
    const t = existingTypes.find((tt) => tt.id === pickerTypeId);
    const d = existingDimensions.find((dd) => dd.id === pickerDimId);
    if (!t || !d) return;
    setPickerCreating(true);
    try {
      const res = await onRequestCreateMissing({
        typeName: t.name,
        dimensionName: d.name,
        tagName,
        reasoning: "Created by user via picker",
      });
      if (res?.tagId) {
        setPickerSelectedTagIds((prev) => new Set(prev).add(res.tagId));
      }
      setShowPickerCreateTag(false);
      setPickerCreateTagName("");
    } finally {
      setPickerCreating(false);
    }
  };

  const reviewFooter = (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={handleDismissAll}
        className="py-3 px-4 rounded-xl text-sm font-medium transition-colors flex-shrink-0"
        style={{ background: "rgba(255,255,255,0.05)", color: "#869883" }}
      >
        ข้าม (ไม่แขวน)
      </button>
      <button
        onClick={handleEnterEditMode}
        className="py-3 px-4 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 flex-shrink-0"
        style={{
          background: "rgba(138, 111, 48, 0.16)",
          color: "#D4AF37",
          border: "1px solid rgba(212,175,55,0.3)",
        }}
      >
        <Edit3 size={14} />
        แก้ไข
      </button>
      <button
        onClick={handleConfirm}
        disabled={allSelectedIds.size === 0}
        className="flex-1 min-w-[160px] py-3 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
        style={{
          background: "linear-gradient(135deg, #4E7345, #6B9361)",
          color: "white",
        }}
      >
        ยืนยันแขวน ({allSelectedIds.size})
      </button>
    </div>
  );

  const editFooter = (
    <div className="flex gap-2">
      <button
        onClick={handleExitEditCancel}
        className="flex-1 py-3 rounded-xl text-sm font-medium transition-colors"
        style={{ background: "rgba(255,255,255,0.05)", color: "#869883" }}
      >
        ยกเลิก
      </button>
      <button
        onClick={handleSavePickerEdits}
        disabled={pickerCreating}
        className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60"
        style={{
          background: "linear-gradient(135deg, #8A6F30, #D4AF37)",
          color: "#0A0E0A",
        }}
      >
        บันทึกการแก้ไข ({pickerSelectedTagIds.size})
      </button>
    </div>
  );

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={handleDismissAll}
      title={mode === "review" ? "จัดหมวดลง Life Brain" : "แก้ไขตำแหน่งแขวน"}
      subtitle={
        mode === "review"
          ? undefined
          : "เลือก Type → Dimension → Tag ได้เอง (AI เสนอ / คุณตัดสินใจ)"
      }
      headerIcon={mode === "review" ? Brain : Edit3}
      maxHeight="92vh"
      footer={mode === "review" ? reviewFooter : editFooter}
    >
      {mode === "review" ? (
        <>
          {journal && (
            <div
              className="rounded-xl p-3 mb-4 text-xs"
              style={{
                background: "rgba(107,147,97,0.08)",
                border: "1px solid rgba(107,147,97,0.18)",
              }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span>{journal.mood}</span>
                <span className="font-semibold text-[#EBF1EA] truncate">{journal.title}</span>
              </div>
              <p className="text-[#869883] line-clamp-2 leading-relaxed">{journalPreview}</p>
            </div>
          )}

          {suggestion?.usedFallback === false && (
            <div className="flex items-center gap-1.5 text-[11px] mb-3" style={{ color: "#D4AF37" }}>
              <Sparkles size={12} />
              <span>AI วิเคราะห์และเสนอตำแหน่งที่น่าสนใจ</span>
            </div>
          )}
          {suggestion?.usedFallback === true && candidates.length > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] mb-3" style={{ color: "#869883" }}>
              <Leaf size={12} />
              <span>เสนอตามการจับคู่คำ (AI ไม่พร้อมใช้งาน)</span>
            </div>
          )}

          {showEmpty && (
            <div className="text-center py-10">
              <TreeDeciduous size={36} className="mx-auto mb-3 opacity-20" style={{ color: "#6B9361" }} />
              <p className="text-sm font-medium text-[#869883] mb-1">ยังไม่มีคำแนะนำ</p>
              <p className="text-xs text-[#576656] mb-4">
                กดปุ่มแก้ไขข้างล่างเพื่อเลือกตำแหน่งเอง หรือเพิ่มข้อมูลใน Brain Manager นะครับ
              </p>
            </div>
          )}

          {candidates.length > 0 && (
            <div className="mb-5">
              <h3 className="text-xs font-bold text-[#EBF1EA] mb-2 flex items-center gap-1.5">
                <span>📍</span>
                แนะนำตำแหน่งที่มีอยู่แล้ว
                <span className="text-[10px] font-normal text-[#576656] ml-1">(เลือกได้หลายที่)</span>
              </h3>
              <div className="space-y-2">
                {candidates.map((c) => {
                  const type = typeOf(c.type.id);
                  const dim = dimOf(c.dimension.id);
                  const checked = selectedTagIds.has(c.tag.id);
                  const score = c.score;
                  return (
                    <button
                      type="button"
                      key={c.tag.id}
                      onClick={() => handleToggleCandidate(c.tag.id)}
                      className={`w-full text-left rounded-xl p-3 transition-all border ${
                        checked
                          ? "bg-[rgba(107,147,97,0.18)]"
                          : "bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)]"
                      }`}
                      style={{
                        borderColor: checked ? "#6B9361" : "rgba(107,147,97,0.15)",
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-5 h-5 rounded mt-0.5 flex-shrink-0 flex items-center justify-center border transition-all"
                          style={{
                            background: checked ? "#4E7345" : "transparent",
                            borderColor: checked ? "#4E7345" : "#576656",
                          }}
                        >
                          {checked && <Check size={12} className="text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="text-xs font-semibold"
                              style={{ color: type?.color || "#EBF1EA" }}
                            >
                              {type?.name || c.type.name}
                            </span>
                            <ChevronRight size={10} className="text-[#576656]" />
                            <span className="text-xs text-[#EBF1EA]">{dim?.name || c.dimension.name}</span>
                            <ChevronRight size={10} className="text-[#576656]" />
                            <span className="text-xs font-bold text-[#6B9361]">#{c.tag.name}</span>
                          </div>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-[10px] text-[#576656]">
                              {typeOf(c.type.id)?.name}
                            </span>
                            <span
                              className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                              style={{
                                background:
                                  score >= 80
                                    ? "rgba(212,175,55,0.15)"
                                    : score >= 60
                                    ? "rgba(107,147,97,0.15)"
                                    : "rgba(134,152,131,0.15)",
                                color:
                                  score >= 80 ? "#D4AF37" : score >= 60 ? "#6B9361" : "#869883",
                              }}
                            >
                              {score}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {missingNodes.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-[#EBF1EA] mb-2 flex items-center gap-1.5">
                <Plus size={12} className="text-[#6B9361]" />
                เสนอสร้างตำแหน่งใหม่
                <span className="text-[10px] font-normal text-[#576656] ml-1">
                  (กดสร้างแล้วจะถูกเลือกอัตโนมัติ)
                </span>
              </h3>
              <div className="space-y-2">
                {missingNodes.map((m, idx) => {
                  const tagId = acceptedMissingTagIds[idx];
                  const creating = creatingMissingIndex === idx;
                  const accepted = tagId != null;
                  return (
                    <div
                      key={`${m.typeName}-${m.dimensionName}-${m.tagName}-${idx}`}
                      className={`rounded-xl p-3 transition-all border ${
                        accepted
                          ? "bg-[rgba(78,115,69,0.18)]"
                          : "bg-[rgba(255,255,255,0.03)]"
                      }`}
                      style={{
                        borderColor: accepted ? "#4E7345" : "rgba(176,112,112,0.25)",
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <span className="text-xs font-semibold text-[#B07070]">
                              {m.typeName}
                            </span>
                            <ChevronRight size={10} className="text-[#576656]" />
                            <span className="text-xs text-[#B8860B]">{m.dimensionName}</span>
                            <ChevronRight size={10} className="text-[#576656]" />
                            <span className="text-xs font-bold text-[#869883]">#{m.tagName}</span>
                          </div>
                          {m.reasoning && (
                            <p className="text-[11px] text-[#576656] leading-relaxed">
                              {m.reasoning}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCreateMissing(idx, m)}
                          disabled={accepted || creating}
                          className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                            accepted
                              ? "bg-[#4E7345] text-white cursor-default"
                              : creating
                              ? "bg-[rgba(255,255,255,0.08)] text-[#869883] cursor-wait"
                              : "bg-[rgba(107,147,97,0.2)] text-[#6B9361] hover:bg-[rgba(107,147,97,0.3)]"
                          }`}
                        >
                          {accepted ? (
                            <span className="flex items-center gap-1">
                              <Check size={11} /> สร้างแล้ว
                            </span>
                          ) : creating ? (
                            "กำลังสร้าง…"
                          ) : (
                            <span className="flex items-center gap-1">
                              <Plus size={11} /> สร้าง
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {journal && (
            <div className="rounded-xl p-2.5 mb-3 text-[11px]" style={{
              background: "rgba(138,111,48,0.06)",
              border: "1px solid rgba(212,175,55,0.15)",
            }}>
              <span className="font-semibold text-[#D4AF37]">กำลังแขวน Journal: </span>
              <span className="text-[#EBF1EA] line-clamp-1">{journal.title}</span>
            </div>
          )}

          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-[#EBF1EA] flex items-center gap-1.5">
                <span style={{ color: "#4E7345" }}>🌳</span> Brain Type
              </h3>
              {!showPickerCreateType && (
                <button
                  type="button"
                  onClick={() => {
                    setShowPickerCreateDim(false);
                    setShowPickerCreateTag(false);
                    setShowPickerCreateType(true);
                    setPickerCreateTypeName("");
                    setPickerCreateDimName("");
                    setPickerCreateTagName("");
                  }}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors"
                  style={{ background: "rgba(78,115,69,0.18)", color: "#6B9361" }}
                >
                  <Plus size={11} className="inline mr-0.5" /> สร้าง Type ใหม่
                </button>
              )}
            </div>

            {!showPickerCreateType ? (
              <div className="flex flex-wrap gap-2">
                {existingTypes.length === 0 && (
                  <p className="text-xs text-[#576656]">ยังไม่มี Type — กดสร้าง Type ใหม่เพื่อเริ่ม</p>
                )}
                {existingTypes.map((t) => {
                  const active = pickerTypeId === t.id;
                  const IconComp =
                    PICKER_TYPE_ICONS.find((x) => x.key === t.icon)?.Comp ?? TreeDeciduous;
                  return (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => {
                        setPickerTypeId(t.id);
                        const firstDim = dimsOfType.get(t.id)?.[0];
                        setPickerDimId(firstDim ? firstDim.id : null);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                        active ? "bg-opacity-30 scale-[1.02]" : "bg-opacity-5 hover:bg-opacity-10"
                      }`}
                      style={{
                        background: active
                          ? `${t.color}33`
                          : "rgba(255,255,255,0.03)",
                        color: active ? t.color : "#EBF1EA",
                        borderColor: active ? t.color : "rgba(255,255,255,0.06)",
                      }}
                    >
                      <IconComp size={13} />
                      <span>{t.name}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div
                className="rounded-xl p-3 border"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderColor: "rgba(78,115,69,0.3)",
                }}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-xs font-semibold text-[#6B9361]">สร้าง Brain Type ใหม่</h4>
                  <button
                    type="button"
                    onClick={() => setShowPickerCreateType(false)}
                    className="text-[#576656] hover:text-[#EBF1EA]"
                  >
                    <X size={14} />
                  </button>
                </div>
                <label className="block text-[11px] text-[#869883] mb-1">ชื่อ Type *</label>
                <input
                  type="text"
                  value={pickerCreateTypeName}
                  onChange={(e) => setPickerCreateTypeName(e.target.value)}
                  placeholder="เช่น Idea, Relationship, Work"
                  className="w-full rounded-lg px-3 py-2 text-sm mb-2 outline-none"
                  style={{
                    background: "rgba(0,0,0,0.25)",
                    border: "1px solid rgba(107,147,97,0.2)",
                    color: "#EBF1EA",
                  }}
                />
                <label className="block text-[11px] text-[#869883] mb-1">สีของ Type</label>
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {TYPE_COLOR_PRESETS.map((col) => (
                    <button
                      type="button"
                      key={col}
                      onClick={() => setPickerCreateTypeColor(col)}
                      className={`w-6 h-6 rounded-full transition-all ${
                        pickerCreateTypeColor === col ? "ring-2 ring-white scale-110" : ""
                      }`}
                      style={{ background: col }}
                    />
                  ))}
                </div>
                <label className="block text-[11px] text-[#869883] mb-1">ไอคอน</label>
                <div className="grid grid-cols-6 gap-1.5 mb-3">
                  {PICKER_TYPE_ICONS.map((it) => {
                    const active = pickerCreateTypeIcon === it.key;
                    const { Comp } = it;
                    return (
                      <button
                        type="button"
                        key={it.key}
                        onClick={() => setPickerCreateTypeIcon(it.key)}
                        className={`aspect-square rounded-lg flex items-center justify-center transition-all border ${
                          active ? "bg-[#4E7345] border-[#6B9361]" : "bg-black/20 border-transparent"
                        }`}
                      >
                        <Comp size={15} className={active ? "text-white" : "text-[#869883]"} />
                      </button>
                    );
                  })}
                </div>
                <label className="block text-[11px] text-[#869883] mb-1">
                  Dimension เริ่มต้น (ไม่ต้องกรอก = "ทั่วไป")
                </label>
                <input
                  type="text"
                  value={pickerCreateDimName}
                  onChange={(e) => setPickerCreateDimName(e.target.value)}
                  placeholder="เช่น Mental, Physical, Career"
                  className="w-full rounded-lg px-3 py-2 text-sm mb-2 outline-none"
                  style={{
                    background: "rgba(0,0,0,0.25)",
                    border: "1px solid rgba(107,147,97,0.2)",
                    color: "#EBF1EA",
                  }}
                />
                <label className="block text-[11px] text-[#869883] mb-1">
                  Tag เริ่มต้น (ไม่ต้องกรอก = "เริ่มต้น")
                </label>
                <input
                  type="text"
                  value={pickerCreateTagName}
                  onChange={(e) => setPickerCreateTagName(e.target.value)}
                  placeholder="เช่น สุขภาพจิต, สุขภาพร่างกาย"
                  className="w-full rounded-lg px-3 py-2 text-sm mb-3 outline-none"
                  style={{
                    background: "rgba(0,0,0,0.25)",
                    border: "1px solid rgba(107,147,97,0.2)",
                    color: "#EBF1EA",
                  }}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPickerCreateType(false)}
                    className="flex-1 py-2 rounded-lg text-xs font-medium"
                    style={{ background: "rgba(255,255,255,0.05)", color: "#869883" }}
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitCreatePickerType}
                    disabled={!pickerCreateTypeName.trim() || pickerCreating}
                    className="flex-1 py-2 rounded-lg text-xs font-semibold disabled:opacity-40"
                    style={{ background: "linear-gradient(135deg,#4E7345,#6B9361)", color: "white" }}
                  >
                    {pickerCreating ? "กำลังสร้าง…" : "สร้าง Type (พร้อม Dim+Tag)"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {pickerTypeId && currentType && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-[#EBF1EA] flex items-center gap-1.5">
                  <span style={{ color: currentType.color }}>🌿</span> Brain Dimension
                  <span className="text-[10px] font-normal text-[#576656]">(ภายใต้ {currentType.name})</span>
                </h3>
                {!showPickerCreateDim && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowPickerCreateType(false);
                      setShowPickerCreateTag(false);
                      setShowPickerCreateDim(true);
                      setPickerCreateDimName("");
                      setPickerCreateTagName("");
                    }}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors"
                    style={{ background: "rgba(107,147,97,0.18)", color: "#6B9361" }}
                  >
                    <Plus size={11} className="inline mr-0.5" /> สร้าง Dim ใหม่
                  </button>
                )}
              </div>

              {!showPickerCreateDim ? (
                <div className="flex flex-wrap gap-2">
                  {currentDims.length === 0 && (
                    <p className="text-xs text-[#576656]">
                      ยังไม่มี Dimension ใน {currentType.name} — กดสร้าง Dim ใหม่
                    </p>
                  )}
                  {currentDims.map((d) => {
                    const active = pickerDimId === d.id;
                    return (
                      <button
                        type="button"
                        key={d.id}
                        onClick={() => setPickerDimId(d.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                          active ? "scale-[1.03]" : "hover:bg-opacity-10"
                        }`}
                        style={{
                          background: active
                            ? `${d.color}33`
                            : "rgba(255,255,255,0.03)",
                          color: active ? d.color : "#EBF1EA",
                          borderColor: active ? d.color : "rgba(255,255,255,0.06)",
                        }}
                      >
                        {d.name}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div
                  className="rounded-xl p-3 border"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    borderColor: `${currentType.color}55`,
                  }}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <h4 className="text-xs font-semibold" style={{ color: currentType.color }}>
                      สร้าง Dimension ใหม่ใน {currentType.name}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowPickerCreateDim(false)}
                      className="text-[#576656] hover:text-[#EBF1EA]"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <label className="block text-[11px] text-[#869883] mb-1">ชื่อ Dimension *</label>
                  <input
                    type="text"
                    value={pickerCreateDimName}
                    onChange={(e) => setPickerCreateDimName(e.target.value)}
                    placeholder="เช่น Mental, Physical, Career"
                    className="w-full rounded-lg px-3 py-2 text-sm mb-2 outline-none"
                    style={{
                      background: "rgba(0,0,0,0.25)",
                      border: "1px solid rgba(107,147,97,0.2)",
                      color: "#EBF1EA",
                    }}
                  />
                  <label className="block text-[11px] text-[#869883] mb-1">
                    Tag เริ่มต้น (ไม่ต้องกรอก = "เริ่มต้น")
                  </label>
                  <input
                    type="text"
                    value={pickerCreateTagName}
                    onChange={(e) => setPickerCreateTagName(e.target.value)}
                    placeholder="เช่น สุขภาพจิต"
                    className="w-full rounded-lg px-3 py-2 text-sm mb-3 outline-none"
                    style={{
                      background: "rgba(0,0,0,0.25)",
                      border: "1px solid rgba(107,147,97,0.2)",
                      color: "#EBF1EA",
                    }}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPickerCreateDim(false)}
                      className="flex-1 py-2 rounded-lg text-xs font-medium"
                      style={{ background: "rgba(255,255,255,0.05)", color: "#869883" }}
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitCreatePickerDim}
                      disabled={!pickerCreateDimName.trim() || pickerCreating}
                      className="flex-1 py-2 rounded-lg text-xs font-semibold disabled:opacity-40"
                      style={{
                        background: "linear-gradient(135deg,#4E7345,#6B9361)",
                        color: "white",
                      }}
                    >
                      {pickerCreating ? "กำลังสร้าง…" : "สร้าง Dim (พร้อม Tag)"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {pickerDimId && currentDim && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-[#EBF1EA] flex items-center gap-1.5">
                  <span style={{ color: currentType?.color ?? "#6B9361" }}>🍃</span> Tag
                  <span className="text-[10px] font-normal text-[#576656]">
                    (ภายใต้ {typeOf(currentDim.brainTreeTypeId)?.name} → {currentDim.name})
                  </span>
                </h3>
                {!showPickerCreateTag && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowPickerCreateType(false);
                      setShowPickerCreateDim(false);
                      setShowPickerCreateTag(true);
                      setPickerCreateTagName("");
                    }}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors"
                    style={{ background: "rgba(107,147,97,0.18)", color: "#6B9361" }}
                  >
                    <Plus size={11} className="inline mr-0.5" /> สร้าง Tag ใหม่
                  </button>
                )}
              </div>

              <div
                className="flex items-center gap-2 rounded-lg px-3 py-2 mb-2"
                style={{
                  background: "rgba(0,0,0,0.25)",
                  border: "1px solid rgba(107,147,97,0.18)",
                }}
              >
                <Search size={14} className="text-[#576656] flex-shrink-0" />
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="ค้นหา Tag…"
                  className="flex-1 bg-transparent outline-none text-sm text-[#EBF1EA] placeholder:text-[#576656]"
                />
                {pickerSearch && (
                  <button
                    type="button"
                    onClick={() => setPickerSearch("")}
                    className="text-[#576656] hover:text-[#EBF1EA] flex-shrink-0"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {showPickerCreateTag && (
                <div
                  className="rounded-xl p-3 border mb-3"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    borderColor: "rgba(107,147,97,0.25)",
                  }}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <h4 className="text-xs font-semibold text-[#6B9361]">สร้าง Tag ใหม่</h4>
                    <button
                      type="button"
                      onClick={() => setShowPickerCreateTag(false)}
                      className="text-[#576656] hover:text-[#EBF1EA]"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <label className="block text-[11px] text-[#869883] mb-1">ชื่อ Tag *</label>
                  <input
                    type="text"
                    value={pickerCreateTagName}
                    onChange={(e) => setPickerCreateTagName(e.target.value)}
                    placeholder="เช่น สุขภาพจิต, สัมพันธภาพ"
                    className="w-full rounded-lg px-3 py-2 text-sm mb-3 outline-none"
                    style={{
                      background: "rgba(0,0,0,0.25)",
                      border: "1px solid rgba(107,147,97,0.2)",
                      color: "#EBF1EA",
                    }}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPickerCreateTag(false)}
                      className="flex-1 py-2 rounded-lg text-xs font-medium"
                      style={{ background: "rgba(255,255,255,0.05)", color: "#869883" }}
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitCreatePickerTag}
                      disabled={!pickerCreateTagName.trim() || pickerCreating}
                      className="flex-1 py-2 rounded-lg text-xs font-semibold disabled:opacity-40"
                      style={{
                        background: "linear-gradient(135deg,#4E7345,#6B9361)",
                        color: "white",
                      }}
                    >
                      {pickerCreating ? "กำลังสร้าง…" : "สร้าง Tag"}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {currentTagsAll.length === 0 && !showPickerCreateTag && (
                  <div className="text-center py-5">
                    <p className="text-xs text-[#576656] mb-2">
                      ยังไม่มี Tag ใน Dimension นี้
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPickerCreateType(false);
                        setShowPickerCreateDim(false);
                        setShowPickerCreateTag(true);
                      }}
                      className="text-[11px] font-semibold px-3 py-1.5 rounded-lg"
                      style={{ background: "rgba(107,147,97,0.2)", color: "#6B9361" }}
                    >
                      <Plus size={11} className="inline mr-0.5" /> สร้าง Tag แรก
                    </button>
                  </div>
                )}
                {currentTagsAll.length > 0 && currentTags.length === 0 && (
                  <p className="text-xs text-[#576656] text-center py-3">
                    ไม่พบ Tag ที่ตรงกับ "{pickerSearch}"
                  </p>
                )}
                {currentTags.map((tg) => {
                  const checked = pickerSelectedTagIds.has(tg.id);
                  return (
                    <button
                      type="button"
                      key={tg.id}
                      onClick={() => handleTogglePickerTag(tg.id)}
                      className={`w-full text-left rounded-xl p-2.5 transition-all border ${
                        checked
                          ? "bg-[rgba(107,147,97,0.18)]"
                          : "bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)]"
                      }`}
                      style={{
                        borderColor: checked ? "#6B9361" : "rgba(107,147,97,0.15)",
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-5 h-5 rounded mt-0.5 flex-shrink-0 flex items-center justify-center border transition-all"
                          style={{
                            background: checked ? "#4E7345" : "transparent",
                            borderColor: checked ? "#4E7345" : "#576656",
                          }}
                        >
                          {checked && <Check size={12} className="text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-[#6B9361]">#{tg.name}</span>
                            {tg.level > 0 && (
                              <span
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                                style={{
                                  background: "rgba(212,175,55,0.12)",
                                  color: "#D4AF37",
                                  border: "1px solid rgba(212,175,55,0.2)",
                                }}
                              >
                                Lv.{tg.level}
                              </span>
                            )}
                          </div>
                          {candidatesById.has(tg.id) && (
                            <span
                              className="inline-block text-[10px] font-medium px-1.5 py-0.5 rounded mt-1"
                              style={{
                                background: "rgba(212,175,55,0.1)",
                                color: "#D4AF37",
                              }}
                            >
                              AI แนะนำ
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </BottomSheet>
  );
};
