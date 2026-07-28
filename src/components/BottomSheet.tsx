import React, { useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, type LucideIcon } from "lucide-react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  headerIcon?: LucideIcon;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Max height of the sheet content (default '92vh') */
  maxHeight?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  headerIcon: HeaderIcon,
  children,
  footer,
  maxHeight = "92vh",
}) => {
  const handleDragEnd = useCallback(
    (_: any, info: { offset: { y: number }; velocity: { y: number } }) => {
      if (info.offset.y > 100 || info.velocity.y > 300) {
        onClose();
      }
    },
    [onClose],
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-lg flex flex-col overflow-hidden rounded-t-3xl sm:rounded-2xl"
            style={{
              background: "#131a13",
              border: "1px solid rgba(107,147,97,0.2)",
              maxHeight,
              borderBottom: "none",
              paddingBottom: "env(safe-area-inset-bottom)",
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 400, duration: 0.2 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag indicator bar */}
            <div className="flex justify-center pt-2.5 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Header */}
            {title && (
              <div
                className="px-6 py-4"
                style={{ borderBottom: "1px solid rgba(107,147,97,0.15)" }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    {HeaderIcon && (
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: "linear-gradient(135deg, #4E7345, #6B9361)" }}
                      >
                        <HeaderIcon size={16} className="text-white" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h2 className="font-bold text-base text-[#EBF1EA] truncate">{title}</h2>
                      {subtitle && (
                        <p className="text-[11px] text-[#869883] mt-0.5 leading-tight line-clamp-2">
                          {subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-gray-400 hover:text-white transition-colors flex-shrink-0"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-4 hide-scrollbar">
              {children}
            </div>

            {/* Optional sticky footer */}
            {footer && (
              <div
                className="px-6 py-4"
                style={{
                  borderTop: "1px solid rgba(107,147,97,0.15)",
                  paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
                }}
              >
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
