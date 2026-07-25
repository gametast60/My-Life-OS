import React from "react";
import { HabitItem, GoalItem, CharacterStatus, DailyCheckin } from "../types";
import { Target, Repeat, Award, ShieldAlert, Sparkles, Brain, Flame, Compass, Heart, Feather } from "lucide-react";

interface ProgressViewProps {
  habits: HabitItem[];
  goals: GoalItem[];
  character: CharacterStatus;
  checkins: DailyCheckin[];
}

const RPG_STATS_CONFIG: {
  key: keyof CharacterStatus;
  label: string;
  category: "Physical & Action" | "Mind & Spirit";
  color: string;
  icon: any;
  desc: string;
}[] = [
  // Original / Core Stats
  { key: "discipline", label: "วินัย (Discipline)", category: "Physical & Action", color: "#4E7345", icon: Flame, desc: "Mission completion rate" },
  { key: "health", label: "สุขภาพ (Health)", category: "Physical & Action", color: "#6B9361", icon: Heart, desc: "Habits & exercise" },
  { key: "finance", label: "การเงิน (Finance)", category: "Physical & Action", color: "#B07A60", icon: Target, desc: "Financial goals progress" },
  { key: "confidence", label: "ความมั่นใจ (Confidence)", category: "Physical & Action", color: "#7A9B61", icon: Award, desc: "Streak & achievements" },
  { key: "energy", label: "พลังงาน (Energy)", category: "Physical & Action", color: "#6B9361", icon: Flame, desc: "Daily vitality" },

  // Intelligence Layer — 5 RPG Stats
  { key: "wisdom", label: "ภูมิปัญญา (Wisdom)", category: "Mind & Spirit", color: "#6B9361", icon: Feather, desc: "Reflection & AI Lessons" },
  { key: "creativity", label: "ความคิดสร้างสรรค์ (Creativity)", category: "Mind & Spirit", color: "#7A9B61", icon: Sparkles, desc: "Vision Board & Ideas" },
  { key: "courage", label: "ความกล้าหาญ (Courage)", category: "Mind & Spirit", color: "#B07A60", icon: ShieldAlert, desc: "High priority goals & challenges" },
  { key: "social", label: "ความสัมพันธ์ (Social)", category: "Mind & Spirit", color: "#4E7345", icon: Compass, desc: "Relationship journals & goals" },
  { key: "selfAwareness", label: "การตระหนักรู้ตนเอง (Self Awareness)", category: "Mind & Spirit", color: "#6B9361", icon: Brain, desc: "Daily Check-in streak & CBT" },
];

