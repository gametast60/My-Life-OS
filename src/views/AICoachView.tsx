import React, { useState, useRef, useEffect, useCallback } from "react";
import { AIMode, AIChatMessage, UserSettings, CharacterStatus, MemoryItem, UserProfileVector, JournalEntry, HabitItem, GoalItem } from "../types";
import { sendAIChatRequest, generateLifeContextGreeting } from "../lib/aiService";

const LC_CACHE_KEY = "mylifeos_lc_greeting_cache";

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function loadCachedGreeting(): string {
  try {
    const raw = localStorage.getItem(LC_CACHE_KEY);
    if (!raw) return "";
    const { date, greeting } = JSON.parse(raw);
    if (date === getTodayKey()) return greeting as string;
    return "";
  } catch {
    return "";
  }
}

function saveCachedGreeting(greeting: string) {
  try {
    localStorage.setItem(LC_CACHE_KEY, JSON.stringify({ date: getTodayKey(), greeting }));
  } catch {}
}
import {
  Bot,
  User,
  Send,
  Sparkles,
  ChevronRight,
  Brain,
  Scale,
  HeartHandshake,
  Key,
  Compass,
  Hourglass,
  Calendar,
  Layers,
} from "lucide-react";

interface AICoachViewProps {
  settings: UserSettings;
  character: CharacterStatus;
  messages: AIChatMessage[];
  memories: MemoryItem[];
  profileVector: UserProfileVector;
  journals: JournalEntry[];
  habits: HabitItem[];
  goals: GoalItem[];
  onSaveMessage: (msg: AIChatMessage) => void;
  onClearSession?: () => void;
  onOpenSettings?: () => void;
  onOpenMemoryModal?: () => void;
}

