import React, { useEffect, useRef, useState } from "react";
import { ConfirmModal } from "./ConfirmModal";

export interface ManifestCardProps {
  /** null / "" means no manifest exists yet -> show empty state with "add" button */
  manifestText: string | null;
  /** ISO date string or already-formatted display string, only used when manifestText is set */
  lastUpdated?: string | null;
  onBack: () => void;
  onSave: (newText: string) => void;
  onDelete: () => void;
  onEditModeChange?: (isEditing: boolean) => void;
}

function formatTimestamp(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (isNaN(date.getTime())) return value; // already formatted, pass through
  return date.toLocaleString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Mode = "view" | "edit";

export function ManifestCard({
  manifestText,
  lastUpdated,
  onBack,
  onSave,
  onDelete,
  onEditModeChange,
}: ManifestCardProps) {
  const [mode, setMode] = useState<Mode>("view");
  const [draft, setDraft] = useState(manifestText ?? "");
  const [dirty, setDirty] = useState(false);
  const [dotsOpen, setDotsOpen] = useState(false);
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const dotsRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Notify parent component about edit mode state (to hide/show bottom nav bar)
  useEffect(() => {
    onEditModeChange?.(mode === "edit");
  }, [mode, onEditModeChange]);

  // Close the "..." dropdown when clicking outside it
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dotsRef.current && !dotsRef.current.contains(e.target as Node)) {
        setDotsOpen(false);
      }
    }
    if (dotsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [dotsOpen]);

  const hasManifest = !!manifestText && manifestText.trim().length > 0;

  function startEdit() {
    setDraft(manifestText ?? "");
    setDirty(false);
    setMode("edit");
    setDotsOpen(false);
  }

  function requestExitEdit() {
    if (dirty) {
      setShowUnsavedConfirm(true);
    } else {
      setMode("view");
    }
  }

  function discardEdit() {
    setShowUnsavedConfirm(false);
    setMode("view");
  }

  function saveEdit() {
    onSave(draft);
    setDirty(false);
    setMode("view");
  }

  function confirmDelete() {
    setShowDeleteConfirm(false);
    onDelete();
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 bg-[#0A0E0A] text-[#EBF1EA] rounded-2xl flex flex-col min-h-screen">
      {/* Sticky Header — uses --app-header-height CSS var (defined in index.css) */}
      <div
        className="sticky z-20 bg-[#0A0E0A] flex items-center justify-between mb-4 relative pb-2 border-b border-[#1F2B1F] shrink-0"
        style={{ top: 'var(--app-header-height)' }}
      >
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-[#EBF1EA]">Manifest</h1>
        </div>

        {mode === "view" && hasManifest && (
          <div ref={dotsRef} className="relative">
            <button
              aria-label="ตัวเลือกเพิ่มเติม"
              onClick={() => setDotsOpen((v) => !v)}
              className="p-2 rounded-xl text-[#869883] hover:text-[#EBF1EA] hover:bg-white/5 transition-all cursor-pointer flex items-center justify-center"
            >
              <i className="ti ti-dots-vertical text-xl" aria-hidden="true" />
            </button>

            {dotsOpen && (
              <div className="absolute top-10 right-0 bg-[#131913] border border-[#1F2B1F] rounded-xl min-w-[140px] shadow-2xl overflow-hidden z-40 animate-in fade-in duration-150">
                <button
                  onClick={startEdit}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-[#EBF1EA] hover:bg-[#182218] transition-colors cursor-pointer text-left"
                >
                  <i className="ti ti-edit text-sm text-[#869883]" aria-hidden="true" />
                  <span>แก้ไข</span>
                </button>
                <button
                  onClick={() => {
                    setDotsOpen(false);
                    setShowDeleteConfirm(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer border-t border-[#1F2B1F] text-left"
                >
                  <i className="ti ti-trash text-sm text-red-400" aria-hidden="true" />
                  <span>ลบ</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* View Mode with Manifest */}
      {mode === "view" && hasManifest && (
        <div className="flex-1 min-h-0 bg-[#131913] border border-[#1F2B1F] rounded-2xl p-5 md:p-6 flex flex-col justify-between shadow-xl">
          <div className="flex-1 min-h-0 overflow-y-auto pr-2 whitespace-pre-wrap leading-relaxed text-sm md:text-base text-[#EBF1EA]">
            {manifestText}
          </div>
          {lastUpdated && (
            <div className="mt-4 pt-3 border-t border-[#1F2B1F] text-xs text-[#869883] flex items-center gap-1.5 shrink-0">
              <i className="ti ti-clock text-sm" aria-hidden="true" />
              <span>แก้ไขล่าสุด: {formatTimestamp(lastUpdated)}</span>
            </div>
          )}
        </div>
      )}

      {/* View Mode Empty State */}
      {mode === "view" && !hasManifest && (
        <div className="flex-1 min-h-0 bg-[#131913] border border-[#1F2B1F] rounded-2xl p-8 md:p-12 text-center flex flex-col items-center justify-center shadow-xl my-auto">
          <div className="w-14 h-14 rounded-2xl bg-[#182218] border border-[#273727] flex items-center justify-center mb-4 shadow-inner">
            <i className="ti ti-file-off text-2xl text-[#869883]" aria-hidden="true" />
          </div>
          <h2 className="text-base font-bold text-[#EBF1EA] mb-1">ยังไม่มี Manifest</h2>
          <p className="text-xs text-[#869883] mb-6 max-w-sm">
            เขียนคุณค่า เป้าหมายสูงสุด หรือหลักการนำทางชีวิตของคุณใน Manifest นี้
          </p>
          <button
            onClick={startEdit}
            className="bg-[#4E7345] hover:bg-[#6B9361] text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-[#4E7345]/20 cursor-pointer flex items-center gap-2"
          >
            <i className="ti ti-plus text-sm" />
            <span>สร้าง Manifest</span>
          </button>
        </div>
      )}

      {/* Edit Mode: Full Height Matching View Mode Container */}
      {mode === "edit" && (
        <div className="flex-1 min-h-0 flex flex-col justify-between">
          {/* Frameless transparent scrollable textarea */}
          <div className="flex-1 min-h-[350px] py-2 flex flex-col">
            <textarea
              ref={textareaRef}
              autoFocus
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                setDirty(true);
              }}
              placeholder="พิมพ์ Manifest ของคุณที่นี่..."
              className="w-full flex-1 min-h-[350px] bg-transparent outline-none border-none p-0 text-[#EBF1EA] text-sm md:text-base leading-relaxed placeholder-[#869883]/50 resize-none font-sans overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#1F2B1F]"
            />
          </div>

          {/* Sticky Footer for Action Buttons & Real-time Character Counter */}
          <div className="bg-[#0A0E0A] pt-3 pb-2 border-t border-[#1F2B1F] z-20 shrink-0 flex flex-col gap-3">
            {/* Real-time Character Counter */}
            <div className="flex items-center justify-between text-xs text-[#869883]">
              <span className="font-mono">
                {draft.length.toLocaleString("th-TH")} ตัวอักษร
              </span>
              {dirty && (
                <span className="text-amber-400 text-[11px] flex items-center gap-1">
                  <i className="ti ti-[#869883] ti-point-filled" />
                  มีการแก้ไข
                </span>
              )}
            </div>

            {/* Cancel & Save Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={requestExitEdit}
                className="flex-1 py-3 px-4 rounded-xl bg-transparent border border-[#1F2B1F] hover:bg-white/5 text-xs font-semibold text-[#869883] hover:text-[#EBF1EA] transition-all cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={saveEdit}
                disabled={draft.trim().length === 0}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 ${
                  draft.trim().length === 0
                    ? "bg-[#182218] text-[#869883]/40 cursor-not-allowed border border-[#1F2B1F]"
                    : "bg-[#4E7345] hover:bg-[#6B9361] text-white cursor-pointer shadow-[#4E7345]/20"
                }`}
              >
                <i className="ti ti-check text-sm" />
                <span>บันทึก</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modals */}
      <ConfirmModal
        open={showUnsavedConfirm}
        title="ยังไม่ได้บันทึก"
        message="มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก ต้องการออกจากหน้านี้เลยไหม?"
        confirmLabel="ออกโดยไม่บันทึก"
        cancelLabel="แก้ไขต่อ"
        variant="danger"
        onConfirm={discardEdit}
        onCancel={() => setShowUnsavedConfirm(false)}
      />

      <ConfirmModal
        open={showDeleteConfirm}
        title="ลบ Manifest?"
        message="การลบจะไม่สามารถกู้คืนได้ ข้อมูล manifest ทั้งหมดจะหายไปถาวร"
        confirmLabel="ลบ"
        cancelLabel="ยกเลิก"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
