import React from "react";
import {
  UserSettings,
  CharacterStatus,
  LifeJourneyPhase,
  TodayMission,
  JournalEntry,
  DailyCheckin,
} from "../types";
import {
  Check,
  Zap,
  Bot,
  ChevronRight,
  Lock,
  Cog,
  Plus,
  Target,
  Sparkles,
  CheckCircle2,
  CalendarDays,
} from "lucide-react";

interface HomeViewProps {
  settings: UserSettings;
  character: CharacterStatus;
  journey: LifeJourneyPhase[];
  missions: TodayMission[];
  recentJournals: JournalEntry[];
  todayCheckin?: DailyCheckin;
  onToggleMission: (id: string) => void;
  onNavigateTab: (tab: "home" | "journey" | "coach" | "journal" | "progress") => void;
  onOpenQuickAction: (action: string) => void;
  onOpenCheckinModal: () => void;
}

const CHAR_STATS = [
  { key: "discipline" as keyof CharacterStatus, label: "วินัย", color: "#4E7345" },
  { key: "health" as keyof CharacterStatus, label: "สุขภาพ", color: "#6B9361" },
  { key: "finance" as keyof CharacterStatus, label: "การเงิน", color: "#B07A60" },
  { key: "mindset" as keyof CharacterStatus, label: "ความคิด", color: "#4E7345" },
  { key: "energy" as keyof CharacterStatus, label: "พลังงาน", color: "#7A9B61" },
  { key: "confidence" as keyof CharacterStatus, label: "ความมั่นใจ", color: "#6B9361" },
];

