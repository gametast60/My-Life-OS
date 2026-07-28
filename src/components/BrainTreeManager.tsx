import React, { useState, useMemo } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  ChevronRight,
  ChevronDown,
  TreeDeciduous,
  Leaf,
  Zap,
  Palette,
  GripVertical,
  Sparkles,
  Target,
  BookOpen,
  Heart,
  User,
  Calendar,
  AlertTriangle,
  Lightbulb,
  Repeat,
} from "lucide-react";
import type {
  BrainTreeType,
  BrainTreeDimension,
  BrainTreeTag,
} from "../types";
import { ConfirmDialog } from "./ConfirmDialog";

const TYPE_COLOR_PRESETS = [
  "#4E7345", "#6B9361", "#4682B4", "#9370DB", "#5F9EA0", "#CD853F",
  "#B07070", "#8FBC8F", "#B8860B", "#D4AF37", "#708090", "#4E8080",
  "#DA70D6", "#7B68EE", "#20B2AA", "#FF69B4",
];

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>> = {
  Target, Repeat, BookOpen, Heart, User, Calendar, AlertTriangle, Lightbulb, Zap, Sparkles, TreeDeciduous, Brain: TreeDeciduous,
};

function typeIconOf(name: string) {
  return ICON_MAP[name] ?? TreeDeciduous;
}

export interface BrainTreeManagerProps {
  types: BrainTreeType[];
  dimensions: BrainTreeDimension[];
  tags: BrainTreeTag[];
  onAddType: (name: string, color: string, icon: string, priority: number) => void;
  onUpdateType: (id: string, patch: Partial<BrainTreeType>) => void;
  onDeleteType: (id: string) => void;
  onAddDimension: (brainTreeTypeId: string, name: string, color?: string, priority?: number) => void;
  onUpdateDimension: (id: string, patch: Partial<BrainTreeDimension>) => void;
  onDeleteDimension: (id: string) => void;
  onAddTag: (brainTreeTypeId: string, brainTreeDimensionId: string, name: string, priority?: number) => void;
  onUpdateTag: (id: string, patch: Partial<BrainTreeTag>) => void;
  onDeleteTag: (id: string) => void;
}

