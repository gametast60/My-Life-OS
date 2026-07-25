import React, { useState, useRef, useEffect, useCallback } from "react";
import { AIMode, AIChatMessage, UserSettings, CharacterStatus, MemoryItem, UserProfileVector, JournalEntry, HabitItem, GoalItem } from "../types";
import { sendAIChatRequest, generateLifeContextGreeting } from "../lib/aiService";
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
  X,
  RefreshCw,
} from "lucide-react";

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

const MODES = [
  { mode: "Life Coach" as AIMode, label: "Life Coach", sub: "การเติบโต & ทิศทาง", icon: Brain, color: "#4E7345" },
  { mode: "Goal Coach" as AIMode, label: "Goal Coach", sub: "ย่อเป้าหมายเป็นงาน 15 นาที", icon: Scale, color: "#6B9361" },
  { mode: "Therapist" as AIMode, label: "AI Therapist", sub: "จิตวิทยา CBT & อารมณ์", icon: HeartHandshake, color: "#7A9B61" },
  { mode: "Decision Helper" as AIMode, label: "Decision Helper", sub: "วิเคราะห์ทางเลือก & ผลกระทบ", icon: Compass, color: "#869883" },
  { mode: "Future Self" as AIMode, label: "Future Self", sub: "มุมมองจากตัวตนที่สำเร็จ 5 ปี", icon: Hourglass, color: "#B07A60" },
  { mode: "Weekly Reflection" as AIMode, label: "Weekly Reflection", sub: "ทบทวนรอบ 7 วัน", icon: Calendar, color: "#6B9361" },
  { mode: "Monthly Reflection" as AIMode, label: "Monthly Reflection", sub: "ภาพรวมรายเดือน", icon: Layers, color: "#4E7345" },
];

const SUGGESTION_BY_MODE: Record<string, string[]> = {
  "Life Coach": ["ช่วยวางแผนวันนี้", "ฉันกำลังติดอยู่กับอะไร?", "ช่วยจัดลำดับความสำคัญ"],
  "Goal Coach": ["ย่อเป้าหมายใหญ่เป็น 15 นาที", "ติดตามความคืบหน้า", "ขั้นตอนถัดไปคืออะไร?"],
  "Therapist": ["ฉันรู้สึกหนักใจ", "วิเคราะห์ Pattern อารมณ์", "ช่วยให้ฉันรู้สึกดีขึ้น"],
  "Decision Helper": ["ช่วยตัดสินใจเรื่องสำคัญ", "วิเคราะห์ข้อดีข้อเสีย", "ฉันควรเลือกทางไหน?"],
  "Future Self": ["ฉันในอีก 5 ปีเป็นอย่างไร?", "คุณสำเร็จได้อย่างไร?", "บทเรียนสำคัญจากอนาคต"],
  "Weekly Reflection": ["สรุปสัปดาห์ที่ผ่านมา", "Pattern ที่สังเกตได้", "บทเรียนสำคัญสัปดาห์นี้"],
  "Monthly Reflection": ["ภาพรวมเดือนนี้", "สิ่งที่เติบโตขึ้น", "เป้าหมายเดือนหน้า"],
};

// ─── Chat Popup Modal ──────────────────────────────────────────────────────────
interface ChatPopupProps {
  mode: AIMode;
  settings: UserSettings;
  character: CharacterStatus;
  memories: MemoryItem[];
  profileVector: UserProfileVector;
  journals: JournalEntry[];
  onClose: () => void;
  onOpenSettings?: () => void;
}