export const HomeView: React.FC<HomeViewProps> = ({
  settings,
  character,
  journey,
  missions,
  todayCheckin,
  onToggleMission,
  onNavigateTab,
  onOpenQuickAction,
  onOpenCheckinModal,
}) => {
  const journeySteps = [
    { label: "เริ่มต้น", status: "current", icon: Check },
    { label: "นิสัย", status: "upcoming", icon: Zap },
    { label: "ตัวตน", status: "upcoming", icon: Cog },
    { label: "แรงขับ", status: "locked", icon: Target },
    { label: "อิสรภาพ", status: "locked", icon: Lock },
  ];

  // Build steps from actual journey data if available
  const steps = journey.length > 0
    ? journey.map((phase, idx) => {
        const iconMap = [Check, Zap, Cog, Target, Lock];
        return {
          label: phase.titleTh,
          status: phase.status === "completed" ? "completed" : phase.status === "current" ? "active" : "locked",
          icon: iconMap[idx] || Cog,
        };
      })
    : journeySteps;

  // Check if any character stat is non-zero
  const hasCharacterData = Object.values(character).some((v) => typeof v === "number" && v > 0);
  const completedMissions = missions.filter((m) => m.completed).length;
  const totalMissions = missions.length;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "สวัสดีตอนเช้า";
    if (h < 17) return "สวัสดีตอนบ่าย";
    return "สวัสดีตอนเย็น";
  };

  return (
    <div className="space-y-6 pb-28 animate-in fade-in duration-300">
      {/* 1. Welcome Section */}
      <section className="space-y-1.5 pt-2 px-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#EBF1EA]">
          {greeting()}, {settings.userName || "ผู้ใช้งาน"} 👋
        </h1>
        <p className="text-xs sm:text-sm text-[#869883] italic leading-relaxed">
          "หนทางเดียวที่จะทำงานที่ยิ่งใหญ่ได้ คือการรักในสิ่งที่คุณทำ"
          <span className="text-[#697A66] not-italic ml-1">— สตีฟ จ็อบส์</span>
        </p>
      </section>

      {/* 2. Daily Check-in Card (Today's Progress) */}
      <section className="bg-[#131913] rounded-3xl p-5 border border-[#1F2B1F] shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#6B9361] uppercase tracking-wider flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4" /> Today's Reflection
          </span>
          {todayCheckin && (
            <span className="text-[10px] font-mono text-[#6B9361] bg-[#182218] border border-[#273727] px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> สำเร็จแล้ว
            </span>
          )}
        </div>

        {todayCheckin ? (
          <div className="p-3.5 rounded-2xl bg-[#182218] border border-[#273727] space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xl">{todayCheckin.mood}</span>
              <span className="text-xs font-semibold text-[#EBF1EA]">สภาวะจิตใจวันนี้</span>
            </div>
            {todayCheckin.aiSummary && (
              <p className="text-xs text-[#869883] italic leading-relaxed">
                "{todayCheckin.aiSummary}"
              </p>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-[#182018] border border-[#223022]">
            <div>
              <p className="text-xs sm:text-sm font-semibold text-[#EBF1EA]">ทำ Daily Check-in วันนี้</p>
              <p className="text-[11px] text-[#869883]">ทบทวน 5 คำถามง่ายๆ (ใช้เวลา ~2 นาที)</p>
            </div>
            <button
              onClick={onOpenCheckinModal}
              className="px-4 py-2 rounded-xl bg-[#3F5C3A] hover:bg-[#4E7345] text-xs font-bold text-white transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" /> เริ่ม Check-in
            </button>
          </div>
        )}
      </section>

      {/* 3. AI Coach Banner */}
      <section
        onClick={() => onNavigateTab("coach")}
        className="bg-[#182218] rounded-3xl p-4 sm:p-5 border border-[#273727] shadow-lg flex items-center justify-between gap-4 cursor-pointer hover:border-[#354B35] transition-all group"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#233523] text-[#6B9361] flex items-center justify-center flex-shrink-0 border border-[#2E452E]">
            <Bot className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#869883] uppercase tracking-wider block">
              โค้ช AI
            </span>
            <p className="text-xs sm:text-sm font-medium text-[#EBF1EA] mt-0.5 leading-snug">
              {settings.aiApiKey
                ? "AI Coach พร้อมใช้งาน — แตะเพื่อเริ่มสนทนา"
                : "ตั้งค่า API Key เพื่อเริ่มใช้งาน AI Coach"}
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-[#869883] group-hover:text-[#6B9361] group-hover:translate-x-1 transition-all flex-shrink-0" />
      </section>

      {/* 3. Life Journey Section */}
      <section className="bg-[#131913] rounded-3xl p-5 sm:p-6 border border-[#1F2B1F] shadow-lg space-y-6">
        <div className="flex justify-between items-center border-b border-[#1F2B1F] pb-4">
          <h2 className="font-bold text-base sm:text-lg text-[#EBF1EA]">เส้นทางชีวิต</h2>
          <button
            onClick={() => onNavigateTab("journey")}
            className="text-xs text-[#6B9361] hover:underline flex items-center gap-1"
          >
            ดูทั้งหมด <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Roadmap Stepper */}
        <div className="relative flex items-center justify-between px-2 pt-2">
          <div className="absolute top-[28px] left-[32px] right-[32px] h-[2px] bg-[#1F2B1F] -z-0" />
          <div
            className="absolute top-[28px] left-[32px] h-[2px] bg-[#4E7345] -z-0 transition-all duration-500"
            style={{
              width: `${((steps.filter((s) => s.status === "completed").length) / Math.max(steps.length - 1, 1)) * 100}%`,
            }}
          />

          {steps.map((step, idx) => {
            const StepIcon = step.icon;
            const isCompleted = step.status === "completed";
            const isActive = step.status === "active" || step.status === "current";
            const isLocked = step.status === "locked";

            return (
              <div key={idx} className="flex flex-col items-center gap-2 z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? "bg-[#3F5C3A] text-white shadow-md border border-[#4E7345]"
                      : isActive
                      ? "bg-[#4E7345] text-white shadow-lg shadow-[#4E7345]/30 ring-4 ring-[#4E7345]/20 border border-[#6B9361]"
                      : isLocked
                      ? "bg-[#182018] text-[#556653] border border-[#223022]"
                      : "bg-[#182018] text-[#869883] border border-[#273727]"
                  }`}
                >
                  <StepIcon className="w-5 h-5" />
                </div>
                <span
                  className={`text-[11px] font-medium text-center ${
                    isActive || isCompleted ? "text-[#EBF1EA]" : "text-[#697A66]"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Today's Missions */}
      <section className="bg-[#131913] rounded-3xl p-5 sm:p-6 border border-[#1F2B1F] shadow-lg space-y-4">
        <div className="flex justify-between items-center border-b border-[#1F2B1F] pb-4">
          <div>
            <h2 className="font-bold text-base sm:text-lg text-[#EBF1EA]">ภารกิจวันนี้</h2>
            {totalMissions > 0 && (
              <p className="text-xs text-[#869883] mt-0.5">
                เสร็จแล้ว {completedMissions}/{totalMissions} ภารกิจ
              </p>
            )}
          </div>
          <button
            onClick={() => onOpenQuickAction("checklist")}
            className="flex items-center gap-1 text-xs text-[#6B9361] hover:underline"
          >
            <Plus className="w-3.5 h-3.5" /> เพิ่ม
          </button>
        </div>

        {missions.length === 0 ? (
          <div className="text-center py-6 space-y-2">
            <p className="text-[#869883] text-sm">ยังไม่มีภารกิจวันนี้</p>
            <button
              onClick={() => onOpenQuickAction("checklist")}
              className="px-4 py-2 rounded-xl bg-[#182018] border border-[#273727] text-xs text-[#6B9361] hover:bg-[#1F2B1F] transition-colors"
            >
              + สร้างภารกิจแรกของคุณ
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {missions.map((m) => (
              <div
                key={m.id}
                onClick={() => onToggleMission(m.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  m.completed
                    ? "bg-[#182218] border-[#273727] opacity-60"
                    : "bg-[#182018] border-[#223022] hover:border-[#273727]"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    m.completed
                      ? "bg-[#3F5C3A] border-[#4E7345]"
                      : "border-[#374E37]"
                  }`}
                >
                  {m.completed && <Check className="w-3 h-3 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${m.completed ? "line-through text-[#697A66]" : "text-[#EBF1EA]"}`}>
                    {m.title}
                  </p>
                  {m.subtitle && (
                    <p className="text-xs text-[#869883] truncate">{m.subtitle}</p>
                  )}
                </div>
                {m.xpValue && (
                  <span className="text-[10px] font-mono text-[#6B9361] bg-[#182218] border border-[#273727] px-2 py-0.5 rounded-full flex-shrink-0">
                    +{m.xpValue} XP
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. Character Stats Section */}
      <section className="bg-[#131913] rounded-3xl p-5 sm:p-6 border border-[#1F2B1F] shadow-lg space-y-5">
        <div className="flex justify-between items-center border-b border-[#1F2B1F] pb-4">
          <h2 className="font-bold text-base sm:text-lg text-[#EBF1EA]">สถานะตัวละคร</h2>
          <button
            onClick={() => onNavigateTab("progress")}
            className="text-xs text-[#6B9361] hover:underline flex items-center gap-1"
          >
            ดูรายละเอียด <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {!hasCharacterData ? (
          <div className="text-center py-4 space-y-1">
            <p className="text-[#869883] text-sm">ยังไม่มีข้อมูลสถานะ</p>
            <p className="text-xs text-[#697A66]">สถานะจะอัปเดตอัตโนมัติเมื่อคุณทำภารกิจและบันทึกนิสัยต่างๆ</p>
          </div>
        ) : (
          <div className="space-y-4">
            {CHAR_STATS.map(({ key, label, color }) => {
              const val = character[key] ?? 0;
              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#EBF1EA]">{label}</span>
                    <span className="font-mono" style={{ color }}>{val}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-[#182018] rounded-full overflow-hidden border border-[#223022]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${val}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