export const AICoachView: React.FC<AICoachViewProps> = ({
  settings,
  character,
  messages,
  memories,
  profileVector,
  journals,
  habits,
  goals,
  onSaveMessage,
  onClearSession,
  onOpenSettings,
  onOpenMemoryModal,
}) => {
  const [activeMode, setActiveMode] = useState<AIMode>("Life Coach");
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lifeGreeting, setLifeGreeting] = useState<string>(() => loadCachedGreeting());
  const [isGeneratingGreeting, setIsGeneratingGreeting] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleGenerateGreeting = useCallback(() => {
    if (!settings.aiApiKey || isGeneratingGreeting) return;
    setIsGeneratingGreeting(true);
    setLifeGreeting("");
    generateLifeContextGreeting(
      {
        userName: settings.userName || "ผู้ใช้งาน",
        recentJournals: journals.slice(0, 5),
        goals: goals.map((g) => ({ title: g.title, progressPercent: g.progressPercent, priority: g.priority })),
        habits: habits.map((h) => ({ title: h.title, currentStreak: h.currentStreak })),
        memories: memories.slice(0, 8),
        profileVector,
        character,
      },
      settings
    )
      .then((greeting) => {
        setLifeGreeting(greeting);
        saveCachedGreeting(greeting);
      })
      .catch(() => {
        const fallback = `สวัสดี ${settings.userName || "ผู้ใช้งาน"} 👋 AI Coach พร้อมให้คำปรึกษาแล้วครับ`;
        setLifeGreeting(fallback);
        saveCachedGreeting(fallback);
      })
      .finally(() => setIsGeneratingGreeting(false));
  }, [settings, journals, goals, habits, memories, profileVector, character, isGeneratingGreeting]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMsg: AIChatMessage = {
      id: "u-" + Date.now(),
      sender: "user",
      text: text.trim(),
      timestamp: Date.now(),
      mode: activeMode,
    };
    onSaveMessage(userMsg);
    if (!textToSend) setInputText("");
    setIsLoading(true);

    try {
      const responseText = await sendAIChatRequest({
        prompt: text.trim(),
        mode: activeMode,
        userContext: {
          userName: settings.userName,
          characterStats: character,
          memories: memories.slice(0, 10),
          profileVector,
          recentJournals: journals.slice(0, 3).map((j) => ({ title: j.title, mood: j.mood, content: j.content.slice(0, 150) })),
          activeMode,
        },
        settings,
      });

      const aiMsg: AIChatMessage = {
        id: "ai-" + Date.now(),
        sender: "ai",
        text: responseText,
        timestamp: Date.now(),
        mode: activeMode,
      };
      onSaveMessage(aiMsg);
    } catch (err) {
      console.error("AI send error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestionPrompts = [
    "ระบุงาน 15 นาที",
    "ช่วยจัดลำดับความสำคัญช่วงเช้า",
    "วิเคราะห์ Pattern อารมณ์ช่วงนี้",
    "ช่วยตัดสินใจเรื่องสำคัญ",
    "บทเรียนสำคัญจากอดีต",
  ];

  return (
    <div className="space-y-6 pb-28 animate-in fade-in duration-300">
      {/* View Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#EBF1EA]">โค้ช AI & Therapist</h2>
          <p className="text-xs text-[#869883]">ผู้ช่วยคิด วางแผน และดูแลสภาวะจิตใจ</p>
        </div>
        <div className="flex items-center gap-2">
          {onOpenMemoryModal && (
            <button
              onClick={onOpenMemoryModal}
              className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#182218] text-[#6B9361] border border-[#273727] hover:border-[#4E7345] transition-colors flex items-center gap-1.5"
            >
              <Brain className="w-3.5 h-3.5" />
              <span>สมอง AI ({memories.length})</span>
            </button>
          )}
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#3F5C3A] text-white border border-[#4E7345]">
            {activeMode}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Life Context & Modes */}
        <aside className="md:col-span-4 space-y-4">
          {/* Personalized Life Context Card */}
          <div className="bg-[#182218] rounded-3xl p-5 relative overflow-hidden border border-[#273727] shadow-lg space-y-3">
            <div className="flex items-center justify-between text-xs text-[#6B9361] uppercase font-bold tracking-wider">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Life Context Intelligence
              </span>
              {lifeGreeting && (
                <span className="text-[10px] text-[#697A66] normal-case font-normal font-mono">แคชวันนี้</span>
              )}
            </div>

            {!settings.aiApiKey ? (
              <p className="text-xs text-[#869883] leading-relaxed">
                ยังไม่ได้เชื่อมต่อ AI — กรุณาตั้งค่า API Key เพื่อเปิดใช้งาน AI Coach
              </p>
            ) : isGeneratingGreeting ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-3 bg-[#273727] rounded-full w-full" />
                <div className="h-3 bg-[#273727] rounded-full w-4/5" />
                <div className="h-3 bg-[#273727] rounded-full w-3/5" />
                <p className="text-[11px] text-[#697A66] font-mono pt-1">กำลังวิเคราะห์บริบทชีวิต...</p>
              </div>
            ) : lifeGreeting ? (
              <p className="text-xs sm:text-sm text-[#EBF1EA] leading-relaxed">{lifeGreeting}</p>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-[#869883] leading-relaxed">กดปุ่มด้านล่างเพื่อให้ AI วิเคราะห์บริบทชีวิตของคุณ (1 ครั้ง/วัน)</p>
                <button
                  onClick={handleGenerateGreeting}
                  className="w-full py-2 rounded-xl bg-[#233523] border border-[#2E452E] text-[#6B9361] text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#2E452E] active:scale-95 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  ดูบทวิเคราะห์ชีวิตวันนี้
                </button>
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] text-[#869883] pt-2 border-t border-[#273727]">
              <span className="flex items-center gap-1">
                <Brain className="w-3.5 h-3.5 text-[#6B9361]" />
                {memories.length} ความทรงจำ
              </span>
              <div className="flex items-center gap-2">
                {lifeGreeting && !isGeneratingGreeting && (
                  <button
                    onClick={handleGenerateGreeting}
                    className="text-[#697A66] hover:text-[#6B9361] text-[10px] font-mono transition-colors"
                    title="รีเฟรชบทวิเคราะห์ (ใช้โทเค็นเพิ่ม)"
                  >
                    🔄 รีเฟรช
                  </button>
                )}
                {onOpenMemoryModal && (
                  <button
                    onClick={onOpenMemoryModal}
                    className="text-[#6B9361] hover:underline font-medium flex items-center gap-0.5"
                  >
                    เปิดดูสมอง <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Coaching Mode Selectors */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-[#869883] uppercase tracking-widest px-1">
              เลือกโหมดการคุย
            </h3>

            <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1 hide-scrollbar">
              {[
                { mode: "Life Coach" as AIMode, label: "Life Coach (โค้ชชีวิต)", sub: "การเติบโต & ทิศทาง", icon: Brain },
                { mode: "Goal Coach" as AIMode, label: "Goal Coach (ย่อภูเขา)", sub: "ย่อเป้าหมายเป็นงาน 15 นาที", icon: Scale },
                { mode: "Therapist" as AIMode, label: "AI Therapist (ดูแลจิตใจ)", sub: "จิตวิทยา CBT & อารมณ์", icon: HeartHandshake },
                { mode: "Decision Helper" as AIMode, label: "Decision Helper (ช่วยตัดสินใจ)", sub: "วิเคราะห์ทางเลือก & ผลกระทบ", icon: Compass },
                { mode: "Future Self" as AIMode, label: "Future Self (ตัวฉันอนาคต 5 ปี)", sub: "มุมมองจากตัวตนที่สำเร็จ", icon: Hourglass },
                { mode: "Weekly Reflection" as AIMode, label: "Weekly Reflection", sub: "ทบทวนรอบ 7 วัน", icon: Calendar },
                { mode: "Monthly Reflection" as AIMode, label: "Monthly Reflection", sub: "ภาพรวมรายเดือน", icon: Layers },
              ].map(({ mode, label, sub, icon: Icon }) => (
                <button
                  key={mode}
                  onClick={() => setActiveMode(mode)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left ${
                    activeMode === mode
                      ? "bg-[#3F5C3A] border-[#4E7345] text-white shadow-md"
                      : "bg-[#131913] border-[#1F2B1F] text-[#EBF1EA] hover:border-[#273727]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#223322] flex items-center justify-center text-[#6B9361] flex-shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold">{label}</p>
                      <p className="text-[10px] opacity-75">{sub}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Column: Chat Interface */}
        <section className="md:col-span-8 bg-[#131913] rounded-3xl flex flex-col h-[580px] border border-[#1F2B1F] shadow-lg overflow-hidden">
          {/* Chat Header */}
          <div className="px-6 py-3.5 border-b border-[#1F2B1F] flex items-center justify-between bg-[#171E17]">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6B9361] animate-pulse" />
              <span className="text-xs font-semibold text-[#869883]">
                เซสชัน: {activeMode}
              </span>
            </div>
            {onClearSession && (
              <button
                onClick={onClearSession}
                className="text-xs font-medium text-[#869883] hover:text-[#EBF1EA] transition-colors"
              >
                จบเซสชัน
              </button>
            )}
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 hide-scrollbar">
            {!settings.aiApiKey && (
              <div className="p-4 rounded-2xl bg-[#182218] border border-[#273727] text-[#EBF1EA] text-xs flex items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-2.5">
                  <Key className="w-5 h-5 text-[#6B9361] flex-shrink-0" />
                  <div>
                    <span className="font-bold text-[#EBF1EA]">ยังไม่ได้ตั้งค่า Gemini API Key</span>
                    <p className="text-[11px] text-[#869883]">ใส่ API Key เพื่อเปิดใช้งาน AI Coach แบบสมบูรณ์</p>
                  </div>
                </div>
                {onOpenSettings && (
                  <button
                    onClick={onOpenSettings}
                    className="px-3 py-1.5 rounded-xl bg-[#3F5C3A] text-white font-semibold text-xs hover:bg-[#4E7345] whitespace-nowrap shadow-sm"
                  >
                    ตั้งค่า
                  </button>
                )}
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 max-w-[88%] ${
                  m.sender === "user" ? "ml-auto flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                    m.sender === "ai"
                      ? "bg-[#3F5C3A] text-white shadow-sm"
                      : "bg-[#1F2B1F] text-[#EBF1EA] shadow-sm"
                  }`}
                >
                  {m.sender === "ai" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    m.sender === "ai"
                      ? "bg-[#182218] border border-[#273727] text-[#EBF1EA] rounded-tl-none shadow-sm"
                      : "bg-[#3F5C3A] text-white rounded-tr-none shadow-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-[#3F5C3A] text-white flex items-center justify-center">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-4 rounded-2xl bg-[#182218] border border-[#273727] text-[#869883] text-sm">
                  กำลังใช้บริบทชีวิตประมวลผลคำตอบ...
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Quick Suggestions */}
          <div className="px-4 py-2 border-t border-[#1F2B1F] bg-[#101610] flex gap-2 overflow-x-auto hide-scrollbar">
            {suggestionPrompts.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(s)}
                className="px-3 py-1 rounded-full bg-[#182218] hover:bg-[#233323] border border-[#273727] text-[11px] text-[#869883] hover:text-[#EBF1EA] whitespace-nowrap transition-colors"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-4 border-t border-[#1F2B1F] bg-[#131913]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`พิมพ์คุยกับ ${activeMode}...`}
                className="flex-1 px-4 py-2.5 rounded-2xl bg-[#182018] border border-[#223022] text-xs sm:text-sm text-[#EBF1EA] focus:outline-none focus:border-[#4E7345]"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="p-2.5 rounded-2xl bg-[#3F5C3A] text-white hover:bg-[#4E7345] disabled:opacity-40 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};
