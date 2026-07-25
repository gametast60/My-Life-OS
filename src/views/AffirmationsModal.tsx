import React, { useState } from "react";
import { AffirmationItem } from "../types";
import { X, Heart, Play, Pause, Sparkles, Volume2 } from "lucide-react";

interface AffirmationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  affirmations: AffirmationItem[];
  onSaveAffirmations: (items: AffirmationItem[]) => void;
}

export const AffirmationsModal: React.FC<AffirmationsModalProps> = ({
  isOpen,
  onClose,
  affirmations,
  onSaveAffirmations,
}) => {
  const [items, setItems] = useState<AffirmationItem[]>(affirmations);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen) return null;

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleGenerateAI = () => {
    const aiText = "ฉันเลือกที่จะตอบสนองด้วยความตระหนักรู้ ปัญญา และความสงบในจิตใจเสมอ";
    const newItem: AffirmationItem = {
      id: "a-" + Date.now(),
      text: aiText,
      category: "Morning",
      favorite: true,
    };
    const updated = [newItem, ...items];
    setItems(updated);
    onSaveAffirmations(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#131913] rounded-3xl p-6 border border-[#1F2B1F] shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#1F2B1F] pb-4">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-[#6B9361]" />
            <div>
              <h3 className="text-xl font-bold text-[#EBF1EA]">คำโปรยเชิงบวก (Affirmations)</h3>
              <p className="text-xs text-[#869883]">ปรับสภาวะจิตใจและตอกย้ำความเชื่อมั่นยามเช้าและยามเย็น</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#182018] text-[#869883] hover:text-[#EBF1EA]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audio Player Card Simulation */}
        <div className="p-6 rounded-2xl bg-[#182218] border border-[#273727] text-center space-y-4 shadow-lg">
          <div className="w-12 h-12 rounded-full bg-[#233523] text-[#6B9361] mx-auto flex items-center justify-center animate-pulse border border-[#2E452E]">
            <Volume2 className="w-6 h-6" />
          </div>
          <p className="text-base font-bold text-[#EBF1EA] italic leading-relaxed">
            "{items[currentIndex]?.text || "ฉันทรงพลัง มีวินัย และพร้อมเติบโต"}"
          </p>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={togglePlay}
              className="px-6 py-2.5 rounded-full bg-[#3F5C3A] text-white text-xs font-mono font-bold flex items-center gap-2 hover:bg-[#4E7345] transition-colors shadow-sm"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? "พักการเล่นเสียง" : "เล่นเสียงวนรอบ (Loop Audio)"}</span>
            </button>
          </div>
        </div>

        {/* List of Affirmations */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-mono text-[#869883] uppercase font-bold">คลังคำโปรยของคุณ</h4>
            <button
              onClick={handleGenerateAI}
              className="text-xs font-mono text-[#6B9361] flex items-center gap-1 hover:underline"
            >
              <Sparkles className="w-3.5 h-3.5" /> สร้างด้วย AI
            </button>
          </div>

          <div className="space-y-2">
            {items.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => setCurrentIndex(idx)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  currentIndex === idx
                    ? "bg-[#182218] border-[#273727] text-[#EBF1EA] font-bold shadow-sm"
                    : "bg-[#182018] border-[#223022] text-[#869883] hover:border-[#273727]"
                }`}
              >
                <span className="text-[10px] font-mono text-[#6B9361] uppercase mr-2">[{item.category}]</span>
                <span className="text-xs">"{item.text}"</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
