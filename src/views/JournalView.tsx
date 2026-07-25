import React, { useState, useRef } from "react";
import { JournalEntry, UserSettings } from "../types";
import { Plus, Smile, Frown, Meh, Zap, Edit2, Trash2, X, Tag, Settings2 } from "lucide-react";
import { ManageTagsModal } from "../components/ManageTagsModal";

interface JournalViewProps {
  journals: JournalEntry[];
  settings: UserSettings;
  presetTags: string[];
  onAddJournal: (entry: JournalEntry) => void;
  onEditJournal?: (entry: JournalEntry) => void;
  onDeleteJournal?: (id: string) => void;
  onSavePresetTags: (tags: string[]) => void;
}

export const JournalView: React.FC<JournalViewProps> = ({
  journals,
  presetTags,
  onAddJournal,
  onEditJournal,
  onDeleteJournal,
  onSavePresetTags,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<"happy" | "neutral" | "sad" | "energetic">("happy");
  const [tags, setTags] = useState<string[]>(presetTags.slice(0, 2));
  const [customTagInput, setCustomTagInput] = useState("");
  const [isManageTagsOpen, setIsManageTagsOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Start Editing
  const handleStartEdit = (j: JournalEntry) => {
    setEditingId(j.id);
    setContent(j.content);
    setMood((j.mood as any) || "happy");
    setTags(j.tags || []);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const len = j.content.length;
        textareaRef.current.setSelectionRange(len, len);
      }
    }, 50);
  };

  // Cancel Editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setContent("");
    setMood("happy");
    setTags(["การทำงาน", "พัฒนาตนเอง"]);
    setCustomTagInput("");
  };

  // Add Custom Tag
  const handleAddCustomTag = () => {
    const trimmed = customTagInput.trim().replace(/^#/, "");
    if (!trimmed) return;
    if (!tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setCustomTagInput("");
  };

  // Toggle Preset Tag
  const handleToggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  // Remove Selected Tag
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Handle Form Submit (Add or Edit)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (editingId) {
      // Find original entry to preserve date and id
      const existing = journals.find((j) => j.id === editingId);
      if (existing && onEditJournal) {
        onEditJournal({
          ...existing,
          content: content.trim(),
          mood,
          tags,
        });
      }
      handleCancelEdit();
    } else {
      const newEntry: JournalEntry = {
        id: "j-" + Date.now(),
        date: new Date().toLocaleDateString("th-TH", {
          weekday: "short",
          day: "numeric",
          month: "short",
        }),
        timestamp: Date.now(),
        content: content.trim(),
        mood,
        tags,
      };
      onAddJournal(newEntry);
      setContent("");
      setCustomTagInput("");
    }
  };

  const handleDelete = (id: string) => {
    if (editingId === id) handleCancelEdit();
    if (onDeleteJournal) onDeleteJournal(id);
  };

  const getMoodIcon = (m: string) => {
    switch (m) {
      case "happy":
      case "😊":
        return <Smile className="w-4 h-4 text-[#6B9361]" />;
      case "energetic":
      case "🤩":
        return <Zap className="w-4 h-4 text-amber-400" />;
      case "neutral":
      case "😐":
        return <Meh className="w-4 h-4 text-[#869883]" />;
      case "sad":
      case "😫":
      case "😕":
        return <Frown className="w-4 h-4 text-blue-400" />;
      default:
        return <Smile className="w-4 h-4 text-[#6B9361]" />;
    }
  };

  return (
    <div className="space-y-6 pb-28 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#EBF1EA]">ไดอารี่ & บันทึกความคิด</h2>
          <p className="text-xs text-[#869883]">ทบทวนบทเรียน ความรู้สึก และไอเดียใหม่ประจำวัน</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Create or Edit Journal Entry */}
        <div className="md:col-span-5 space-y-4">
          <form
            onSubmit={handleSubmit}
            className="bg-[#131913] rounded-3xl p-6 border border-[#1F2B1F] shadow-lg space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#EBF1EA] flex items-center gap-2">
                {editingId ? <Edit2 className="w-4 h-4 text-[#6B9361]" /> : <Plus className="w-4 h-4 text-[#6B9361]" />}
                <span>{editingId ? "แก้ไขบันทึก" : "เพิ่มบันทึกใหม่"}</span>
              </h3>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-xs text-[#869883] hover:text-[#EBF1EA] flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> ยกเลิก
                </button>
              )}
            </div>

            {/* Mood Picker */}
            <div>
              <label className="text-xs text-[#869883] block mb-2">อารมณ์ความรู้สึกวันนี้</label>
              <div className="flex gap-2">
                {[
                  { id: "happy", label: "มีความสุข", icon: Smile },
                  { id: "energetic", label: "กระปรี้กระเปร่า", icon: Zap },
                  { id: "neutral", label: "ปกติ", icon: Meh },
                  { id: "sad", label: "เหนื่อยล้า", icon: Frown },
                ].map((item) => {
                  const ItemIcon = item.icon;
                  const isSelected = mood === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMood(item.id as any)}
                      className={`flex-1 p-2.5 rounded-2xl border flex flex-col items-center gap-1 transition-all ${
                        isSelected
                          ? "bg-[#3F5C3A] border-[#4E7345] text-white shadow-sm"
                          : "bg-[#182018] border-[#223022] text-[#869883] hover:border-[#273727]"
                      }`}
                    >
                      <ItemIcon className="w-4 h-4" />
                      <span className="text-[10px] font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content Textarea */}
            <div>
              <label className="text-xs text-[#869883] block mb-1.5">เนื้อหาบันทึก</label>
              <textarea
                ref={textareaRef}
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="วันนี้มีเรื่องอะไรน่าจดจำ หรือมีบทเรียนอะไรที่อยากบันทึกไว้..."
                className="w-full p-3.5 rounded-2xl bg-[#182018] border border-[#223022] text-xs sm:text-sm text-[#EBF1EA] placeholder-[#697A66] focus:outline-none focus:border-[#4E7345] resize-none"
              />
            </div>

            {/* Custom Tag Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-[#869883] flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#6B9361]" />
                  <span>เลือก / เพิ่มแท็ก (Tags)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsManageTagsOpen(true)}
                  className="text-[11px] text-[#6B9361] hover:underline flex items-center gap-1 font-medium transition-all"
                >
                  <Settings2 className="w-3 h-3" />
                  <span>จัดการแท็ก</span>
                </button>
              </div>

              {/* Selected Tags Badge List */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pb-1">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-[#3F5C3A] text-white border border-[#4E7345] font-mono"
                    >
                      #{t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="hover:text-red-300 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Preset Tags Chips */}
              <div className="flex flex-wrap gap-1.5">
                {presetTags.map((pt) => {
                  const isSelected = tags.includes(pt);
                  return (
                    <button
                      key={pt}
                      type="button"
                      onClick={() => handleToggleTag(pt)}
                      className={`text-[10px] px-2.5 py-1 rounded-full border font-mono transition-all ${
                        isSelected
                          ? "bg-[#233523] border-[#4E7345] text-[#6B9361]"
                          : "bg-[#182018] border-[#223022] text-[#869883] hover:border-[#273727]"
                      }`}
                    >
                      +{pt}
                    </button>
                  );
                })}
              </div>

              {/* Add Custom Tag Input */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomTag();
                    }
                  }}
                  placeholder="พิมพ์แท็กใหม่ เช่น #การเรียน..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-[#182018] border border-[#223022] text-xs text-[#EBF1EA] focus:outline-none focus:border-[#4E7345]"
                />
                <button
                  type="button"
                  onClick={handleAddCustomTag}
                  disabled={!customTagInput.trim()}
                  className="px-3 py-1.5 rounded-xl bg-[#182218] border border-[#273727] text-xs font-semibold text-[#6B9361] hover:bg-[#233323] disabled:opacity-40 transition-colors"
                >
                  + เพิ่มแท็ก
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!content.trim()}
              className="w-full py-3 rounded-2xl bg-[#3F5C3A] hover:bg-[#4E7345] text-white font-bold text-xs font-mono uppercase tracking-wider transition-colors disabled:opacity-40 shadow-sm"
            >
              {editingId ? "บันทึกการแก้ไข" : "บันทึกไดอารี่"}
            </button>
          </form>
        </div>

        {/* Right Column: Journal Feed */}
        <div className="md:col-span-7 space-y-4">
          <h3 className="font-bold text-xs text-[#869883] uppercase tracking-widest px-1">
            ประวัติการบันทึก ({journals.length})
          </h3>

          <div className="space-y-4">
            {journals.length === 0 ? (
              <div className="text-center py-10 bg-[#131913] rounded-3xl border border-[#1F2B1F] text-[#869883] text-sm">
                ยังไม่มีบันทึก เขียนไดอารี่แรกของคุณในช่องด้านซ้ายได้เลย!
              </div>
            ) : (
              journals.map((j) => (
                <div
                  key={j.id}
                  className={`bg-[#131913] rounded-3xl p-5 border shadow-lg space-y-3 transition-all ${
                    editingId === j.id ? "border-[#4E7345] ring-2 ring-[#4E7345]/30" : "border-[#1F2B1F]"
                  }`}
                >
                  <div className="flex justify-between items-center border-b border-[#1F2B1F] pb-3">
                    <div className="flex items-center gap-2">
                      {getMoodIcon(j.mood)}
                      <span className="text-xs font-bold text-[#EBF1EA]">{j.date}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5 flex-wrap">
                        {j.tags?.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#182218] text-[#6B9361] border border-[#273727] font-mono"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>

                      {/* Action Buttons: Edit & Delete */}
                      <div className="flex items-center gap-1 ml-2 border-l border-[#1F2B1F] pl-2">
                        <button
                          onClick={() => handleStartEdit(j)}
                          className="p-1.5 rounded-lg text-[#869883] hover:text-[#EBF1EA] hover:bg-[#182218] transition-colors"
                          title="แก้ไขบันทึกนี้"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {onDeleteJournal && (
                          <button
                            onClick={() => handleDelete(j.id)}
                            className="p-1.5 rounded-lg text-[#869883] hover:text-red-400 hover:bg-[#2A1818] transition-colors"
                            title="ลบบันทึกนี้"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-[#EBF1EA] leading-relaxed whitespace-pre-wrap">
                    {j.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <ManageTagsModal
        isOpen={isManageTagsOpen}
        onClose={() => setIsManageTagsOpen(false)}
        presetTags={presetTags}
        onSavePresetTags={onSavePresetTags}
      />
    </div>
  );
};