export const BrainTreeManager: React.FC<BrainTreeManagerProps> = ({
  types, dimensions, tags,
  onAddType, onUpdateType, onDeleteType,
  onAddDimension, onUpdateDimension, onDeleteDimension,
  onAddTag, onUpdateTag, onDeleteTag,
}) => {
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());
  const [expandedDims, setExpandedDims] = useState<Set<string>>(new Set());

  const [showAddType, setShowAddType] = useState(false);
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);

  const [addDimTypeId, setAddDimTypeId] = useState<string | null>(null);
  const [editingDimId, setEditingDimId] = useState<string | null>(null);

  const [addTagDimId, setAddTagDimId] = useState<string | null>(null);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<
    | { kind: "type"; id: string; label: string }
    | { kind: "dim"; id: string; label: string }
    | { kind: "tag"; id: string; label: string }
    | null
  >(null);

  const dimsByType = useMemo(() => {
    const map = new Map<string, BrainTreeDimension[]>();
    (dimensions || []).forEach((d) => {
      const arr = map.get(d.brainTreeTypeId) ?? [];
      arr.push(d);
      map.set(d.brainTreeTypeId, arr);
    });
    for (const arr of map.values()) arr.sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name));
    return map;
  }, [dimensions]);

  const tagsByDim = useMemo(() => {
    const map = new Map<string, BrainTreeTag[]>();
    (tags || []).forEach((t) => {
      const arr = map.get(t.brainTreeDimensionId) ?? [];
      arr.push(t);
      map.set(t.brainTreeDimensionId, arr);
    });
    for (const arr of map.values()) arr.sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name));
    return map;
  }, [tags]);

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

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.kind === "type") onDeleteType(deleteTarget.id);
    else if (deleteTarget.kind === "dim") onDeleteDimension(deleteTarget.id);
    else if (deleteTarget.kind === "tag") onDeleteTag(deleteTarget.id);
    setDeleteTarget(null);
  };

  const totalDimCount = dimensions.length;
  const totalTagCount = tags.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: "linear-gradient(135deg, rgba(107,147,97,0.18), rgba(78,115,69,0.08))",
          border: "1px solid rgba(107,147,97,0.25)",
        }}
      >
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#EBF1EA] flex items-center gap-2">
              <GripVertical size={18} style={{ color: "#6B9361" }} />
              Brain Tree Manager
            </h2>
            <p className="text-xs text-[#869883] mt-1">
              จัดการโครงสร้างต้นไม้: {types.length} Types · {totalDimCount} Dimensions · {totalTagCount} Tags
            </p>
          </div>
          <button
            onClick={() => setShowAddType(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #4E7345, #6B9361)",
              color: "white",
              boxShadow: "0 6px 16px rgba(78,115,69,0.3)",
            }}
          >
            <Plus size={15} />
            เพิ่ม Brain Type
          </button>
        </div>
      </div>

      {/* Add Type Form */}
      {showAddType && (
        <TypeFormCard
          title="เพิ่ม Brain Type ใหม่"
          submitLabel="เพิ่ม Type"
          onCancel={() => setShowAddType(false)}
          onSubmit={(name, color, icon) => {
            const nextPriority = (types.reduce((m, t) => Math.max(m, t.priority), 0) || 0) + 1;
            onAddType(name, color, icon, nextPriority);
            setShowAddType(false);
          }}
        />
      )}

      {/* Empty */}
      {types.length === 0 && !showAddType && (
        <div className="text-center py-16 rounded-2xl" style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px dashed rgba(107,147,97,0.2)"
        }}>
          <TreeDeciduous size={36} className="mx-auto mb-3 opacity-25" style={{ color: "#6B9361" }} />
          <p className="text-sm font-semibold mb-1 text-[#869883]">ยังไม่มี Brain Type</p>
          <p className="text-xs text-[#576656] mb-4 max-w-xs mx-auto">
            กดปุ่มด้านบนเพื่อสร้าง Type แรก (เช่น Goal, Habit, Knowledge)
          </p>
        </div>
      )}

      {/* Types list */}
      {types
        .slice()
        .sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name))
        .map((t) => {
          const dims = dimsByType.get(t.id) ?? [];
          const expanded = expandedTypes.has(t.id);
          const editing = editingTypeId === t.id;
          const dimCount = dims.length;
          const tagCount = dims.reduce((a, d) => a + (tagsByDim.get(d.id)?.length ?? 0), 0);
          return (
            <div
              key={t.id}
              className="rounded-2xl overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${t.color}44`,
              }}
            >
              {/* Type header */}
              <div className="p-4">
                {editing ? (
                  <TypeFormCard
                    title="แก้ไข Brain Type"
                    submitLabel="บันทึก"
                    initialName={t.name}
                    initialColor={t.color}
                    initialIcon={t.icon}
                    onCancel={() => setEditingTypeId(null)}
                    inline
                    onSubmit={(name, color, icon) => {
                      onUpdateType(t.id, { name, color, icon });
                      setEditingTypeId(null);
                    }}
                  />
                ) : (
                  <>
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => toggleType(t.id)}
                        className="flex-shrink-0 text-[#869883] hover:text-[#EBF1EA] mt-1"
                      >
                        {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${t.color}33` }}
                      >
                        {React.createElement(typeIconOf(t.icon), { size: 18, style: { color: t.color } })}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <h3 className="font-bold text-sm text-[#EBF1EA] truncate">{t.name}</h3>
                            <span className="text-[10px] px-1.5 py-0.5 rounded flex-shrink-0" style={{
                              background: "rgba(255,255,255,0.05)",
                              color: "#869883",
                            }}>
                              {dimCount} มิติ · {tagCount} Tags
                            </span>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              title="แก้ไข"
                              onClick={() => setEditingTypeId(t.id)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                            >
                              <Edit2 size={13} className="text-white" />
                            </button>
                            <button
                              title="ลบ"
                              onClick={() => setDeleteTarget({ kind: "type", id: t.id, label: t.name })}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-950/40 transition-colors"
                            >
                              <Trash2 size={13} className="text-red-400" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-[#576656]">
                          <span className="inline-flex items-center gap-1">
                            <Palette size={10} style={{ color: t.color }} />
                            <span className="font-mono">{t.color}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Expanded body: Dims + Add Dim button */}
              {expanded && !editing && (
                <div
                  className="px-3 pb-3 space-y-2"
                  style={{ borderTop: `1px solid ${t.color}22` }}
                >
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#869883] uppercase tracking-wider">
                      Dimensions ({dimCount})
                    </span>
                    <button
                      onClick={() => setAddDimTypeId(addDimTypeId === t.id ? null : t.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors"
                      style={{
                        background: `${t.color}22`,
                        color: t.color,
                        border: `1px solid ${t.color}33`,
                      }}
                    >
                      <Plus size={11} /> เพิ่ม Dimension
                    </button>
                  </div>

                  {addDimTypeId === t.id && (
                    <NameFormCard
                      label="Dimension ใหม่"
                      placeholder="เช่น การเงิน, สุขภาพ, การเรียนรู้"
                      submitLabel="เพิ่ม"
                      onCancel={() => setAddDimTypeId(null)}
                      onSubmit={(name) => {
                        const dimsNow = dimsByType.get(t.id) ?? [];
                        const nextP = (dimsNow.reduce((m, d) => Math.max(m, d.priority), 0) || 0) + 1;
                        onAddDimension(t.id, name, undefined, nextP);
                        setAddDimTypeId(null);
                      }}
                    />
                  )}

                  {dimCount === 0 && addDimTypeId !== t.id && (
                    <p className="text-[11px] text-[#576656] px-2">
                      ยังไม่มี Dimension — กดเพิ่มด้านบน
                    </p>
                  )}

                  {dims.map((d) => (
                    <DimRow
                      key={d.id}
                      dim={d}
                      parentColor={t.color}
                      typeId={t.id}
                      tags={tagsByDim.get(d.id) ?? []}
                      expanded={expandedDims.has(d.id)}
                      onToggle={() => toggleDim(d.id)}
                      editing={editingDimId === d.id}
                      onStartEdit={() => setEditingDimId(d.id)}
                      onCancelEdit={() => setEditingDimId(null)}
                      onSubmitEdit={(name, color) => {
                        onUpdateDimension(d.id, { name, color });
                        setEditingDimId(null);
                      }}
                      onDelete={() => setDeleteTarget({ kind: "dim", id: d.id, label: d.name })}
                      showAddTag={addTagDimId === d.id}
                      onRequestAddTag={() => setAddTagDimId(addTagDimId === d.id ? null : d.id)}
                      onCancelAddTag={() => setAddTagDimId(null)}
                      onSubmitAddTag={(name) => {
                        const tagsNow = tagsByDim.get(d.id) ?? [];
                        const nextP = (tagsNow.reduce((m, tg) => Math.max(m, tg.priority), 0) || 0) + 1;
                        onAddTag(t.brainTreeTypeId || t.id, d.id, name, nextP);
                        setAddTagDimId(null);
                      }}
                      editingTagId={editingTagId}
                      onStartEditTag={(tgId) => setEditingTagId(tgId)}
                      onCancelEditTag={() => setEditingTagId(null)}
                      onSubmitEditTag={(tgId, patch) => {
                        onUpdateTag(tgId, patch);
                        setEditingTagId(null);
                      }}
                      onDeleteTag={(tg) => setDeleteTarget({ kind: "tag", id: tg.id, label: tg.name })}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title={deleteTarget ? `ลบ ${deleteTarget.label}?` : "ลบข้อมูล?"}
        message={
          deleteTarget?.kind === "type"
            ? "การลบ Brain Type จะลบ Dimension และ Tag ภายใต้ทั้งหมด รวมถึง Evidence ที่อ้างอิงถึง Tag เหล่านั้น"
            : deleteTarget?.kind === "dim"
            ? "การลบ Dimension จะลบ Tag ภายใต้ทั้งหมด และ Evidence ที่อ้างอิงถึง Tag เหล่านั้น"
            : "การลบ Tag จะลบการเชื่อมโยงกับ Evidence ที่เกี่ยวข้อง"
        }
        confirmText="ยืนยันลบ"
        cancelText="ยกเลิก"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

function TypeFormCard({
  title, submitLabel, initialName, initialColor, initialIcon, onCancel, onSubmit, inline,
}: {
  title: string;
  submitLabel: string;
  initialName?: string;
  initialColor?: string;
  initialIcon?: string;
  onCancel: () => void;
  onSubmit: (name: string, color: string, icon: string) => void;
  inline?: boolean;
}) {
  const [name, setName] = useState(initialName ?? "");
  const [color, setColor] = useState(initialColor ?? "#4E7345");
  const [icon, setIcon] = useState(initialIcon ?? "Target");
  const [error, setError] = useState("");

  const submit = () => {
    const n = name.trim();
    if (!n) {
      setError("กรุณากรอกชื่อ");
      return;
    }
    onSubmit(n, color, icon);
  };

  const iconNames = Object.keys(ICON_MAP);

  return (
    <div
      className={`rounded-xl p-4 space-y-3 ${inline ? "" : ""}`}
      style={{
        background: inline ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.03)",
        border: `1px solid rgba(107,147,97,0.2)`,
      }}
    >
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-[#EBF1EA]">{title}</h4>
        {inline && (
          <button onClick={onCancel} className="text-[#869883] hover:text-white text-xs">
            <X size={14} />
          </button>
        )}
      </div>
      <div>
        <label className="block text-[11px] font-medium mb-1 text-[#869883]">ชื่อ *</label>
        <input
          value={name}
          onChange={(e) => { setName(e.target.value); setError(""); }}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          placeholder="Goal, Habit, Knowledge, Belief, ..."
          className="w-full px-3 py-2 rounded-lg text-xs outline-none"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${error ? "#B07070" : "rgba(107,147,97,0.2)"}`,
            color: "#EBF1EA",
          }}
        />
        {error && <p className="text-[10px] mt-1 text-red-400">{error}</p>}
      </div>
      <div>
        <label className="block text-[11px] font-medium mb-1.5 text-[#869883]">สี</label>
        <div className="flex flex-wrap gap-1.5">
          {TYPE_COLOR_PRESETS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className="w-6 h-6 rounded-md transition-transform hover:scale-110"
              style={{
                background: c,
                border: color === c ? "2px solid #EBF1EA" : "2px solid transparent",
                boxShadow: color === c ? `0 0 0 2px ${c}55` : "none",
              }}
              title={c}
              aria-label={c}
            />
          ))}
        </div>
      </div>
      <div>
        <label className="block text-[11px] font-medium mb-1.5 text-[#869883]">ไอคอน</label>
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
          {iconNames.map((iname) => {
            const Icon = ICON_MAP[iname];
            const selected = icon === iname;
            return (
              <button
                key={iname}
                type="button"
                onClick={() => setIcon(iname)}
                title={iname}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                style={{
                  background: selected ? `${color}33` : "transparent",
                  border: `1px solid ${selected ? color : "rgba(255,255,255,0.05)"}`,
                  color: selected ? color : "#869883",
                }}
              >
                <Icon size={14} />
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        {!inline && (
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-xs font-medium"
            style={{ background: "rgba(255,255,255,0.05)", color: "#869883" }}
          >
            ยกเลิก
          </button>
        )}
        <button
          onClick={submit}
          className="px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:scale-[1.02] active:scale-95 transition-transform"
          style={{ background: "linear-gradient(135deg, #4E7345, #6B9361)", color: "white" }}
        >
          <Check size={12} />
          {submitLabel}
        </button>
      </div>
    </div>
  );
}

function NameFormCard({
  label, placeholder, submitLabel, onCancel, onSubmit, initialValue,
}: {
  key?: string | number;
  label: string;
  placeholder?: string;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (value: string) => void;
  initialValue?: string;
}) {
  const [value, setValue] = useState(initialValue ?? "");
  const [err, setErr] = useState("");
  const submit = () => {
    const v = value.trim();
    if (!v) {
      setErr("กรุณากรอกชื่อ");
      return;
    }
    onSubmit(v);
  };
  return (
    <div
      className="rounded-xl p-3 space-y-2"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(107,147,97,0.18)",
      }}
    >
      <label className="block text-[11px] font-medium text-[#869883]">{label}</label>
      <input
        autoFocus
        value={value}
        onChange={(e) => { setValue(e.target.value); setErr(""); }}
        onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg text-xs outline-none"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: `1px solid ${err ? "#B07070" : "rgba(107,147,97,0.2)"}`,
          color: "#EBF1EA",
        }}
      />
      {err && <p className="text-[10px] text-red-400">{err}</p>}
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 rounded-md text-[11px] font-medium"
          style={{ background: "rgba(255,255,255,0.05)", color: "#869883" }}
        >
          ยกเลิก
        </button>
        <button
          onClick={submit}
          className="px-3 py-1.5 rounded-md text-[11px] font-semibold"
          style={{ background: "rgba(107,147,97,0.25)", color: "#6B9361", border: "1px solid rgba(107,147,97,0.3)" }}
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
}

