import React, { useState } from "react";
import { ReminderItem, JournalEntry, MoodType } from "../types";
import { PresetMood } from "../lib/db";
import { BookOpen, X, Smile } from "lucide-react";

interface ReminderJournalModalProps {
  item: ReminderItem;
  presetTags: string[];
  presetMoods: PresetMood[];
  onConfirm: (entry: JournalEntry) => void;
  onClose: () => void;
}

export const ReminderJournalModal: React.FC<ReminderJournalModalProps> = ({
  item,
  presetTags,
  presetMoods,
  onConfirm,
  onClose,
}) => {
  const [selectedMood, setSelectedMood] = useState<string>(presetMoods[0]?.emoji || "😊");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = () => {
    const now = Date.now();
    const entryDate = new Date(now).toLocaleDateString("th-TH", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });

    const newEntry: JournalEntry = {
      id: "j-" + now,
      date: entryDate,
      timestamp: now,
      title: item.text.slice(0, 60),
      content: item.text,
      mode: "Normal Diary",
      mood: (selectedMood as MoodType) || "😊",
      emotion: selectedMood,
      tags: selectedTags,
      favorite: false,
      pinned: false,
      dimension: item.dimension || "mindset",
      linkedBrainCardIds: [],
    };
    onConfirm(newEntry);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-[#131913] rounded-3xl border border-[#1F2B1F] shadow-2xl p-6 space-y-5 animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#6B9361]" />
            <h3 className="font-bold text-sm text-[#EBF1EA]">บันทึกเป็นไดอารี่</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#869883] hover:text-[#EBF1EA] hover:bg-[#182218] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Reminder text preview */}
        <div className="p-3.5 rounded-2xl bg-[#182018] border border-[#223022]">
          <p className="text-[11px] text-[#869883] mb-1.5">บันทึกที่จะเพิ่มเข้าไดอารี่</p>
          <p className="text-sm text-[#EBF1EA] leading-relaxed">{item.text}</p>
        </div>

        {/* Mood Picker */}
        <div className="space-y-2">
          <label className="text-xs text-[#869883] flex items-center gap-1.5 font-semibold">
            <Smile className="w-3.5 h-3.5 text-[#6B9361]" />
            ใส่อารมณ์ไหน?
          </label>
          <div className="flex gap-2">
            {presetMoods.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMood(m.emoji)}
                className={`flex-1 py-2 rounded-xl text-center text-lg transition-all ${
                  selectedMood === m.emoji
                    ? "bg-[#273727] border-2 border-[#6B9361] scale-105"
                    : "bg-[#182018] border border-[#223022] hover:bg-[#1F2B1F] opacity-70"
                }`}
                title={m.label}
              >
                {m.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Tag Selector */}
        <div className="space-y-2">
          <label className="text-xs text-[#869883] font-semibold">เลือกแท็ก</label>
          <div className="flex flex-wrap gap-1.5">
            {presetTags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleToggleTag(tag)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-[#3F5C3A] text-white border border-[#6B9361]"
                      : "bg-[#182018] text-[#869883] border border-[#223022] hover:border-[#273727]"
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-[#182018] hover:bg-[#1F2B1F] border border-[#223022] text-xs font-semibold text-[#869883] transition-colors"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#4E7345] to-[#6B9361] hover:from-[#58824e] hover:to-[#7ba670] text-xs font-bold text-white shadow-lg transition-all"
          >
            บันทึกเข้าไดอารี่
          </button>
        </div>
      </div>
    </div>
  );
};
