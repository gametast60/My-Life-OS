import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = "ยืนยันลบ",
  cancelText = "ยกเลิก",
  variant = "danger",
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const confirmBg =
    variant === "danger"
      ? "bg-red-500 hover:bg-red-600 text-white"
      : variant === "warning"
      ? "bg-amber-500 hover:bg-amber-600 text-white"
      : "bg-blue-600 hover:bg-blue-700 text-white";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-[#131913] rounded-3xl p-6 border border-[#1F2B1F] shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-5 h-5 ${variant === "danger" ? "text-red-400" : "text-amber-400"}`} />
            <h3 className="font-bold text-base text-[#EBF1EA]">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-full text-[#869883] hover:text-[#EBF1EA] hover:bg-[#182018] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message */}
        <p className="text-xs text-[#869883] leading-relaxed">{message}</p>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-600 text-xs font-semibold text-gray-200 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${confirmBg}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
