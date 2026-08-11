import React, { useState } from "react";
import { APIProvider, UserSettings } from "../types";
import { testProviderConnection } from "../lib/aiService";
import {
  X,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  ShieldCheck,
  Zap,
  ChevronUp,
  ChevronDown,
  GripVertical,
  ClipboardPaste,
} from "lucide-react";

interface ManageAPIModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSaveSettings: (settings: UserSettings) => void;
}

const PROVIDER_DEFAULTS: Record<"Gemini" | "Groq" | "OpenRouter", { defaultModel: string; placeholder: string; docUrl: string }> = {
  Gemini: {
    defaultModel: "gemini-2.5-flash",
    placeholder: "AIzaSy...",
    docUrl: "https://aistudio.google.com/app/apikey",
  },
  Groq: {
    defaultModel: "llama-3.3-70b-versatile",
    placeholder: "gsk_...",
    docUrl: "https://console.groq.com/keys",
  },
  OpenRouter: {
    defaultModel: "openrouter/free",
    placeholder: "sk-or-v1-...",
    docUrl: "https://openrouter.ai/keys",
  },
};

export const ManageAPIModal: React.FC<ManageAPIModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [providers, setProviders] = useState<APIProvider[]>(settings.apiProviders || []);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({});

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleShowKey = (id: string) => {
    setShowKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePasteClipboard = async (onPaste: (text: string) => void) => {
    try {
      if (!navigator?.clipboard?.readText) {
        alert("เบราว์เซอร์หรืออุปกรณ์นี้ยังไม่รองรับการอ่านคลิปบอร์ดโดยตรง");
        return;
      }
      const text = await navigator.clipboard.readText();
      if (text) {
        onPaste(text.trim());
      }
    } catch (err) {
      console.error("Paste clipboard error:", err);
    }
  };

  const handleAddProvider = (name: "Gemini" | "Groq" | "OpenRouter") => {
    const config = PROVIDER_DEFAULTS[name];
    const newProvider: APIProvider = {
      id: `provider-${Date.now()}`,
      name,
      apiKey: "",
      model: config.defaultModel,
      enabled: true,
      priority: providers.length + 1,
    };
    const updated = [...providers, newProvider];
    setProviders(updated);
  };

  const handleUpdateProvider = (id: string, fields: Partial<APIProvider>) => {
    const updated = providers.map((p) => (p.id === id ? { ...p, ...fields } : p));
    setProviders(updated);
  };

  const handleDeleteProvider = (id: string) => {
    const updated = providers.filter((p) => p.id !== id);
    const reindexed = updated.map((p, idx) => ({ ...p, priority: idx + 1 }));
    setProviders(reindexed);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...providers];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    const reindexed = updated.map((p, idx) => ({ ...p, priority: idx + 1 }));
    setProviders(reindexed);
  };

  const handleMoveDown = (index: number) => {
    if (index === providers.length - 1) return;
    const updated = [...providers];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    const reindexed = updated.map((p, idx) => ({ ...p, priority: idx + 1 }));
    setProviders(reindexed);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverId !== id && draggedId !== id) {
      setDragOverId(id);
    }
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }
    const fromIdx = providers.findIndex((p) => p.id === draggedId);
    const toIdx = providers.findIndex((p) => p.id === targetId);
    if (fromIdx === -1 || toIdx === -1) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }
    const updated = [...providers];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    const reindexed = updated.map((p, idx) => ({ ...p, priority: idx + 1 }));
    setProviders(reindexed);
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleTestConnection = async (provider: APIProvider) => {
    setTestingId(provider.id);
    const result = await testProviderConnection(provider);
    setTestResults((prev) => ({ ...prev, [provider.id]: result }));
    setTestingId(null);
  };

  const handleSave = () => {
    const updatedSettings = {
      ...settings,
      apiProviders: providers,
    };
    onSaveSettings(updatedSettings);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden flex flex-col shadow-2xl"
        style={{
          background: "#131a13",
          border: "1px solid rgba(107,147,97,0.3)",
          maxHeight: "90vh",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid rgba(107,147,97,0.15)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #4E7345, #6B9361)" }}
            >
              <Zap size={18} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base" style={{ color: "#EBF1EA" }}>
                Manage AI Providers
              </h2>
              <p className="text-xs" style={{ color: "#869883" }}>
                ระบบจะใช้ AI ตามลำดับ Priority (Failover อัตโนมัติ)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/5 text-gray-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {providers.length === 0 ? (
            <div className="text-center py-8 px-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px border-dashed rgba(107,147,97,0.2)" }}>
              <ShieldCheck size={36} className="mx-auto mb-2 opacity-40 text-emerald-500" />
              <p className="text-sm font-semibold mb-1" style={{ color: "#EBF1EA" }}>
                ยังไม่ได้เพิ่ม AI Provider
              </p>
              <p className="text-xs mb-4" style={{ color: "#869883" }}>
                กดปุ่มด้านล่างเพื่อเพิ่ม Gemini, Groq หรือ OpenRouter
              </p>
            </div>
          ) : (
            providers.map((p, idx) => {
              const defaults = PROVIDER_DEFAULTS[p.name];
              const test = testResults[p.id];
              const isTesting = testingId === p.id;
              const showKey = !!showKeys[p.id];
              const isDragged = draggedId === p.id;
              const isOver = dragOverId === p.id && draggedId !== p.id;

              return (
                <div
                  key={p.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, p.id)}
                  onDragOver={(e) => handleDragOver(e, p.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, p.id)}
                  onDragEnd={handleDragEnd}
                  className="rounded-xl p-4 space-y-3 relative select-none transition-all duration-150"
                  style={{
                    background: isDragged
                      ? "rgba(78,115,69,0.08)"
                      : "rgba(255,255,255,0.03)",
                    border: `1px solid ${
                      isOver
                        ? "rgba(107,147,97,0.7)"
                        : p.enabled
                          ? "rgba(107,147,97,0.25)"
                          : "rgba(255,255,255,0.08)"
                    }`,
                    opacity: isDragged ? 0.5 : p.enabled ? 1 : 0.6,
                    cursor: "grab",
                    transform: isOver ? "translateY(2px)" : "translateY(0)",
                  }}
                >
                  {/* Provider Card Top Bar */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white cursor-grab active:cursor-grabbing"
                        title="ลากเพื่อจัดลำดับ"
                      >
                        <GripVertical size={14} />
                      </button>
                      <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: "rgba(107,147,97,0.2)", color: "#6B9361" }}>
                        #{idx + 1}
                      </span>
                      <span className="font-bold text-sm" style={{ color: "#EBF1EA" }}>
                        {p.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => handleMoveUp(idx)}
                          disabled={idx === 0}
                          className="p-1 rounded hover:bg-white/10 text-gray-300 disabled:opacity-20"
                          title="เลื่อนขึ้น"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          onClick={() => handleMoveDown(idx)}
                          disabled={idx === providers.length - 1}
                          className="p-1 rounded hover:bg-white/10 text-gray-300 disabled:opacity-20"
                          title="เลื่อนลง"
                        >
                          <ChevronDown size={14} />
                        </button>
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer text-xs" style={{ color: "#869883" }}>
                        <input
                          type="checkbox"
                          checked={p.enabled}
                          onChange={(e) => handleUpdateProvider(p.id, { enabled: e.target.checked })}
                          className="rounded text-emerald-600 focus:ring-0"
                        />
                        <span>{p.enabled ? "ใช้งาน" : "ปิด"}</span>
                      </label>

                      <button
                        onClick={() => handleDeleteProvider(p.id)}
                        className="p-1 rounded hover:bg-red-500/10 text-red-400 transition-colors"
                        title="ลบ Provider นี้"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Inputs */}
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs" style={{ color: "#869883" }}>
                          API Key
                        </label>
                        {defaults?.docUrl && (
                          <a
                            href={defaults.docUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] underline text-emerald-400 hover:text-emerald-300"
                          >
                            รับ API Key ฟรี ↗
                          </a>
                        )}
                      </div>
                      <div className="relative flex items-center">
                        <input
                          type={showKey ? "text" : "password"}
                          value={p.apiKey}
                          onChange={(e) => handleUpdateProvider(p.id, { apiKey: e.target.value })}
                          placeholder={defaults?.placeholder || "ใส่ API Key..."}
                          className="w-full pl-3 pr-20 py-2 rounded-lg text-xs outline-none"
                          style={{
                            background: "rgba(0,0,0,0.3)",
                            border: "1px solid rgba(107,147,97,0.2)",
                            color: "#EBF1EA",
                          }}
                        />
                        <div className="absolute right-2 flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handlePasteClipboard((text) => handleUpdateProvider(p.id, { apiKey: text }))}
                            className="px-1.5 py-1 rounded text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 active:bg-emerald-500/20 transition-colors flex items-center gap-1 text-[11px] font-medium"
                            title="วางข้อความจากคลิปบอร์ด"
                          >
                            <ClipboardPaste size={13} />
                            <span>วาง</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleShowKey(p.id)}
                            className="p-1 rounded text-gray-400 hover:text-white"
                            title={showKey ? "ซ่อน" : "แสดง"}
                          >
                            {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs mb-1 block" style={{ color: "#869883" }}>
                        Model Name
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          value={p.model === "auto-free" ? "openrouter/free" : p.model}
                          onChange={(e) => handleUpdateProvider(p.id, { model: e.target.value })}
                          placeholder={defaults?.defaultModel}
                          className="w-full pl-3 pr-16 py-2 rounded-lg text-xs outline-none"
                          style={{
                            background: "rgba(0,0,0,0.3)",
                            border: "1px solid rgba(107,147,97,0.2)",
                            color: "#EBF1EA",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handlePasteClipboard((text) => handleUpdateProvider(p.id, { model: text }))}
                          className="absolute right-2 px-1.5 py-1 rounded text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 active:bg-emerald-500/20 transition-colors flex items-center gap-1 text-[11px] font-medium"
                          title="วางข้อความจากคลิปบอร์ด"
                        >
                          <ClipboardPaste size={13} />
                          <span>วาง</span>
                        </button>
                      </div>
                      {p.name === "OpenRouter" && (
                        <p className="text-[10px] mt-1" style={{ color: "#5f6e5d" }}>
                          พิมพ์ชื่อ model เอง เช่น qwen/qwen3.7-flash, google/gemma-2-9b-it:free
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Test Connection Button & Status */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => handleTestConnection(p)}
                      disabled={isTesting || !p.apiKey}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all disabled:opacity-40"
                      style={{
                        background: "rgba(107,147,97,0.15)",
                        color: "#6B9361",
                        border: "1px solid rgba(107,147,97,0.25)",
                      }}
                    >
                      {isTesting ? <RefreshCw size={12} className="animate-spin" /> : null}
                      <span>ทดสอบการเชื่อมต่อ</span>
                    </button>

                    {test && (
                      <div className="flex items-center gap-1.5 text-xs">
                        {test.success ? (
                          <>
                            <CheckCircle2 size={14} className="text-emerald-400" />
                            <span className="text-emerald-400 font-medium">เชื่อมต่อสำเร็จ</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle size={14} className="text-red-400" />
                            <span className="text-red-400 truncate max-w-[180px]">{test.message}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Add Provider Options */}
          <div className="pt-2">
            <p className="text-xs font-semibold mb-2" style={{ color: "#869883" }}>
              + เพิ่ม AI Provider:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleAddProvider("Gemini")}
                className="py-2.5 px-3 rounded-xl text-xs font-medium border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-1"
              >
                <Plus size={14} /> Gemini
              </button>
              <button
                onClick={() => handleAddProvider("Groq")}
                className="py-2.5 px-3 rounded-xl text-xs font-medium border border-orange-500/20 bg-orange-500/10 text-orange-300 hover:bg-orange-500/20 transition-all flex items-center justify-center gap-1"
              >
                <Plus size={14} /> Groq
              </button>
              <button
                onClick={() => handleAddProvider("OpenRouter")}
                className="py-2.5 px-3 rounded-xl text-xs font-medium border border-purple-500/20 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 transition-all flex items-center justify-center gap-1"
              >
                <Plus size={14} /> OpenRouter
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex gap-3" style={{ borderTop: "1px solid rgba(107,147,97,0.15)" }}>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold hover:bg-white/5 text-gray-300 transition-colors"
            style={{ border: "1px solid rgba(255,255,255,0.1)" }}
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white transition-all shadow-lg hover:brightness-110 active:scale-95"
            style={{ background: "linear-gradient(135deg, #4E7345, #6B9361)" }}
          >
            บันทึกการตั้งค่า
          </button>
        </div>
      </div>
    </div>
  );
};
