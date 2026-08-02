import React, { useState } from "react";
import type { IdentityRow, IdentityEntry } from "../../pie/bie/types";
import {
  User,
  Heart,
  Target,
  Zap,
  Shield,
  AlertTriangle,
  Brain,
  Star,
  Check,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Clock,
} from "lucide-react";

interface IdentityProfileCardProps {
  profile: IdentityRow;
  onConfirm: () => void;
  onUndo: () => void;
}

const CATEGORY_CONFIG: {
  key: keyof Omit<IdentityRow, "id" | "summary" | "generatedAt" | "applied">;
  label: string;
  labelTh: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  { key: "coreValues",     label: "Core Values",    labelTh: "คุณค่าที่คุณให้ความสำคัญ",  icon: <Heart size={14} />,       color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
  { key: "goals",          label: "Goals",           labelTh: "เป้าหมายของคุณ",             icon: <Target size={14} />,      color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  { key: "motivations",    label: "Motivations",     labelTh: "สิ่งที่ผลักดันคุณ",          icon: <Zap size={14} />,         color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
  { key: "personality",    label: "Personality",     labelTh: "บุคลิกลักษณะของคุณ",         icon: <User size={14} />,        color: "text-sky-400 bg-sky-500/10 border-sky-500/20" },
  { key: "strengths",      label: "Strengths",       labelTh: "จุดแข็งของคุณ",              icon: <Shield size={14} />,      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  { key: "weaknesses",     label: "Weaknesses",      labelTh: "สิ่งที่คุณกำลังพัฒนา",       icon: <AlertTriangle size={14} />, color: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
  { key: "thinkingPattern", label: "Thinking Pattern", labelTh: "รูปแบบการคิดของคุณ",      icon: <Brain size={14} />,       color: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
];

function IdentityEntryChip({ entry }: { entry: IdentityEntry; key?: React.Key }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-[#EBF1EA]">
      <span>{entry.label}</span>
      <span className="text-[#869883] text-[10px]">{Math.round(entry.confidence * 100)}%</span>
    </span>
  );
}

function CategorySection({
  label,
  labelTh,
  icon,
  color,
  entries,
}: {
  key?: React.Key;
  label: string;
  labelTh: string;
  icon: React.ReactNode;
  color: string;
  entries: IdentityEntry[];
}) {
  const [open, setOpen] = useState(true);
  const [showTechLabel, setShowTechLabel] = useState(false);
  if (entries.length === 0) return null;
  return (
    <div className="border border-white/8 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-white/3 hover:bg-white/5 transition-all"
      >
        <div className={`flex items-center gap-2 px-2 py-0.5 rounded-lg border text-xs font-semibold ${color}`}>
          {icon}
          <span>{labelTh}</span>
          {showTechLabel && (
            <span className="opacity-40 text-[10px] font-mono">({label})</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-[#869883]">
          <span className="text-[11px]">{entries.length} รายการ</span>
          {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </div>
      </button>
      {open && (
        <div className="p-3 flex flex-wrap gap-1.5 border-t border-white/5">
          {entries.map((e, i) => (
            <IdentityEntryChip key={i} entry={e} />
          ))}
        </div>
      )}
    </div>
  );
}

export const IdentityProfileCard: React.FC<IdentityProfileCardProps> = ({
  profile,
  onConfirm,
  onUndo,
}) => {
  const isApplied = profile.applied === true;
  const [showTechDetails, setShowTechDetails] = useState(false);
  const generatedDate = new Date(profile.generatedAt).toLocaleDateString("th-TH", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="space-y-3">
      {/* Status Banner */}
      <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs font-semibold ${
        isApplied
          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
          : "bg-amber-500/10 border-amber-500/30 text-amber-300"
      }`}>
        <div className="flex items-center gap-2">
          {isApplied ? <Check size={14} /> : <Sparkles size={14} />}
          <span>
            {isApplied
              ? "✅ AI กำลังใช้ข้อมูลนี้เข้าใจคุณแล้ว"
              : "⏳ รอการยืนยันจากคุณ — AI ยังไม่ได้นำไปใช้"}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] opacity-70">
          <Clock size={11} />
          <span>{generatedDate}</span>
        </div>
      </div>

      {/* AI Summary — Framed as AI's understanding */}
      {profile.summary?.trim() && (
        <div className="px-4 py-3 rounded-xl bg-[#141A14] border border-[#6B9361]/20">
          <div className="flex items-center gap-1.5 mb-1.5 text-xs font-semibold text-emerald-400">
            <Star size={13} />
            <span>AI เข้าใจคุณว่า...</span>
          </div>
          <p className="text-xs text-[#EBF1EA] leading-relaxed">{profile.summary}</p>
        </div>
      )}

      {/* Question to user */}
      <div className="px-4 py-2 rounded-xl bg-violet-500/5 border border-violet-500/15">
        <p className="text-xs text-violet-300 font-medium">AI เข้าใจคุณถูกไหม?</p>
        <p className="text-[11px] text-[#869883] mt-0.5">ตรวจสอบด้านต่างๆ ด้านล่าง แล้วยืนยันหรือเปลี่ยนแปลงได้</p>
      </div>

      {/* Category Sections */}
      <div className="space-y-2">
        {CATEGORY_CONFIG.map((cat) => {
          const entries = profile[cat.key] as IdentityEntry[] | undefined;
          return entries && entries.length > 0 ? (
            <CategorySection
              key={cat.key}
              label={cat.label}
              labelTh={cat.labelTh}
              icon={cat.icon}
              color={cat.color}
              entries={entries}
            />
          ) : null;
        })}
      </div>

      {/* Technical Details (expandable) */}
      <div>
        <button
          onClick={() => setShowTechDetails((v) => !v)}
          className="flex items-center gap-1 text-[10px] text-[#869883]/50 hover:text-[#869883] transition-all"
        >
          {showTechDetails ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
          <span>รายละเอียดเพิ่มเติม</span>
        </button>
        {showTechDetails && (
          <div className="mt-1.5 px-3 py-2 rounded-lg bg-[#0A0E0A] border border-white/8 text-[10px] font-mono text-[#869883] space-y-0.5">
            <div>id: {profile.id}</div>
            <div>applied: {String(profile.applied)}</div>
            <div>generatedAt: {profile.generatedAt}</div>
            <div>engine: BIE Identity Synthesizer</div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 pt-1">
        {isApplied ? (
          <button
            onClick={onUndo}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-orange-500/10 border border-orange-500/20 text-orange-300 hover:bg-orange-500/20 transition-all"
          >
            <RotateCcw size={13} />
            <span>เปลี่ยนคำตอบ</span>
          </button>
        ) : (
          <button
            onClick={onConfirm}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-emerald-950 hover:brightness-110 transition-all shadow-md shadow-emerald-500/20"
          >
            <Check size={14} />
            <span>ใช่ นี่ตรงกับฉัน</span>
          </button>
        )}
      </div>
    </div>
  );
};
