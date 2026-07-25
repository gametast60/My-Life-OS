import React, { useState } from "react";
import { MemoryItem, MemoryCategory, UserProfileVector } from "../types";
import { X, Brain, Trash2, Pin, Sparkles, Filter, Shield, Award, Compass } from "lucide-react";

interface MemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  memories: MemoryItem[];
  profileVector: UserProfileVector;
  onDeleteMemory: (id: string) => void;
  onTogglePin: (id: string) => void;
  onTriggerManualExtraction?: () => void;
}

const CATEGORY_LABELS: Record<MemoryCategory, { label: string; color: string }> = {
  value: { label: "ค่านิยม (Value)", color: "#6B9361" },
  fear: { label: "ความกลัว (Fear)", color: "#B07A60" },
  dream: { label: "ความฝัน (Dream)", color: "#4E7345" },
  strength: { label: "จุดแข็ง (Strength)", color: "#7A9B61" },
  weakness: { label: "จุดที่ต้องพัฒนา", color: "#B07A60" },
  lesson: { label: "บทเรียนชีวิต", color: "#6B9361" },
  pattern: { label: "พฤติกรรม (Pattern)", color: "#4E7345" },
  belief: { label: "ความเชื่อ (Belief)", color: "#7A9B61" },
};

export const MemoryModal: React.FC<MemoryModalProps> = ({
  isOpen,
  onClose,
  memories,
  profileVector,
  onDeleteMemory,
  onTogglePin,
  onTriggerManualExtraction,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"memories" | "profile">("memories");

  if (!isOpen) return null;

  const filteredMemories = memories.filter((m) => {
    if (selectedCategory === "all") return true;
    return m.category === selectedCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#131913] border border-[#273727] rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-5 relative max-h-[85vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-[#1F2B1F] pb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#182218] border border-[#273727] text-[#6B9361] flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#EBF1EA]">สมองส่วนขยายของ AI (Memory Engine)</h2>
              <p className="text-xs text-[#869883]">
                ความทรงจำ & Profile Vector ที่ AI เรียนรู้จากตัวคุณ ({memories.length} รายการ)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#182218] border border-[#273727] text-[#869883] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 border-b border-[#1F2B1F] pb-3 flex-shrink-0">
          <button
            onClick={() => setActiveTab("memories")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              activeTab === "memories"
                ? "bg-[#3F5C3A] border-[#4E7345] text-white"
                : "bg-[#182018] border-[#223022] text-[#869883] hover:text-[#EBF1EA]"
            }`}
          >
            🧠 ความทรงจำที่สกัดได้ ({memories.length})
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              activeTab === "profile"
                ? "bg-[#3F5C3A] border-[#4E7345] text-white"
                : "bg-[#182018] border-[#223022] text-[#869883] hover:text-[#EBF1EA]"
            }`}
          >
            🧬 User Profile Vector
          </button>
        </div>

        {activeTab === "memories" ? (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold border whitespace-nowrap transition-colors ${
                  selectedCategory === "all"
                    ? "bg-[#6B9361] border-[#7A9B61] text-white"
                    : "bg-[#182018] border-[#223022] text-[#869883] hover:text-[#EBF1EA]"
                }`}
              >
                ทั้งหมด
              </button>
              {Object.entries(CATEGORY_LABELS).map(([catKey, val]) => (
                <button
                  key={catKey}
                  onClick={() => setSelectedCategory(catKey)}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold border whitespace-nowrap transition-colors ${
                    selectedCategory === catKey
                      ? "bg-[#3F5C3A] border-[#4E7345] text-white"
                      : "bg-[#182018] border-[#223022] text-[#869883] hover:text-[#EBF1EA]"
                  }`}
                >
                  {val.label}
                </button>
              ))}
            </div>

            {/* Memories List */}
            {filteredMemories.length === 0 ? (
              <div className="text-center py-10 space-y-3 bg-[#182018] rounded-2xl border border-[#223022]">
                <Brain className="w-10 h-10 text-[#4E7345] mx-auto opacity-50" />
                <p className="text-sm text-[#869883]">ยังไม่มีข้อมูลความทรงจำในหมวดหมู่นี้</p>
                <p className="text-xs text-[#697A66]">
                  เขียน Journal ยาวกว่า 100 คำ AI จะช่วยสกัดความทรงจำสำคัญให้อัตโนมัติ (Confidence ≥ 75%)
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredMemories.map((mem) => {
                  const catInfo = CATEGORY_LABELS[mem.category] || {
                    label: mem.category,
                    color: "#6B9361",
                  };

                  return (
                    <div
                      key={mem.id}
                      className={`p-4 rounded-2xl border transition-all flex justify-between items-start gap-3 ${
                        mem.pinned
                          ? "bg-[#1C281C] border-[#4E7345]"
                          : "bg-[#182018] border-[#223022] hover:border-[#273727]"
                      }`}
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white font-mono"
                            style={{ backgroundColor: catInfo.color }}
                          >
                            {catInfo.label}
                          </span>
                          <span className="text-[10px] font-mono text-[#6B9361] bg-[#131913] px-2 py-0.5 rounded border border-[#1F2B1F]">
                            Confidence: {Math.round(mem.confidence * 100)}%
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-[#EBF1EA] leading-relaxed">
                          "{mem.content}"
                        </p>
                        <span className="text-[10px] text-[#697A66] block">
                          บันทึกเมื่อ: {new Date(mem.timestamp).toLocaleDateString("th-TH")}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => onTogglePin(mem.id)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            mem.pinned
                              ? "bg-[#4E7345] text-white border-[#6B9361]"
                              : "bg-[#131913] text-[#869883] border-[#1F2B1F] hover:text-white"
                          }`}
                          title={mem.pinned ? "ยกเลิกการปักหมุด" : "ปักหมุดความทรงจำสำคัญ"}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteMemory(mem.id)}
                          className="p-1.5 rounded-lg bg-[#131913] border border-[#1F2B1F] text-[#B07A60] hover:bg-[#2A1818] transition-colors"
                          title="ลบความทรงจำนี้"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Profile Vector Tab */
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <div className="bg-[#182018] rounded-2xl p-4 border border-[#223022] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#6B9361] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> บุคลิกภาพที่ AI วิเคราะห์ได้ (Personality)
                </span>
                <span className="text-[10px] text-[#697A66]">
                  อัปเดตแล้ว {profileVector.updateCount} ครั้ง
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#131913] border border-[#1F2B1F]">
                  <span className="text-[#869883] block text-[10px] uppercase">การยอมรับความเสี่ยง</span>
                  <span className="font-semibold text-[#EBF1EA] capitalize">
                    {profileVector.personality.riskTaking}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#131913] border border-[#1F2B1F]">
                  <span className="text-[#869883] block text-[10px] uppercase">รูปแบบความคิด</span>
                  <span className="font-semibold text-[#EBF1EA] capitalize">
                    {profileVector.personality.thinkingStyle}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#131913] border border-[#1F2B1F]">
                  <span className="text-[#869883] block text-[10px] uppercase">แรงจูงใจหลัก</span>
                  <span className="font-semibold text-[#EBF1EA] capitalize">
                    {profileVector.personality.motivation}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#131913] border border-[#1F2B1F]">
                  <span className="text-[#869883] block text-[10px] uppercase">สไตล์การทำงาน</span>
                  <span className="font-semibold text-[#EBF1EA] capitalize">
                    {profileVector.personality.workStyle}
                  </span>
                </div>
              </div>
            </div>

            {/* Core Values & Patterns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-[#182018] rounded-2xl p-4 border border-[#223022] space-y-2">
                <span className="text-xs font-bold text-[#EBF1EA] flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-[#6B9361]" /> ค่านิยมหลัก (Core Values)
                </span>
                {profileVector.values.length === 0 ? (
                  <p className="text-xs text-[#697A66]">ยังไม่มีข้อมูลค่านิยม</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {profileVector.values.map((v, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-[#131913] border border-[#1F2B1F] text-xs text-[#EBF1EA]">
                        #{v}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-[#182018] rounded-2xl p-4 border border-[#223022] space-y-2">
                <span className="text-xs font-bold text-[#EBF1EA] flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-[#6B9361]" /> พฤติกรรมที่พบ (Patterns)
                </span>
                {profileVector.patterns.length === 0 ? (
                  <p className="text-xs text-[#697A66]">ยังไม่มีข้อมูลพฤติกรรม</p>
                ) : (
                  <ul className="space-y-1 text-xs text-[#869883] list-disc list-inside">
                    {profileVector.patterns.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
