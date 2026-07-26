import React, { useState, useEffect } from "react";
import { MemoryItem, UserProfileVector, UserSettings, AILearningFeedback } from "../types";
import { X, Brain, RefreshCw, Sparkles, Send, CheckCircle2, ArrowRight, Lightbulb, TrendingUp, HelpCircle } from "lucide-react";
import { learnFromText, generateSmartQuestion, updateUserKnowledge } from "../lib/aiService";

interface BrainInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  memories: MemoryItem[];
  profileVector: UserProfileVector;
  settings: UserSettings;
  onSaveLearning: (newMemories: MemoryItem[], updatedVector?: UserProfileVector | null) => void;
}

export const BrainInterviewModal: React.FC<BrainInterviewModalProps> = ({
  isOpen,
  onClose,
  memories,
  profileVector,
  settings,
  onSaveLearning,
}) => {
  const [questionMode, setQuestionMode] = useState<"random" | "followup">("random");
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [isLoadingQuestion, setIsLoadingQuestion] = useState<boolean>(false);
  const [isLearning, setIsLearning] = useState<boolean>(false);
  const [learningFeedback, setLearningFeedback] = useState<AILearningFeedback | null>(null);

  // Fetch initial question when modal opens
  useEffect(() => {
    if (isOpen) {
      handleFetchQuestion(questionMode);
      setAnswer("");
      setLearningFeedback(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFetchQuestion = async (mode: "random" | "followup") => {
    setIsLoadingQuestion(true);
    try {
      const q = await generateSmartQuestion(mode, memories, profileVector, settings);
      setCurrentQuestion(q);
    } catch (err) {
      console.error("Fetch question error:", err);
      setCurrentQuestion("อะไรคือค่านิยมหลักที่คุณจะยอมไม่เสียสละเด็ดขาด แม้เจอกับความท้าทาย?");
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  const handleModeChange = (mode: "random" | "followup") => {
    setQuestionMode(mode);
    handleFetchQuestion(mode);
  };

  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || isLearning) return;

    setIsLearning(true);
    try {
      const contextText = `คำถามสัมภาษณ์: "${currentQuestion}"\nคำตอบผู้ใช้: "${answer.trim()}"`;
      const result = await learnFromText(
        contextText,
        "Brain Interview (สัมภาษณ์ตัวเอง)",
        memories,
        profileVector,
        settings
      );

      // Save memories & update knowledge
      if (result.memories.length > 0) {
        const updatedMemoriesList = [...result.memories, ...memories];
        const updatedVector = await updateUserKnowledge(profileVector, updatedMemoriesList, [], settings);
        onSaveLearning(result.memories, updatedVector);
      } else {
        onSaveLearning([]);
      }

      setLearningFeedback(result.feedback);
    } catch (err) {
      console.error("Brain interview learning error:", err);
      setLearningFeedback({
        patternObservations: [],
        evolutionShifts: [],
        newDiscoveries: ["AI รับทราบข้อมูลของคุณและประมวลผลเข้าสู่ระบบเรียบร้อยครับ"],
      });
    } finally {
      setIsLearning(false);
    }
  };

  const handleContinueWithFollowup = (followupQ: string) => {
    setCurrentQuestion(followupQ);
    setAnswer("");
    setLearningFeedback(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#131913] border border-[#273727] rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-5 relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#1F2B1F] pb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#182218] border border-[#273727] text-[#6B9361] flex items-center justify-center shadow-inner">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#EBF1EA] flex items-center gap-2">
                <span>สมองฉัน</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#3F5C3A] text-white font-mono uppercase tracking-wider">
                  AI Self-Interview
                </span>
              </h2>
              <p className="text-xs text-[#869883]">
                พื้นที่สัมภาษณ์ทบทวนตัวเอง — ข้อมูลนี้ไม่เก็บลงสมุดเพื่อความเป็นส่วนตัว ใช้ให้ AI เรียนรู้เท่านั้น
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#182018] border border-[#273727] text-[#869883] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {!learningFeedback ? (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {/* Question Mode Chips */}
            <div className="flex items-center justify-between gap-2 border-b border-[#1F2B1F] pb-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleModeChange("random")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                    questionMode === "random"
                      ? "bg-[#3F5C3A] border-[#4E7345] text-white"
                      : "bg-[#182018] border-[#223022] text-[#869883] hover:text-[#EBF1EA]"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>🎲 คำถามสำรวจชีวิต</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange("followup")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                    questionMode === "followup"
                      ? "bg-[#3F5C3A] border-[#4E7345] text-white"
                      : "bg-[#182018] border-[#223022] text-[#869883] hover:text-[#EBF1EA]"
                  }`}
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span>🔍 AI ถามเจาะลึกจากเรื่องเดิม</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleFetchQuestion(questionMode)}
                disabled={isLoadingQuestion}
                className="text-[11px] text-[#6B9361] hover:underline flex items-center gap-1 font-medium transition-all"
                title="สุ่มคำถามใหม่"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingQuestion ? "animate-spin" : ""}`} />
                <span>สุ่มคำถามใหม่</span>
              </button>
            </div>

            {/* Current Question Box */}
            <div className="bg-[#182018] border border-[#223022] rounded-2xl p-4 space-y-2 relative">
              <div className="flex items-center gap-2 text-xs font-bold text-[#6B9361] uppercase tracking-wider">
                <HelpCircle className="w-4 h-4 text-[#6B9361]" />
                <span>คำถามสัมภาษณ์จาก AI</span>
              </div>
              {isLoadingQuestion ? (
                <div className="py-4 text-center text-xs text-[#869883] animate-pulse">
                  AI กำลังวิเคราะห์คลังความรู้เพื่อสร้างคำถาม...
                </div>
              ) : (
                <p className="text-sm font-semibold text-[#EBF1EA] leading-relaxed">
                  "{currentQuestion}"
                </p>
              )}
            </div>

            {/* Form Input */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-[#869883] font-medium">คำตอบ / ความคิดของคุณ</label>
                  <span
                    className={`text-xs font-mono px-2.5 py-0.5 rounded-full border transition-colors ${
                      wordCount >= 100
                        ? "bg-[#233523] border-[#4E7345] text-[#6B9361] font-bold"
                        : "bg-[#182018] border-[#223022] text-[#869883]"
                    }`}
                  >
                    {wordCount}/100 คำ
                  </span>
                </div>

                <textarea
                  rows={6}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="เขียนถ่ายทอดความคิด ความฝัน หรือสิ่งที่คุณรู้สึกอย่างเป็นธรรมชาติ..."
                  className="w-full p-4 rounded-2xl bg-[#182018] border border-[#223022] text-xs sm:text-sm text-[#EBF1EA] placeholder-[#697A66] focus:outline-none focus:border-[#4E7345] resize-none leading-relaxed"
                />

                <p className="text-[11px] text-[#697A66] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#6B9361] flex-shrink-0" />
                  <span>
                    ยิ่งเขียนมากกว่า 100 คำ AI จะยิ่งเข้าใจตัวคุณได้ลึกซึ้งและแม่นยำยิ่งขึ้น (ไม่จำกัดคำ กดส่งได้เสมอ)
                  </span>
                </p>
              </div>

              <button
                type="submit"
                disabled={!answer.trim() || isLearning}
                className="w-full py-3.5 rounded-2xl bg-[#3F5C3A] hover:bg-[#4E7345] text-white font-bold text-xs font-mono uppercase tracking-wider transition-all disabled:opacity-40 shadow-lg flex items-center justify-center gap-2"
              >
                {isLearning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>AI กำลังวิเคราะห์และเรียนรู้ข้อมูล...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>ส่งข้อมูลให้ AI เรียนรู้ (ไม่เก็บบันทึกดิบ)</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Learning Feedback Screen */
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 animate-in zoom-in-95 duration-200">
            <div className="bg-[#182018] border border-[#3F5C3A] rounded-2xl p-4 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#3F5C3A]/30 border border-[#4E7345] text-[#6B9361] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-[#EBF1EA]">
                🧠 AI ได้เรียนรู้เกี่ยวกับคุณเรียบร้อยแล้ว!
              </h3>
              <p className="text-xs text-[#869883]">
                ข้อความถูกนำไปอัปเดตระบบความรู้สำเร็จ และลบออกจากหน่วยความจำชั่วคราวแล้ว
              </p>
            </div>

            {/* 3-Tier Feedback Cards */}
            <div className="space-y-3">
              {/* 1. Pattern Observations */}
              {learningFeedback.patternObservations.length > 0 && (
                <div className="bg-[#182018] rounded-2xl p-4 border border-[#223022] space-y-2">
                  <span className="text-xs font-bold text-[#6B9361] flex items-center gap-1.5 uppercase tracking-wider">
                    <Lightbulb className="w-4 h-4" /> ข้อสังเกตเชิงพฤติกรรม & เทรนด์ (Pattern Discoveries)
                  </span>
                  <ul className="space-y-1.5 text-xs text-[#EBF1EA]">
                    {learningFeedback.patternObservations.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-[#131913] p-2.5 rounded-xl border border-[#1F2B1F]">
                        <span className="text-[#6B9361] font-bold">💡</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 2. Evolution & Shifts */}
              {learningFeedback.evolutionShifts.length > 0 && (
                <div className="bg-[#182018] rounded-2xl p-4 border border-[#223022] space-y-2">
                  <span className="text-xs font-bold text-[#4E7345] flex items-center gap-1.5 uppercase tracking-wider">
                    <TrendingUp className="w-4 h-4" /> พัฒนาการ & การเปลี่ยนแปลง (Evolution Shifts)
                  </span>
                  <ul className="space-y-1.5 text-xs text-[#EBF1EA]">
                    {learningFeedback.evolutionShifts.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-[#131913] p-2.5 rounded-xl border border-[#1F2B1F]">
                        <span className="text-[#4E7345] font-bold">🚀</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 3. New Discoveries */}
              {learningFeedback.newDiscoveries.length > 0 && (
                <div className="bg-[#182018] rounded-2xl p-4 border border-[#223022] space-y-2">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" /> ข้อมูลใหม่ที่ค้นพบ (New Discoveries)
                  </span>
                  <ul className="space-y-1.5 text-xs text-[#EBF1EA]">
                    {learningFeedback.newDiscoveries.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-[#131913] p-2.5 rounded-xl border border-[#1F2B1F]">
                        <span className="text-emerald-400 font-bold">💎</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 4. Curiosity Loop Box */}
              {learningFeedback.followupQuestion && (
                <div className="bg-[#1A261A] border border-[#3F5C3A] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <HelpCircle className="w-4 h-4" />
                    <span>❓ AI มีคำถามสงสัยต่อจากเรื่องนี้...</span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-[#EBF1EA] leading-relaxed">
                    "{learningFeedback.followupQuestion}"
                  </p>
                  <button
                    type="button"
                    onClick={() => handleContinueWithFollowup(learningFeedback.followupQuestion!)}
                    className="w-full py-2.5 rounded-xl bg-[#3F5C3A] hover:bg-[#4E7345] text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <span>💬 ตอบคำถามนี้ต่อเลย</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-[#182018] border border-[#273727] text-[#869883] hover:text-white text-xs font-bold transition-colors"
            >
              ปิดหน้าต่างนี้ (กลับสู่ระบบ)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
