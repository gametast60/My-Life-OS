import React, { useState, useEffect, useMemo } from "react";
import { X, ChevronLeft, ChevronRight, Clock, Calendar, Trash2 } from "lucide-react";

interface DateTimePickerProps {
  isOpen: boolean;
  /** Value in format "YYYY-MM-DDTHH:mm" (empty string = no date set) */
  value: string;
  /** Called with the confirmed value ("YYYY-MM-DDTHH:mm" or "" to clear) */
  onConfirm: (value: string) => void;
  onClose: () => void;
}

const THAI_MONTHS = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

const WEEKDAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

const pad = (n: number) => String(n).padStart(2, "0");

/** Parse a "YYYY-MM-DDTHH:mm" string into a Date object. */
const parseValue = (value: string): Date | null => {
  if (!value) return null;
  const [datePart, timePart] = value.split("T");
  if (!datePart) return null;
  const [y, m, d] = datePart.split("-").map(Number);
  let h = 9;
  let min = 0;
  if (timePart) {
    const [hh, mm] = timePart.split(":").map(Number);
    if (!isNaN(hh)) h = hh;
    if (!isNaN(mm)) min = mm;
  }
  return new Date(y, (m || 1) - 1, d || 1, h, min);
};

/** Format a Date into "YYYY-MM-DDTHH:mm". */
const formatValue = (date: Date): string => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
};

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  isOpen,
  value,
  onConfirm,
  onClose,
}) => {
  const initialValue = useMemo(() => parseValue(value) ?? new Date(), [value, isOpen]);

  const [tempDate, setTempDate] = useState<Date>(initialValue);
  const [viewMonth, setViewMonth] = useState<Date>(initialValue);

  // Reset internal state whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      const parsed = parseValue(value);
      const base = parsed ?? new Date();
      setTempDate(base);
      setViewMonth(new Date(base.getFullYear(), base.getMonth(), 1));
    }
  }, [isOpen, value]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const hasInitialValue = !!value;

  // Build the calendar grid (6 weeks x 7 days)
  const calendarDays: (Date | null)[] = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startWeekday = firstDay.getDay(); // 0 = Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: (Date | null)[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [viewMonth]);

  if (!isOpen) return null;

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const isToday = (d: Date) => isSameDay(d, new Date());

  const prevMonth = () =>
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1));
  const nextMonth = () =>
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1));

  const selectDay = (d: Date) => {
    // keep currently chosen hour/minute
    setTempDate(new Date(d.getFullYear(), d.getMonth(), d.getDate(), tempDate.getHours(), tempDate.getMinutes()));
  };

  const setQuick = (base: Date) => {
    setTempDate(base);
    setViewMonth(new Date(base.getFullYear(), base.getMonth(), 1));
  };

  const quickToday = () => {
    const now = new Date();
    setQuick(new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes()));
  };
  const quickTomorrow = () => {
    const now = new Date();
    now.setDate(now.getDate() + 1);
    setQuick(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0));
  };

  const setHour = (h: number) =>
    setTempDate(new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate(), h, tempDate.getMinutes()));
  const setMinute = (m: number) =>
    setTempDate(new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate(), tempDate.getHours(), m));

  const handleConfirm = () => onConfirm(formatValue(tempDate));
  const handleClear = () => onConfirm("");

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 15, 30, 45];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-md"
      style={{ animation: "dtpFadeIn 0.2s ease-out" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#131913] rounded-t-3xl border border-[#1F2B1F] border-b-0 shadow-2xl"
        style={{ animation: "dtpSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3 border-b border-[#1F2B1F]">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#6B9361]" />
            <h3 className="font-bold text-base text-[#EBF1EA]">เลือกวันและเวลา</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#869883] hover:text-[#EBF1EA] hover:bg-[#182018] transition-colors"
            title="ปิด"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Quick shortcuts */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={quickToday}
              className="flex-1 py-2 rounded-xl bg-[#182018] border border-[#223022] text-xs font-semibold text-[#EBF1EA] hover:border-[#4E7345] transition-colors"
            >
              วันนี้
            </button>
            <button
              type="button"
              onClick={quickTomorrow}
              className="flex-1 py-2 rounded-xl bg-[#182018] border border-[#223022] text-xs font-semibold text-[#EBF1EA] hover:border-[#4E7345] transition-colors"
            >
              พรุ่งนี้
            </button>
          </div>

          {/* Month navigation */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-lg text-[#869883] hover:text-[#EBF1EA] hover:bg-[#182018] transition-colors"
              title="เดือนก่อนหน้า"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold text-[#EBF1EA]">
              {THAI_MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear() + 543}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-lg text-[#869883] hover:text-[#EBF1EA] hover:bg-[#182018] transition-colors"
              title="เดือนถัดไป"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Calendar grid */}
          <div>
            <div className="grid grid-cols-7 gap-1 mb-1">
              {WEEKDAYS.map((w) => (
                <div key={w} className="text-center text-[10px] font-bold text-[#576656] py-1">
                  {w}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((d, i) => {
                if (!d) return <div key={i} />;
                const selected = isSameDay(d, tempDate);
                const today = isToday(d);
                return (
                  <button
                    type="button"
                    key={i}
                    onClick={() => selectDay(d)}
                    className={`aspect-square rounded-lg text-xs font-medium transition-all relative ${
                      selected
                        ? "bg-[#3F5C3A] text-white border border-[#4E7345] shadow-md font-bold"
                        : "text-[#EBF1EA] hover:bg-[#182018] border border-transparent"
                    }`}
                  >
                    {d.getDate()}
                    {today && !selected && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#6B9361]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time selector */}
          <div className="space-y-2 pt-2 border-t border-[#1F2B1F]">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#869883]">
              <Clock className="w-3.5 h-3.5 text-[#6B9361]" /> เวลา
            </div>
            <div className="flex items-center gap-2">
              <select
                value={tempDate.getHours()}
                onChange={(e) => setHour(Number(e.target.value))}
                className="flex-1 px-3 py-2 rounded-xl bg-[#182018] border border-[#223022] text-xs text-[#EBF1EA] outline-none focus:border-[#4E7345] appearance-none text-center"
              >
                {hours.map((h) => (
                  <option key={h} value={h}>
                    {pad(h)} น.
                  </option>
                ))}
              </select>
              <span className="text-[#869883] font-bold">:</span>
              <select
                value={minutes.reduce((prev, curr) =>
                  Math.abs(curr - tempDate.getMinutes()) < Math.abs(prev - tempDate.getMinutes()) ? curr : prev
                )}
                onChange={(e) => setMinute(Number(e.target.value))}
                className="flex-1 px-3 py-2 rounded-xl bg-[#182018] border border-[#223022] text-xs text-[#EBF1EA] outline-none focus:border-[#4E7345] appearance-none text-center"
              >
                {minutes.map((m) => (
                  <option key={m} value={m}>
                    {pad(m)} นาที
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Summary */}
          <div className="text-center text-xs text-[#6B9361] font-mono py-1 bg-[#182218] rounded-lg">
            {tempDate.toLocaleDateString("th-TH", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}{" "}
            • {pad(tempDate.getHours())}:{pad(tempDate.getMinutes())}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex gap-2 p-5 pt-3 border-t border-[#1F2B1F] bg-[#131913] sticky bottom-0">
          {hasInitialValue && (
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-2.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 hover:bg-red-900/40 transition-colors flex items-center gap-1.5"
              title="ลบการตั้งเวลา"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-600 text-xs font-semibold text-gray-200 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-95"
            style={{ background: "linear-gradient(135deg, #4E7345, #6B9361)" }}
          >
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
  );
};
