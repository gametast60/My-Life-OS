import React, { useState } from "react";
import { DailyCheckin, MoodType, UserSettings } from "../types";
import { summarizeDailyCheckin } from "../lib/aiService";
import { X, Sparkles, CheckCircle2, Heart, HelpCircle, Target, Lightbulb } from "lucide-react";

interface DailyCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCheckin: (checkin: DailyCheckin) => void;
  settings: UserSettings;
}

const MOODS: { emoji: MoodType; label: string }[] = [
  { emoji: "😫", label: "เหนื่อยล้า" },
  { emoji: "😕", label: "สับสน" },
  { emoji: "😐", label: "ปานกลาง" },
  { emoji: "😊", label: "รู้สึกดี" },
  { emoji: "🤩", label: "ยอดเยี่ยม" },
];

export const DailyCheckinModal: React.FC<DailyCheckinModalProps> = ({
  isOpen,
  onClose,
  onSaveCheckin,
  settings,
}) => {
  const [step, setStep] = useState<number>(1);
  const [mood, setMood] = useState<MoodType>("😊");
  const [wentWell, setWentWell] = useState("");
  const [challenge, setChallenge] = useState("");
  const [learned, setLearned] = useState("");
  const [grateful, setGrateful] = useState("");
  const [tomorrow, setTomorrow] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleResetAndClose = () => {
    setStep(1);
    setMood("😊");
    setWentWell("");
    setChallenge("");
    setLearned("");
    setGrateful("");
    setTomorrow("");
    setIsSubmitting(false);
    onClose();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const dateStr = new Date().toISOString().split("T")[0];
    const checkinData: Omit<DailyCheckin, "id" | "aiSummary"> = {
      date: dateStr,
      timestamp: Date.now(),
      mood,
      answers: {
        wentWell,
        challenge,
        learned,
        grateful,
        tomorrow,
      },
    };

    let aiSummary = "";
    try {
      aiSummary = await summarizeDailyCheckin(checkinData, settings);
    } catch {
      aiSummary = "วันนี้คุณได้ใช้เวลาทบทวนตนเองอย่างมีคุณค่า";
    }

    const finalCheckin: DailyCheckin = {
      ...checkinData,
      id: "chk-" + Date.now(),
      aiSummary,
    };

    onSaveCheckin(finalCheckin);
    setIsSubmitting(false);
    handleResetAndClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#131913] border border-[#273727] rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Top Header */}
        <div className="flex justify-between items-center border-b border-[#1F2B1F] pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B9361]">
              Daily Reflection Loop
            </span>
            <h2 className="text-xl font-bold text-[#EBF1EA]">Daily Check-in (5 คำถาม)</h2>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-2 rounded-xl bg-[#182218] border border-[#273727] text-[#869883] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-[#869883]">
            <span>ขั้นตอนที่ {step} จาก 5</span>
            <span>{step * 20}%</span>
          </div>
          <div className="h-1.5 w-full bg-[#182018] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#6B9361] transition-all duration-300"
              style={{ width: `${step * 20}%` }}
            />
          </div>
        </div>

        {/* Form Steps */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#EBF1EA]">
              <Heart className="w-4 h-4 text-[#6B9361]" />
              <span>1. วันนี้อารมณ์/สภาวะจิตใจเป็นอย่างไร?</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {MOODS.map((m) => (
                <button
                  key={m.emoji}
                  type="button"
                  onClick={() => setMood(m.emoji)}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1 transition-all ${
                    mood === m.emoji
                      ? "bg-[#3F5C3A] border-[#4E7345] text-white scale-105"
                      : "bg-[#182018] border-[#223022] text-[#869883] hover:border-[#273727]"
                  }`}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-[10px] font-medium">{m.label}</span>
                </button>
              ))}
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs text-[#869883] block">
                วันนี้มีเรื่องอะไรที่ดี หรือเป็นชัยชนะเล็กๆ (Wins)?
              </label>
              <textarea
                value={wentWell}
                onChange={(e) => setWentWell(e.target.value)}
                placeholder="เช่น ทำงานเสร็จตามเป้า, ได้ออกกำลังกาย 20 นาที..."
                className="w-full h-24 p-3 rounded-2xl bg-[#182018] border border-[#223022] text-xs text-[#EBF1EA] focus:outline-none focus:border-[#4E7345]"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#EBF1EA]">
              <HelpCircle className="w-4 h-4 text-[#6B9361]" />
              <span>2. วันนี้มีอุปสรรค หรือเรื่องอะไรที่ท้าทาย/ยากลำบาก?</span>
            </div>
            <textarea
              value={challenge}
              onChange={(e) => setChallenge(e.target.value)}
              placeholder="เช่น รู้สึกหลุดโฟกัสช่วงบ่าย, มีอารมณ์หงุดหงิด..."
              className="w-full h-36 p-3 rounded-2xl bg-[#182018] border border-[#223022] text-xs text-[#EBF1EA] focus:outline-none focus:border-[#4E7345]"
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#EBF1EA]">
              <Lightbulb className="w-4 h-4 text-[#6B9361]" />
              <span>3. บทเรียนหรือสิ่งที่คุณได้เรียนรู้ในวันนี้คืออะไร?</span>
            </div>
            <textarea
              value={learned}
              onChange={(e) => setLearned(e.target.value)}
              placeholder="เช่น การพักผ่อนสายตามีผลต่อสมาธิมาก..."
              className="w-full h-36 p-3 rounded-2xl bg-[#182018] border border-[#223022] text-xs text-[#EBF1EA] focus:outline-none focus:border-[#4E7345]"
            />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#EBF1EA]">
              <Heart className="w-4 h-4 text-[#6B9361]" />
              <span>4. วันนี้มีสิ่งไหนที่คุณรู้สึกซาบซึ้ง/ขอบคุณ (Gratitude)?</span>
            </div>
            <textarea
              value={grateful}
              onChange={(e) => setGrateful(e.target.value)}
              placeholder="เช่น ขอบคุณเพื่อนร่วมงานที่ช่วยเหลือ, กาแฟร้อนๆ ช่วงเช้า..."
              className="w-full h-36 p-3 rounded-2xl bg-[#182018] border border-[#223022] text-xs text-[#EBF1EA] focus:outline-none focus:border-[#4E7345]"
            />
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#EBF1EA]">
              <Target className="w-4 h-4 text-[#6B9361]" />
              <span>5. พรุ่งนี้คุณตั้งใจจะปรับปรุงหรือโฟกัสเรื่องอะไรเป็นพิเศษ?</span>
            </div>
            <textarea
              value={tomorrow}
              onChange={(e) => setTomorrow(e.target.value)}
              placeholder="เช่น ตื่นนอนตรงเวลา, โฟกัสงาน Deep Work 2 ชั่วโมง..."
              className="w-full h-36 p-3 rounded-2xl bg-[#182018] border border-[#223022] text-xs text-[#EBF1EA] focus:outline-none focus:border-[#4E7345]"
            />
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between border-t border-[#1F2B1F] pt-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl bg-[#182018] border border-[#273727] text-xs font-semibold text-[#869883] hover:text-white transition-colors"
            >
              ย้อนกลับ
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-5 py-2.5 rounded-xl bg-[#3F5C3A] hover:bg-[#4E7345] text-xs font-semibold text-white transition-colors ml-auto"
            >
              ถัดไป
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="px-5 py-2.5 rounded-xl bg-[#3F5C3A] hover:bg-[#4E7345] text-xs font-semibold text-white transition-colors ml-auto flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>AI กำลังวิเคราะห์...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>บันทึก Check-in</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