export const ProgressView: React.FC<ProgressViewProps> = ({ habits, goals, character, checkins }) => {
  const completedHabits = habits.filter((h) => h.currentStreak > 0).length;
  const completedGoals = goals.filter((g) => g.progressPercent >= 100).length;

  const checkinStreak = checkins.length;

  return (
    <div className="space-y-6 pb-28 animate-in fade-in duration-300">
      {/* Top Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#EBF1EA]">ความคืบหน้า & RPG Life Stats</h2>
        <p className="text-xs text-[#869883]">ติดตามพัฒนาการ สถิติตัวละคร 10 ด้าน และอัตราความสำเร็จในชีวิต</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#131913] rounded-3xl p-5 border border-[#1F2B1F] shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#182218] border border-[#273727] text-[#6B9361] flex items-center justify-center">
            <Repeat className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#869883] uppercase block">นิสัยสม่ำเสมอ</span>
            <span className="text-2xl font-extrabold text-[#EBF1EA] font-mono">
              {habits.length === 0 ? "—" : `${completedHabits} / ${habits.length}`}
            </span>
          </div>
        </div>

        <div className="bg-[#131913] rounded-3xl p-5 border border-[#1F2B1F] shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#182218] border border-[#273727] text-[#6B9361] flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#869883] uppercase block">เป้าหมายที่สำเร็จ</span>
            <span className="text-2xl font-extrabold text-[#EBF1EA] font-mono">
              {goals.length === 0 ? "—" : `${completedGoals} / ${goals.length}`}
            </span>
          </div>
        </div>

        <div className="bg-[#131913] rounded-3xl p-5 border border-[#1F2B1F] shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#182218] border border-[#273727] text-[#6B9361] flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#869883] uppercase block">Check-in Total</span>
            <span className="text-2xl font-extrabold text-[#6B9361] font-mono">
              {checkinStreak} ครั้ง
            </span>
          </div>
        </div>

        <div className="bg-[#131913] rounded-3xl p-5 border border-[#1F2B1F] shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#182218] border border-[#273727] text-[#6B9361] flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#869883] uppercase block">เฉลี่ย RPG Stat</span>
            <span className="text-2xl font-extrabold text-[#6B9361] font-mono">
              {Math.round(
                RPG_STATS_CONFIG.reduce((acc, stat) => acc + (character[stat.key] || 0), 0) / RPG_STATS_CONFIG.length
              )}
              %
            </span>
          </div>
        </div>
      </div>

      {/* 10 Character RPG Stats (Life RPG System) */}
      <section className="bg-[#131913] rounded-3xl p-6 border border-[#1F2B1F] shadow-lg space-y-6">
        <div className="flex justify-between items-center border-b border-[#1F2B1F] pb-4">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-[#EBF1EA] flex items-center gap-2">
              <Award className="w-5 h-5 text-[#6B9361]" />
              <span>Life RPG Stats (10 สถานะชีวิต)</span>
            </h3>
            <p className="text-xs text-[#869883]">
              ระบบเติบโตและเสื่อมถอยตามการใช้งานจริง (Decay -1 แต้ม / 30 วันที่ขาดการสะสม)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {["Physical & Action", "Mind & Spirit"].map((categoryGroup) => (
            <div key={categoryGroup} className="space-y-4">
              <h4 className="text-xs font-bold text-[#6B9361] uppercase tracking-wider border-b border-[#1F2B1F] pb-2">
                {categoryGroup === "Physical & Action" ? "💪 การกระทำ & กายภาพ" : "🧠 จิตวิญญาณ & ปัญญา"}
              </h4>

              <div className="space-y-3.5">
                {RPG_STATS_CONFIG.filter((s) => s.category === categoryGroup).map(({ key, label, color, icon: Icon, desc }) => {
                  const val = character[key] || 0;
                  return (
                    <div key={key} className="p-3.5 rounded-2xl bg-[#182018] border border-[#223022] space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-[#6B9361]" />
                          <span className="font-semibold text-[#EBF1EA]">{label}</span>
                        </div>
                        <span className="font-mono font-bold text-sm" style={{ color }}>
                          {val}%
                        </span>
                      </div>
                      <div className="h-2.5 w-full bg-[#101610] rounded-full overflow-hidden border border-[#1F2B1F]">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${val}%`, backgroundColor: color }}
                        />
                      </div>
                      <p className="text-[10px] text-[#697A66] italic">{desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Detailed Habits & Goals breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Habits Progress */}
        <div className="bg-[#131913] rounded-3xl p-6 border border-[#1F2B1F] shadow-lg space-y-4">
          <h3 className="font-bold text-sm text-[#EBF1EA] flex items-center gap-2 border-b border-[#1F2B1F] pb-3">
            <Repeat className="w-4 h-4 text-[#6B9361]" />
            <span>นิสัยและวินัยประจำวัน</span>
          </h3>

          {habits.length === 0 ? (
            <div className="text-center py-8 space-y-1">
              <p className="text-[#869883] text-sm">ยังไม่มีนิสัยที่ติดตาม</p>
              <p className="text-xs text-[#697A66]">เพิ่มนิสัยในเมนู "นิสัย" เพื่อเริ่มติดตาม</p>
            </div>
          ) : (
            <div className="space-y-4">
              {habits.map((h) => (
                <div key={h.id} className="p-3.5 rounded-2xl bg-[#182018] border border-[#223022] space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-[#EBF1EA]">{h.title}</span>
                    <span className="text-[#6B9361] font-mono text-[11px]">
                      Streak: {h.currentStreak} วัน
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#101610] rounded-full overflow-hidden border border-[#1F2B1F]">
                    <div
                      className="h-full bg-[#4E7345] rounded-full"
                      style={{ width: `${Math.min(100, (h.currentStreak / 30) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Goals Progress */}
        <div className="bg-[#131913] rounded-3xl p-6 border border-[#1F2B1F] shadow-lg space-y-4">
          <h3 className="font-bold text-sm text-[#EBF1EA] flex items-center gap-2 border-b border-[#1F2B1F] pb-3">
            <Target className="w-4 h-4 text-[#6B9361]" />
            <span>เป้าหมายสำคัญในชีวิต</span>
          </h3>

          {goals.length === 0 ? (
            <div className="text-center py-8 space-y-1">
              <p className="text-[#869883] text-sm">ยังไม่มีเป้าหมาย</p>
              <p className="text-xs text-[#697A66]">เพิ่มเป้าหมายในเมนู "เป้าหมาย" เพื่อเริ่มติดตาม</p>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((g) => (
                <div key={g.id} className="p-3.5 rounded-2xl bg-[#182018] border border-[#223022] space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-[#EBF1EA]">{g.title}</span>
                    <span className="text-[#6B9361] font-mono text-[11px]">{g.progressPercent}%</span>
                  </div>
                  <div className="h-2 w-full bg-[#101610] rounded-full overflow-hidden border border-[#1F2B1F]">
                    <div
                      className="h-full bg-[#4E7345] rounded-full"
                      style={{ width: `${g.progressPercent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
