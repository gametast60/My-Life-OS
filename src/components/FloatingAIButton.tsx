import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Plus, Target, CheckSquare, Eye, Heart, Bot, GripVertical } from "lucide-react";
import { RoomDatabase } from "../lib/db";
import { FABPosition } from "../types";

interface FloatingAIButtonProps {
  onOpenAICoach: () => void;
  onQuickAction: (action: string) => void;
}

export const FloatingAIButton: React.FC<FloatingAIButtonProps> = ({
  onOpenAICoach,
  onQuickAction,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<FABPosition | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initX: number; initY: number } | null>(null);
  const hasDraggedRef = useRef(false);

  useEffect(() => {
    const saved = RoomDatabase.getFABPosition();
    if (saved) {
      setPosition(saved);
    }
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    hasDraggedRef.current = false;
    const currentX = position?.x ?? (window.innerWidth - 80);
    const currentY = position?.y ?? (window.innerHeight - 140);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: currentX,
      initY: currentY,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      hasDraggedRef.current = true;
      setIsDragging(true);
    }
    const newX = Math.max(10, Math.min(window.innerWidth - 70, dragStartRef.current.initX + dx));
    const newY = Math.max(70, Math.min(window.innerHeight - 100, dragStartRef.current.initY + dy));
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragStartRef.current && position && hasDraggedRef.current) {
      RoomDatabase.saveFABPosition(position);
    }
    dragStartRef.current = null;
    setTimeout(() => setIsDragging(false), 50);
  };

  const handleClickMain = () => {
    if (!hasDraggedRef.current) {
      setIsOpen(!isOpen);
    }
  };

  const containerStyle: React.CSSProperties = position
    ? { position: "fixed", left: `${position.x}px`, top: `${position.y}px`, zIndex: 50 }
    : { position: "fixed", bottom: "80px", right: "20px", zIndex: 50 };

  return (
    <div
      style={containerStyle}
      className="flex flex-col items-end gap-2 touch-none select-none"
    >
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

      {/* Main Trigger & Drag Handle */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onClick={handleClickMain}
          className={`w-14 h-14 rounded-full bg-[#3F5C3A] text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-transform duration-200 relative group border border-[#4E7345]/50 cursor-grab active:cursor-grabbing ${
            isOpen ? "rotate-45 bg-[#131913]" : ""
          }`}
          title="ลากเพื่อย้าย / คลิกเพื่อเปิดเมนู"
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
    </div>
  );
};
