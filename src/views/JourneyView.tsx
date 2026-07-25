import React from "react";
import { LifeJourneyPhase, UserSettings } from "../types";
import { Check, Lock, Flag, Bot } from "lucide-react";

interface JourneyViewProps {
  journey: LifeJourneyPhase[];
  settings: UserSettings;
}

export const JourneyView: React.FC<JourneyViewProps> = ({ journey }) => {
  const currentPhase = journey.find((p) => p.status === "current") || journey[0];

  return (
    <div className="space-y-6 pb-28 animate-in fade-in duration-300">
      {/* Top Section Header */}
      <div className="flex justify-between items-end">
        <div>
          <span className="text-xs font-bold tracking-[0.2em] text-[#869883] uppercase">
            MY LIFE OS ROADMAP
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#EBF1EA]">เส้นทางชีวิต</h2>
          <p className="text-xs text-[#869883]">
            {currentPhase
              ? `เฟส ${currentPhase.phaseNumber}: ${currentPhase.titleTh} (${currentPhase.title} Phase)`
              : "เริ่มต้นการเดินทางของคุณ"}
          </p>
        </div>
        <div className="text-3xl font-extrabold text-[#273727] font-mono">
          {String(currentPhase?.phaseNumber ?? 1).padStart(2, "0")}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: AI Oracle Advice & Phase Stats */}
        <aside className="md:col-span-5 order-2 md:order-1 space-y-6">
          {/* AI Oracle Card */}
          <div className="bg-[#182218] text-[#EBF1EA] rounded-3xl p-6 border border-[#273727] space-y-3 shadow-lg">
            <div className="flex items-center gap-2 text-[#6B9361] font-mono text-xs uppercase font-bold">
              <Bot className="w-5 h-5 text-[#6B9361]" />
              <span>ภาพรวมเฟสปัจจุบัน</span>
            </div>
            {currentPhase ? (
              <>
                <h3 className="text-lg font-bold text-[#EBF1EA] leading-tight">
                  ขณะนี้อยู่ที่ช่วง{" "}
                  <span className="text-[#6B9361]">{currentPhase.titleTh}</span>.
                  {currentPhase.progressPercent > 0 && (
                    <> สำเร็จแล้ว {currentPhase.progressPercent}%.</>
                  )}
                </h3>
                <p className="text-xs sm:text-sm text-[#869883] leading-relaxed italic">
                  {currentPhase.subtitle}
                </p>
                {currentPhase.nextMilestone && (
                  <div className="pt-1 text-xs text-[#697A66] border-t border-[#273727]">
                    <span className="text-[#6B9361] font-bold">เป้าหมายถัดไป: </span>
                    {currentPhase.nextMilestone}
                  </div>
                )}
              </>
            ) : (
              <p className="text-xs text-[#869883]">กำหนดเฟสเส้นทางชีวิตในหน้าตั้งค่าเพื่อเริ่มต้น</p>
            )}
          </div>

          {/* Phase Key Stats Card */}
          {currentPhase && currentPhase.stats && currentPhase.stats.length > 0 && (
            <div className="bg-[#131913] rounded-3xl p-6 border border-[#1F2B1F] shadow-lg space-y-4">
              <h3 className="text-xs font-bold text-[#869883] uppercase tracking-widest">
                ข้อมูลสำคัญของเฟส
              </h3>
              <div className="space-y-4">
                {currentPhase.stats.map((stat) => (
                  <div key={stat.name} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-[#EBF1EA]">{stat.name}</span>
                      <span className="font-mono text-[#6B9361] font-semibold">
                        {stat.valuePercent}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-[#182018] rounded-full overflow-hidden border border-[#223022]">
                      <div
                        className="h-full bg-[#4E7345] rounded-full transition-all duration-500"
                        style={{ width: `${stat.valuePercent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Right Column: Interactive Journey Timeline */}
        <section className="md:col-span-7 order-1 md:order-2 space-y-4">
          <div className="bg-[#131913] rounded-3xl p-6 border border-[#1F2B1F] shadow-lg space-y-6">
            <h3 className="text-xs font-bold text-[#869883] uppercase tracking-widest">
              เฟสการพัฒนาชีวิต 5 ระดับ
            </h3>

            <div className="relative pl-6 space-y-8 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#1F2B1F]">
              {journey.map((phase) => {
                const isCompleted = phase.status === "completed";
                const isCurrent = phase.status === "current";
                const isLocked = phase.status === "locked" || phase.status === "upcoming";

                return (
                  <div key={phase.id} className="relative group">
                    {/* Node Circle */}
                    <div
                      className={`absolute -left-6 top-0 -translate-x-1/2 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                          ? "bg-[#3F5C3A] text-white border border-[#4E7345]"
                          : isCurrent
                          ? "bg-[#4E7345] text-white ring-4 ring-[#4E7345]/20 border border-[#6B9361]"
                          : "bg-[#182018] text-[#556653] border border-[#223022]"
                      }`}
                    >
                      {isCompleted && <Check className="w-3.5 h-3.5" />}
                      {isCurrent && <Flag className="w-3.5 h-3.5" />}
                      {isLocked && <Lock className="w-3.5 h-3.5" />}
                    </div>

                    {/* Content Box */}
                    <div
                      className={`p-4 rounded-2xl border transition-all ${
                        isCurrent
                          ? "bg-[#182218] border-[#273727] shadow-md"
                          : "bg-[#101610] border-[#1A241A]"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-[#6B9361] uppercase">
                            {phase.phaseNumber} • {phase.estimatedCompletion}
                          </span>
                          <h4 className="font-bold text-sm text-[#EBF1EA]">
                            {phase.titleTh} ({phase.title})
                          </h4>
                        </div>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            isCompleted
                              ? "bg-[#1F2E1E] text-[#6B9361] border-[#2E452E]"
                              : isCurrent
                              ? "bg-[#3F5C3A] text-white border-[#4E7345]"
                              : "bg-[#151D15] text-[#697A66] border-[#1F2B1F]"
                          }`}
                        >
                          {isCompleted ? "เสร็จสิ้น" : isCurrent ? "กำลังทำ" : "ยังไม่ปลดล็อก"}
                        </span>
                      </div>
                      <p className="text-xs text-[#869883] leading-relaxed">{phase.subtitle}</p>

                      {isCurrent && phase.progressPercent > 0 && (
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between text-[10px] font-mono text-[#697A66]">
                            <span>ความคืบหน้า</span>
                            <span className="text-[#6B9361]">{phase.progressPercent}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-[#182018] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#4E7345] rounded-full"
                              style={{ width: `${phase.progressPercent}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
