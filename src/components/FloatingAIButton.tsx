import React, { useState } from "react";
import { Sparkles, Plus, Target, CheckSquare, Eye, Heart, Bot } from "lucide-react";

interface FloatingAIButtonProps {
  onOpenAICoach: () => void;
  onQuickAction: (action: string) => void;
}

export const FloatingAIButton: React.FC<FloatingAIButtonProps> = ({
  onOpenAICoach,
  onQuickAction,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-20 md:bottom-24 right-5 md:right-8 z-50 flex flex-col items-end gap-2">
      {/* Expanded Quick Action Menu */}
      {isOpen && (
        <div className="flex flex-col items-end gap-2 mb-2 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <button
            onClick={() => {
              setIsOpen(false);
              onOpenAICoach();
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#131913] text-[#EBF1EA] shadow-xl font-medium text-xs hover:bg-[#182218] hover:scale-105 transition-all border border-[#1F2B1F]"
          >
            <Bot className="w-4 h-4 text-[#6B9361]" />
            <span>คุยกับ AI Coach</span>
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              onQuickAction("checkin");
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#131913] text-[#EBF1EA] hover:text-[#6B9361] hover:bg-[#182218] border border-[#1F2B1F] text-xs shadow-md font-medium transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#6B9361]" />
            <span>Daily Check-in</span>
          </button>


          <button
            onClick={() => {
              setIsOpen(false);
              onQuickAction("goal");
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#131913] text-[#EBF1EA] hover:text-[#6B9361] hover:bg-[#182218] border border-[#1F2B1F] text-xs shadow-md font-medium transition-all"
          >
            <Target className="w-3.5 h-3.5 text-[#6B9361]" />
            <span>เพิ่มเป้าหมาย</span>
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              onQuickAction("checklist");
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#131913] text-[#EBF1EA] hover:text-[#6B9361] hover:bg-[#182218] border border-[#1F2B1F] text-xs shadow-md font-medium transition-all"
          >
            <CheckSquare className="w-3.5 h-3.5 text-[#6B9361]" />
            <span>เพิ่มภารกิจ</span>
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              onQuickAction("vision");
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#131913] text-[#EBF1EA] hover:text-[#6B9361] hover:bg-[#182218] border border-[#1F2B1F] text-xs shadow-md font-medium transition-all"
          >
            <Eye className="w-3.5 h-3.5 text-[#6B9361]" />
            <span>Vision Board</span>
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              onQuickAction("affirmation");
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#131913] text-[#EBF1EA] hover:text-[#6B9361] hover:bg-[#182218] border border-[#1F2B1F] text-xs shadow-md font-medium transition-all"
          >
            <Heart className="w-3.5 h-3.5 text-[#6B9361]" />
            <span>พลังบวก (Affirmation)</span>
          </button>
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full bg-[#3F5C3A] text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 relative group border border-[#4E7345]/50 ${
          isOpen ? "rotate-45 bg-[#131913]" : ""
        }`}
        title="AI Companion & Quick Actions"
      >
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#6B9361] rounded-full border-2 border-[#0A0E0A] animate-ping" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#6B9361] rounded-full border-2 border-[#0A0E0A]" />
        
        {isOpen ? (
          <Plus className="w-7 h-7 text-white" />
        ) : (
          <Sparkles className="w-7 h-7 text-white group-hover:rotate-12 transition-transform" />
        )}
      </button>
    </div>
  );
};
