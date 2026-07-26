import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  AIMode,
  AIChatMessage,
  UserSettings,
  CharacterStatus,
  BrainCard,
  JournalEntry,
  HabitItem,
  GoalItem,
  ReflectionPeriod,
} from "../types";
import {
  sendAIChatRequest,
  analyzeTodayJournals,
  suggestBrainCard,
  getSmallTalk,
  generateReflection,
} from "../lib/aiService";
import {
  Bot,
  User,
  Send,
  Sparkles,
  ChevronRight,
  Brain,
  Scale,
  HeartHandshake,
  Compass,
  Hourglass,
  Calendar,
  Layers,
  X,
  RefreshCw,
  MessageSquare,
  Globe,
  FileText,
} from "lucide-react";

interface AICoachViewProps {
  settings: UserSettings;
  character: CharacterStatus;
  messages: AIChatMessage[];
  brainCards: BrainCard[];
  journals: JournalEntry[];
  habits: HabitItem[];
  goals: GoalItem[];
  onSaveMessage: (msg: AIChatMessage) => void;
  onClearSession?: () => void;
  onOpenManageAPI?: () => void;
  onOpenLifeBrain?: () => void;
  onSuggestCard?: (card: Partial<BrainCard>) => void;
}

const MODES = [
  { mode: "Coach" as AIMode, label: "Life Coach", sub: "วางแผนชีวิต & ทิศทาง", icon: Brain, color: "#4E7345" },
  { mode: "Therapist" as AIMode, label: "AI Therapist", sub: "จิตวิทยา CBT & ทบทวนอารมณ์", icon: HeartHandshake, color: "#7A9B61" },
  { mode: "Decision" as AIMode, label: "Decision Helper", sub: "วิเคราะห์ทางเลือก & ผลกระทบ", icon: Compass, color: "#869883" },
  { mode: "Future Self" as AIMode, label: "Future Self", sub: "มุมมองตัวตนในอนาคต 5 ปี", icon: Hourglass, color: "#B07A60" },
  { mode: "Secretary" as AIMode, label: "Secretary", sub: "จัดการ Task, Planning & Priority", icon: Calendar, color: "#6B9361" },
  { mode: "Reflection" as AIMode, label: "Reflection", sub: "ทบทวนบทเรียนสรุป Insight", icon: Layers, color: "#4E7345" },
];