function DimRow({
  dim, parentColor, typeId, tags, expanded, onToggle, editing, onStartEdit, onCancelEdit, onSubmitEdit,
  onDelete, showAddTag, onRequestAddTag, onCancelAddTag, onSubmitAddTag,
  editingTagId, onStartEditTag, onCancelEditTag, onSubmitEditTag, onDeleteTag,
}: {
  key?: string | number;
  dim: BrainTreeDimension;
  parentColor: string;
  typeId: string;
  tags: BrainTreeTag[];
  expanded: boolean;
  onToggle: () => void;
  editing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSubmitEdit: (name: string, color?: string) => void;
  onDelete: () => void;
  showAddTag: boolean;
  onRequestAddTag: () => void;
  onCancelAddTag: () => void;
  onSubmitAddTag: (name: string) => void;
  editingTagId: string | null;
  onStartEditTag: (id: string) => void;
  onCancelEditTag: () => void;
  onSubmitEditTag: (id: string, patch: Partial<BrainTreeTag>) => void;
  onDeleteTag: (t: BrainTreeTag) => void;
}) {
  const accent = dim.color || parentColor;
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${accent}33` }}
    >
      {editing ? (
        <div className="p-3">
          <TypeFormCard
            title="แก้ไข Dimension"
            submitLabel="บันทึก"
            initialName={dim.name}
            initialColor={accent}
            initialIcon="Leaf"
            inline
            onCancel={onCancelEdit}
            onSubmit={(name, color) => onSubmitEdit(name, color)}
          />
        </div>
      ) : (
        <>
          <div className="p-3">
            <div className="flex items-start gap-2.5">
              <button
                type="button"
                onClick={onToggle}
                className="flex-shrink-0 mt-1 text-[#576656] hover:text-white"
              >
                {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${accent}18` }}
              >
                <Leaf size={13} style={{ color: accent }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap mb-0.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <h4 className="text-sm font-semibold text-[#EBF1EA] truncate">{dim.name}</h4>
                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{
                      background: "rgba(255,255,255,0.05)",
                      color: "#576656",
                    }}>
                      {tags.length} Tags
                    </span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      title="แก้ไข"
                      onClick={onStartEdit}
                      className="w-6 h-6 rounded-md flex items-center justify-center text-white hover:bg-white/10"
                    >
                      <Edit2 size={11} className="text-white" />
                    </button>
                    <button
                      title="ลบ"
                      onClick={onDelete}
                      className="w-6 h-6 rounded-md flex items-center justify-center text-red-400 hover:bg-red-950/40"
                    >
                      <Trash2 size={11} className="text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {expanded && (
            <div className="px-2.5 pb-2.5 space-y-1.5" style={{ borderTop: `1px solid ${accent}22` }}>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[10px] font-semibold text-[#576656] uppercase tracking-wider">
                  Tags ({tags.length})
                </span>
                <button
                  onClick={onRequestAddTag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors"
                  style={{
                    background: `${accent}22`,
                    color: accent,
                    border: `1px solid ${accent}33`,
                  }}
                >
                  <Plus size={10} /> เพิ่ม Tag
                </button>
              </div>

              {showAddTag && (
                <NameFormCard
                  label="Tag ใหม่"
                  placeholder="เช่น Korean, Flutter, React, DCA, Meditation…"
                  submitLabel="เพิ่ม"
                  onCancel={onCancelAddTag}
                  onSubmit={onSubmitAddTag}
                />
              )}

              {tags.length === 0 && !showAddTag && (
                <p className="text-[10px] text-[#576656] px-1.5">
                  ยังไม่มี Tag — เมื่อบันทึก Journal AI จะเสนอ Tag ให้อัตโนมัติ
                </p>
              )}

              {tags.map((tg) => {
                const isEditing = editingTagId === tg.id;
                if (isEditing) {
                  return (
                    <NameFormCard
                      key={tg.id}
                      label="แก้ไข Tag"
                      submitLabel="บันทึก"
                      initialValue={tg.name}
                      onCancel={onCancelEditTag}
                      onSubmit={(name) => onSubmitEditTag(tg.id, { name })}
                    />
                  );
                }
                return (
                  <div
                    key={tg.id}
                    className="flex items-center justify-between gap-2 p-2 rounded-lg"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: `1px solid ${accent}22`,
                    }}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Zap size={11} style={{ color: accent }} />
                      <span className="text-xs font-semibold truncate" style={{ color: accent }}>#{tg.name}</span>
                      {tg.level > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-bold flex-shrink-0" style={{
                          background: "rgba(212,175,55,0.12)",
                          color: "#D4AF37",
                          border: "1px solid rgba(212,175,55,0.2)",
                        }}>
                          Lv.{tg.level}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      <button
                        onClick={() => onStartEditTag(tg.id)}
                        className="w-5 h-5 rounded flex items-center justify-center text-white/70 hover:text-white hover:bg-white/5"
                        title="แก้ไข Tag"
                      >
                        <Edit2 size={10} className="text-white" />
                      </button>
                      <button
                        onClick={() => onDeleteTag(tg)}
                        className="w-5 h-5 rounded flex items-center justify-center text-red-400/70 hover:text-red-400 hover:bg-red-950/30"
                        title="ลบ Tag"
                      >
                        <Trash2 size={10} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