const ChatPopup: React.FC<ChatPopupProps> = ({
  mode,
  settings,
  character,
  memories,
  profileVector,
  journals,
  onClose,
  onOpenSettings,
}) => {
  const modeInfo = MODES.find((m) => m.mode === mode)!;
  const ModeIcon = modeInfo.icon;
  const suggestions = SUGGESTION_BY_MODE[mode] || [];

  // Only keep CURRENT exchange: [userMsg, aiMsg]
  const [chatPair, setChatPair] = useState<AIChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatPair, isLoading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async (textOverride?: string) => {
    const text = (textOverride ?? inputText).trim();
    if (!text || isLoading) return;

    if (!textOverride) setInputText("");

    const userMsg: AIChatMessage = {
      id: "u-" + Date.now(),
      sender: "user",
      text,
      timestamp: Date.now(),
      mode,
    };

    // Replace entire history with just this new question (no accumulation)
    setChatPair([userMsg]);
    setIsLoading(true);

    try {
      const responseText = await sendAIChatRequest({
        prompt: text,
        mode,
        userContext: {
          userName: settings.userName,
          characterStats: character,
          memories: memories.slice(0, 10),
          profileVector,
          recentJournals: journals.slice(0, 3).map((j) => ({
            title: j.title,
            mood: j.mood,
            content: j.content.slice(0, 150),
          })),
          activeMode: mode,
        },
        settings,
      });

      const aiMsg: AIChatMessage = {
        id: "ai-" + Date.now(),
        sender: "ai",
        text: responseText,
        timestamp: Date.now(),
        mode,
      };
      setChatPair([userMsg, aiMsg]);
    } catch (err: any) {
      const errMsg: AIChatMessage = {
        id: "ai-err-" + Date.now(),
        sender: "ai",
        text: `เกิดข้อผิดพลาด: ${err?.message || "ไม่สามารถเชื่อมต่อได้"}`,
        timestamp: Date.now(),
        mode,
      };
      setChatPair([userMsg, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full sm:max-w-lg bg-[#131913] rounded-t-3xl sm:rounded-3xl flex flex-col border border-[#1F2B1F] shadow-2xl overflow-hidden" style={{ height: "82vh", maxHeight: "680px" }}>

        {/* Header */}
        <div className="px-5 py-4 border-b border-[#1F2B1F] flex items-center justify-between bg-[#171E17] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: modeInfo.color + "33" }}>
              <ModeIcon className="w-4.5 h-4.5" style={{ color: modeInfo.color }} />
            </div>
            <div>
              <p className="text-sm font-bold text-[#EBF1EA]">{modeInfo.label}</p>
              <p className="text-[10px] text-[#869883]">{modeInfo.sub}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#182218] border border-[#273727] flex items-center justify-center text-[#869883] hover:text-[#EBF1EA] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 hide-scrollbar">
          {/* No API Key */}
          {!settings.aiApiKey && (
            <div className="p-4 rounded-2xl bg-[#182218] border border-[#273727] text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Key className="w-5 h-5 text-[#6B9361] flex-shrink-0" />
                <div>
                  <span className="font-bold text-[#EBF1EA]">ยังไม่ได้ตั้งค่า API Key</span>
                  <p className="text-[11px] text-[#869883]">ใส่ API Key เพื่อเปิดใช้งาน AI Coach</p>
                </div>
              </div>
              {onOpenSettings && (
                <button onClick={() => { onClose(); onOpenSettings(); }} className="px-3 py-1.5 rounded-xl bg-[#3F5C3A] text-white font-semibold text-xs hover:bg-[#4E7345] whitespace-nowrap">
                  ตั้งค่า
                </button>
              )}
            </div>
          )}

          {/* Empty state — show suggestions */}
          {chatPair.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-6 gap-4 text-center">
              <div className="w-16 h-16 rounded-3xl flex items-center justify-center" style={{ backgroundColor: modeInfo.color + "22" }}>
                <ModeIcon className="w-8 h-8" style={{ color: modeInfo.color }} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#EBF1EA]">{modeInfo.label}</p>
                <p className="text-xs text-[#869883] mt-0.5">{modeInfo.sub}</p>
              </div>
              <div className="w-full space-y-2 pt-2">
                <p className="text-[11px] text-[#697A66] uppercase tracking-widest font-bold">ลองถามเลย</p>
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(s)}
                    className="w-full text-left px-4 py-2.5 rounded-2xl bg-[#182218] border border-[#273727] text-xs text-[#EBF1EA] hover:border-[#4E7345] transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Current Q&A pair */}
          {chatPair.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.sender === "user" ? "flex-row-reverse" : ""}`}
            >
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${m.sender === "ai" ? "bg-[#3F5C3A] text-white" : "bg-[#1F2B1F] text-[#EBF1EA]"}`}>
                {m.sender === "ai" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed max-w-[85%] ${m.sender === "ai" ? "bg-[#182218] border border-[#273727] text-[#EBF1EA] rounded-tl-none" : "bg-[#3F5C3A] text-white rounded-tr-none"}`}>
                <p className="whitespace-pre-wrap">{m.text}</p>
              </div>
            </div>
          ))}

          {/* Loading */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#3F5C3A] text-white flex items-center justify-center">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-[#182218] border border-[#273727] text-[#869883] text-sm rounded-tl-none">
                <span className="inline-flex gap-1">
                  <span className="animate-bounce" style={{ animationDelay: "0ms" }}>•</span>
                  <span className="animate-bounce" style={{ animationDelay: "150ms" }}>•</span>
                  <span className="animate-bounce" style={{ animationDelay: "300ms" }}>•</span>
                </span>
              </div>
            </div>
          )}

          {/* After AI replies — show "ถามอีกครั้ง" hint */}
          {chatPair.length === 2 && !isLoading && (
            <div className="flex items-center gap-2 pt-1">
              <div className="flex-1 h-px bg-[#1F2B1F]" />
              <span className="text-[10px] text-[#697A66] font-mono">พิมพ์คำถามถัดไปเพื่อเริ่มใหม่</span>
              <div className="flex-1 h-px bg-[#1F2B1F]" />
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-[#1F2B1F] bg-[#131913] flex-shrink-0">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`พิมพ์คุยกับ ${modeInfo.label}...`}
              className="flex-1 px-4 py-2.5 rounded-2xl bg-[#182018] border border-[#223022] text-sm text-[#EBF1EA] focus:outline-none focus:border-[#4E7345] transition-colors"
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
      </div>
    </div>
  );
};

// ─── Main AICoachView ─────────────────────────────────────────────────────────
export const AICoachView: React.FC<AICoachViewProps> = ({
  settings,
  character,
  memories,
  profileVector,
  journals,
  habits,
  goals,
  onOpenSettings,
  onOpenMemoryModal,
}) => {
  const [lifeGreeting, setLifeGreeting] = useState<string>(() => loadCachedGreeting());
  const [isGeneratingGreeting, setIsGeneratingGreeting] = useState(false);
  const [activePopupMode, setActivePopupMode] = useState<AIMode | null>(null);

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

  return (
    <>
      <div className="space-y-6 pb-28 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#EBF1EA]">โค้ช AI & Therapist</h2>
            <p className="text-xs text-[#869883]">ผู้ช่วยคิด วางแผน และดูแลสภาวะจิตใจ</p>
          </div>
          {onOpenMemoryModal && (
            <button
              onClick={onOpenMemoryModal}
              className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#182218] text-[#6B9361] border border-[#273727] hover:border-[#4E7345] transition-colors flex items-center gap-1.5"
            >
              <Brain className="w-3.5 h-3.5" />
              <span>สมอง AI ({memories.length})</span>
            </button>
          )}
        </div>

        {/* Life Context Card */}
        <div className="bg-[#182218] rounded-3xl p-5 border border-[#273727] shadow-lg space-y-3">
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
                  className="text-[#697A66] hover:text-[#6B9361] text-[10px] font-mono flex items-center gap-0.5 transition-colors"
                  title="รีเฟรชบทวิเคราะห์ (ใช้โทเค็นเพิ่ม)"
                >
                  <RefreshCw className="w-2.5 h-2.5" /> รีเฟรช
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

        {/* Mode Selection Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-[#869883] uppercase tracking-widest px-1">เลือกโหมดเพื่อเริ่มสนทนา</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {MODES.map(({ mode, label, sub, icon: Icon, color }) => (
              <button
                key={mode}
                onClick={() => setActivePopupMode(mode)}
                className="flex items-center gap-3 p-4 rounded-2xl border border-[#1F2B1F] bg-[#131913] hover:border-[#273727] hover:bg-[#182218] active:scale-95 transition-all text-left group"
              >
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: color + "22" }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#EBF1EA] truncate">{label}</p>
                  <p className="text-[11px] text-[#869883] truncate">{sub}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#697A66] group-hover:text-[#6B9361] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Popup Modal */}
      {activePopupMode && (
        <ChatPopup
          mode={activePopupMode}
          settings={settings}
          character={character}
          memories={memories}
          profileVector={profileVector}
          journals={journals}
          onClose={() => setActivePopupMode(null)}
          onOpenSettings={onOpenSettings}
        />
      )}
    </>
  );
};