export const AICoachView: React.FC<AICoachViewProps> = ({
  settings,
  character,
  messages,
  brainCards,
  journals,
  habits,
  goals,
  onSaveMessage,
  onClearSession,
  onOpenManageAPI,
  onOpenLifeBrain,
  onSuggestCard,
}) => {
  const [selectedMode, setSelectedMode] = useState<AIMode>("Coach");
  const [activePopupMode, setActivePopupMode] = useState<AIMode | null>(null);
  const [reflectionPeriod, setReflectionPeriod] = useState<ReflectionPeriod>("today");
  
  // Today's analysis & smalltalk state
  const [todayAnalysis, setTodayAnalysis] = useState<string>("");
  const [isAnalyzingToday, setIsAnalyzingToday] = useState(false);
  const [smallTalk, setSmallTalk] = useState<string>("");
  const [smallTalkLang, setSmallTalkLang] = useState<"th" | "en" | "ko">(settings.smallTalkLanguage || "th");
  const [isLoadingSmallTalk, setIsLoadingSmallTalk] = useState(false);

  // Load smalltalk on mount or lang change
  useEffect(() => {
    setSmallTalk(getSmallTalk(smallTalkLang));
  }, [smallTalkLang]);

  const handleAnalyzeToday = async () => {
    setIsAnalyzingToday(true);
    // filter today's journals using timezone-aware comparison
    const todayKey = new Intl.DateTimeFormat("sv-SE", {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }).format(new Date());

    const todayJournals = journals.filter((j) => {
      const d = new Date(j.timestamp);
      const key = new Intl.DateTimeFormat("sv-SE", {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }).format(d);
      return key === todayKey;
    });

    const result = await analyzeTodayJournals(todayJournals, brainCards, settings);
    setTodayAnalysis(result);
    setIsAnalyzingToday(false);
  };

  const handleGenerateReflection = async () => {
    setIsAnalyzingToday(true);
    const result = await generateReflection(reflectionPeriod, journals, brainCards, settings);
    setTodayAnalysis(result);
    setIsAnalyzingToday(false);
  };

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto px-4">
      {/* Top Banner / Small Talk Card */}
      <div
        className="rounded-2xl p-5 relative overflow-hidden shadow-xl border"
        style={{
          background: "linear-gradient(135deg, rgba(20,28,20,0.9), rgba(10,14,10,0.95))",
          borderColor: "rgba(107,147,97,0.25)",
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                💬 Today's Small Talk
              </span>
              <div className="flex items-center gap-1 bg-black/40 rounded-lg p-0.5 border border-emerald-900/40 text-[11px]">
                {(["th", "en", "ko"] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSmallTalkLang(lang)}
                    className={`px-2 py-0.5 rounded ${
                      smallTalkLang === lang ? "bg-emerald-700/50 text-white font-medium" : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-sm md:text-base font-medium text-emerald-100 italic">
              "{smallTalk}"
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenLifeBrain}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/20 text-emerald-300 transition-all"
            >
              <Brain size={14} />
              Life Brain ({brainCards.length})
            </button>
            <button
              onClick={onOpenManageAPI}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/20 text-emerald-300 transition-all"
            >
              🔑 Manage AI
            </button>
          </div>
        </div>
      </div>

      {/* Mode Grid Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-100">เลือกโหมด AI Assistant</h2>
          <p className="text-xs text-gray-400">AI จะอ่าน Life Brain เพื่อให้คำแนะนำเฉพาะตัวคุณ</p>
        </div>
      </div>

      {/* Modes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {MODES.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.mode}
              onClick={() => setActivePopupMode(m.mode)}
              className="rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:scale-[1.02] border bg-emerald-950/10 hover:bg-emerald-950/20 group"
              style={{ borderColor: "rgba(107,147,97,0.2)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ background: `${m.color}25`, color: m.color }}
                >
                  <Icon size={20} />
                </div>
                <ChevronRight size={16} className="text-gray-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h3 className="font-bold text-sm text-gray-200 mb-1">{m.label}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{m.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Special Feature: Analyze Today & Reflection Box */}
      <div
        className="rounded-2xl p-5 border space-y-4 shadow-xl"
        style={{
          background: "rgba(255,255,255,0.02)",
          borderColor: "rgba(107,147,97,0.2)",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-amber-400" />
            <h3 className="font-bold text-sm text-gray-200">เครื่องมือวิเคราะห์และทบทวน (Reflection)</h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleAnalyzeToday}
              disabled={isAnalyzingToday}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-700/40 hover:bg-emerald-600/40 border border-emerald-500/30 text-emerald-200 transition-all flex items-center gap-1.5"
            >
              {isAnalyzingToday ? <RefreshCw size={14} className="animate-spin" /> : <FileText size={14} />}
              วิเคราะห์วันนี้
            </button>

            <div className="flex items-center bg-black/40 rounded-xl p-1 border border-emerald-900/30 text-xs">
              {(["today", "week", "month", "year"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setReflectionPeriod(p)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    reflectionPeriod === p ? "bg-emerald-600 text-white font-medium" : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  {p === "today" ? "วันนี้" : p === "week" ? "7 วัน" : p === "month" ? "30 วัน" : "1 ปี"}
                </button>
              ))}
            </div>

            <button
              onClick={handleGenerateReflection}
              disabled={isAnalyzingToday}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-900/30 hover:bg-emerald-800/30 border border-emerald-500/20 text-emerald-300 transition-all"
            >
              สรุป Reflection
            </button>
          </div>
        </div>

        {todayAnalysis && (
          <div
            className="p-4 rounded-xl text-xs text-gray-200 leading-relaxed whitespace-pre-wrap animate-in fade-in duration-300"
            style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(107,147,97,0.2)" }}
          >
            {todayAnalysis}
          </div>
        )}
      </div>

      {/* Interactive Chat Popup Modal */}
      {activePopupMode && (
        <ChatPopupModal
          mode={activePopupMode}
          settings={settings}
          brainCards={brainCards}
          journals={journals}
          messages={messages}
          onSaveMessage={onSaveMessage}
          onClose={() => setActivePopupMode(null)}
          onSuggestCard={onSuggestCard}
        />
      )}
    </div>
  );
};

// ── Chat Popup Modal ──────────────────────────────────────────────────
interface ChatPopupModalProps {
  mode: AIMode;
  settings: UserSettings;
  brainCards: BrainCard[];
  journals: JournalEntry[];
  messages: AIChatMessage[];
  onSaveMessage: (msg: AIChatMessage) => void;
  onClose: () => void;
  onSuggestCard?: (card: Partial<BrainCard>) => void;
}

const ChatPopupModal: React.FC<ChatPopupModalProps> = ({
  mode,
  settings,
  brainCards,
  journals,
  messages,
  onSaveMessage,
  onClose,
  onSuggestCard,
}) => {
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const modeMessages = messages.filter((m) => m.mode === mode || (!m.mode && mode === "Coach"));

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [modeMessages, isSending]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    const userMsgText = input.trim();
    setInput("");

    // blur keyboard for mobile
    if (textareaRef.current) {
      textareaRef.current.blur();
    }

    const userMsg: AIChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: userMsgText,
      timestamp: Date.now(),
      mode,
    };
    onSaveMessage(userMsg);

    setIsSending(true);

    try {
      const response = await sendAIChatRequest({
        prompt: userMsgText,
        mode,
        brainCards,
        recentJournals: journals.slice(0, 5),
        settings,
      });

      const aiMsg: AIChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: "ai",
        text: response,
        timestamp: Date.now(),
        mode,
      };
      onSaveMessage(aiMsg);

      // Trigger background suggestion check
      if (onSuggestCard) {
        suggestBrainCard(userMsgText, brainCards, settings).then((suggested) => {
          if (suggested) onSuggestCard(suggested);
        });
      }
    } catch (err: any) {
      const errorMsg: AIChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: "ai",
        text: `เกิดข้อผิดพลาด: ${err.message}`,
        timestamp: Date.now(),
        mode,
      };
      onSaveMessage(errorMsg);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div
        className="w-full max-w-2xl h-[85vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl border border-emerald-900/40"
        style={{ background: "#0d130d" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-emerald-900/30 bg-emerald-950/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700/30 flex items-center justify-center text-emerald-400">
              <Bot size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-200">{mode} Mode</h3>
              <p className="text-[11px] text-gray-400">Read-Only Life Brain Context Enabled</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5">
            <X size={18} />
          </button>
        </div>

        {/* Message Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {modeMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 text-xs p-6">
              <Bot size={36} className="mb-2 opacity-30 text-emerald-500" />
              <p className="text-gray-300 font-medium mb-1">เริ่มการสนทนาในโหมด {mode}</p>
              <p>ถามคำถาม ขอคำแนะนำ หรือให้ช่วยวางแผนชีวิตได้เลยครับ</p>
            </div>
          ) : (
            modeMessages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "ai" && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-800/40 flex items-center justify-center text-emerald-300 flex-shrink-0 mt-1">
                    <Bot size={14} />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                    m.sender === "user"
                      ? "bg-emerald-700 text-white rounded-br-none"
                      : "bg-emerald-950/40 text-gray-200 border border-emerald-900/30 rounded-bl-none"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))
          )}
          {isSending && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 animate-pulse">
              <Bot size={14} />
              <span>AI กำลังคิดคำตอบ...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-emerald-900/30 bg-black/40">
          <div className="flex items-center gap-2 bg-emerald-950/30 rounded-xl p-1.5 border border-emerald-900/40">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="พิมพ์ข้อความ... (Shift+Enter เพื่อเว้นวรรค)"
              className="flex-1 bg-transparent px-2 text-xs text-gray-200 outline-none resize-none max-h-24"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isSending}
              className="p-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-lg transition-all flex-shrink-0"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
