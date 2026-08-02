import React, { useState, useEffect } from "react";
import { X, User, RefreshCw, ShieldOff, Sparkles } from "lucide-react";
import {
  getBieIdentityProfile,
  confirmBieIdentity,
  undoAppliedBieItem,
  saveBieIdentityProfile,
} from "../../pie/bie/bieDiscoveryService";
import type { IdentityRow } from "../../pie/bie/types";
import { IdentityProfileCard } from "./IdentityProfileCard";

interface IdentityReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bieEnabled?: boolean;
}

export const IdentityReviewModal: React.FC<IdentityReviewModalProps> = ({
  isOpen,
  onClose,
  bieEnabled = true,
}) => {
  const [profile, setProfile] = useState<IdentityRow | undefined>(undefined);

  const reload = () => {
    const p = getBieIdentityProfile(bieEnabled);
    setProfile(p);
  };

  useEffect(() => {
    if (isOpen) reload();
  }, [isOpen, bieEnabled]);

  const handleConfirm = () => {
    confirmBieIdentity();
    reload();
  };

  const handleUndo = () => {
    if (profile) {
      // Revert applied flag to false via repository undo
      saveBieIdentityProfile({ ...profile, applied: false });
      reload();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0A0E0A] border border-[#6B9361]/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#6B9361]/20 bg-[#141A14]/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 text-violet-400 border border-violet-500/30">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#EBF1EA] flex items-center gap-2">
                AI เข้าใจคุณอย่างไร
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-medium">
                  รอการตัดสินใจ
                </span>
              </h2>
              <p className="text-xs text-[#869883]">
                ตรวจสอบว่า AI เข้าใจตัวตนของคุณถูกต้องหรือไม่
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={reload}
              className="p-1.5 rounded-lg text-[#869883] hover:text-[#EBF1EA] hover:bg-white/10 transition-all"
              title="รีเฟรช"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#869883] hover:text-[#EBF1EA] hover:bg-white/10 transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1">
          {!bieEnabled ? (
            <div className="p-8 text-center flex flex-col items-center gap-3">
              <div className="p-4 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <ShieldOff size={32} />
              </div>
              <h3 className="text-sm font-semibold text-[#EBF1EA]">AI ยังไม่พร้อมทำงาน</h3>
              <p className="text-xs text-[#869883] max-w-xs">
                เปิดใช้งาน AI เพื่อให้ระบบเรียนรู้และเข้าใจตัวตนของคุณ
              </p>
            </div>
          ) : !profile ? (
            <div className="p-8 text-center flex flex-col items-center gap-3">
              <div className="p-4 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                <Sparkles size={32} />
              </div>
              <h3 className="text-sm font-semibold text-[#EBF1EA]">
                AI ยังรู้จักคุณไม่เพียงพอ
              </h3>
              <p className="text-xs text-[#869883] max-w-xs leading-relaxed">
                เขียนบันทึก ติดตามนิสัย และบันทึกเป้าหมายเพิ่มเติม
                เพื่อให้ AI เรียนรู้และเข้าใจตัวตนของคุณมากขึ้น
              </p>
            </div>
          ) : (
            <IdentityProfileCard
              profile={profile}
              onConfirm={handleConfirm}
              onUndo={handleUndo}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#6B9361]/15 bg-[#141A14]/40 text-[11px] text-[#869883]">
          การยืนยันช่วยให้ AI เข้าใจคุณได้ดีขึ้น — คุณสามารถเปลี่ยนคำตอบได้ตลอดเวลา
        </div>
      </div>
    </div>
  );
};
