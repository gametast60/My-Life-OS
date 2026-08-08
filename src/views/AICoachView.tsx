import React, { useState, useRef, useEffect } from "react";
import {
  AIMode,
  AIChatMessage,
  UserSettings,
  BrainCard,
  JournalEntry,
} from "../types";
import {
  sendAIChatRequest,
  summarizeAIChatExchange,
} from "../lib/aiService";
import {
  Bot,
  Send,
  ChevronRight,
  Brain,
  HeartHandshake,
  Compass,
  Hourglass,
  Calendar,
  Layers,
  X,
} from "lucide-react";
import { useAutoResizeTextarea } from "../hooks/useAutoResizeTextarea";
import { BieContextStatusBadge } from "../components/bie/BieContextStatusBadge";

interface AICoachViewProps {
  settings: UserSettings;
  messages: AIChatMessage[];
  brainCards: BrainCard[];
  journals: JournalEntry[];
  onSaveMessage: (msg: AIChatMessage) => void;
  onClearSession?: () => void;
  onAddJournal?: (entry: JournalEntry) => void;
}

const MODES = [
  { mode: "Coach" as AIMode, label: "Life Coach", sub: "วางแผนชีวิต & ทิศทาง", icon: Brain, color: "#4E7345" },
  { mode: "Therapist" as AIMode, label: "AI Therapist", sub: "จิตวิทยา CBT & ทบทวนอารมณ์", icon: HeartHandshake, color: "#7A9B61" },
  { mode: "Decision" as AIMode, label: "Decision Helper", sub: "วิเคราะห์ทางเลือก & ผลกระทบ", icon: Compass, color: "#869883" },
  { mode: "Future Self" as AIMode, label: "Future Self", sub: "มุมมองตัวตนในอนาคต 5 ปี", icon: Hourglass, color: "#B07A60" },
  { mode: "Secretary" as AIMode, label: "Secretary", sub: "จัดการ Task, Planning & Priority", icon: Calendar, color: "#6B9361" },
  { mode: "Reflection" as AIMode, label: "Reflection", sub: "ทบทวนบทเรียนสรุป Insight", icon: Layers, color: "#4E7345" },
];

export const AICoachView: React.FC<AICoachViewProps> = (props) => {
  const {
    settings,
    messages,
    brainCards,
    journals,
    onSaveMessage,
    onClearSession,
    onAddJournal,
  } = props;
  const [activePopupMode, setActivePopupMode] = useState<AIMode | null>(null);

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto px-4">
      {/* Header */}
      <div className="pt-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#EBF1EA]">
            AI Coach
          </h1>
          <p className="text-xs text-[#869883] mt-1">
            AI Assistant ส่วนตัว อ่านความเข้าใจชีวิตของคุณเพื่อแนะนำเฉพาะตัว
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
          <Brain size={14} className="text-emerald-400" />
          <span>อ่านความเข้าใจของคุณอัตโนมัติ</span>
        </div>
      </div>

      {/* Mode Grid Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-100">เลือกโหมด AI Assistant</h2>
          <p className="text-xs text-gray-400">แตะโหมดเพื่อเริ่มคุยกับ AI</p>
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

      {/* Interactive Chat Popup Modal */}
      {activePopupMode && (
        <ChatPopupModal
          mode={activePopupMode}
          settings={settings}
          brainCards={brainCards}
          journals={journals}
          messages={messages}
          onSaveMessage={onSaveMessage}
          onClearSession={onClearSession}
          onClose={() => setActivePopupMode(null)}
          onAddJournal={onAddJournal}
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
  onClearSession?: () => void;
  onClose: () => void;
  onAddJournal?: (entry: JournalEntry) => void;
}

const ChatPopupModal: React.FC<ChatPopupModalProps> = ({
  mode,
  settings,
  brainCards,
  journals,
  messages,
  onSaveMessage,
  onClearSession,
  onClose,
  onAddJournal,
}) => {
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const inputField = useAutoResizeTextarea(input, { minRows: 2, maxRows: 8 });

  const modeMessages = messages.filter((m) => m.mode === mode || (!m.mode && mode === "Coach"));

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [modeMessages, isSending]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    const userMsgText = input.trim();
    setInput("");

    // Automatically clear previous chat session for this mode to prevent Token ballooning
    if (onClearSession) {
      onClearSession();
    }

    // blur keyboard for mobile
    if (inputField.ref.current) {
      inputField.ref.current.blur();
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

      // Summarize key user intentions and save to Journal
      if (onAddJournal) {
        summarizeAIChatExchange({
          userPrompt: userMsgText,
          aiResponse: response,
          settings,
        }).then((summary) => {
          if (!summary) return;
          const now = Date.now();
          const entryDate = new Date(now).toLocaleDateString("th-TH", {
            weekday: "short",
            day: "numeric",
            month: "short",
          });
          const journalEntry: JournalEntry = {
            id: "j-chat-" + now,
            date: entryDate,
            timestamp: now,
            title: "AI Chat Insight",
            content: summary,
            mode: "Normal Diary",
            mood: "😊",
            emotion: "😊",
            tags: ["AI Chat"],
            favorite: false,
            pinned: false,
            dimension: "mindset",
            linkedBrainCardIds: [],
          };
          onAddJournal(journalEntry);
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
              {...inputField.textAreaProps}
              ref={inputField.ref}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="พิมพ์ข้อความ... (Shift+Enter เพื่อเว้นวรรค)"
              className="flex-1 bg-transparent px-2 text-xs text-gray-200 outline-none resize-none overflow-hidden leading-relaxed"
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