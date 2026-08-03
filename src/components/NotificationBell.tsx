import React, { useState, useRef, useEffect } from "react";
import { ReminderItem } from "../types";
import { Bell, X, Clock } from "lucide-react";

interface NotificationBellProps {
  reminders: ReminderItem[];
  onMarkAsRead: (id: string) => void;
  onNavigateToReminder?: (reminder: ReminderItem) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  reminders,
  onMarkAsRead,
  onNavigateToReminder,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleItemClick = (reminder: ReminderItem) => {
    // Mark as read
    if (!reminder.isRead) {
      onMarkAsRead(reminder.id);
    }
    // Navigate if handler provided
    if (onNavigateToReminder) {
      onNavigateToReminder(reminder);
    }
    // Close dropdown
    setIsOpen(false);
  };

  const formatDateShort = (d: string) =>
    new Date(d).toLocaleString("th-TH", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-[#869883] hover:text-[#EBF1EA] hover:bg-white/5 transition-all flex items-center gap-1.5"
        title="เตือนความจำ"
      >
        <Bell className="w-5 h-5" />
        {reminders.length > 0 && (
          <span className="text-[10px] font-mono bg-[#273727] text-[#6B9361] px-2 py-0.5 rounded-full border border-[#354B35]">
            {reminders.length}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="fixed left-4 right-4 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-96 max-w-md sm:max-w-none mx-auto sm:mx-0 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
          style={{ background: "#1c1c1e", border: "1px solid #3a3a3c" }}
        >
          {/* Header with Close Button */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ background: "#2c2c2e", borderBottom: "1px solid #3a3a3c" }}
          >
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#6B9361]" />
              <h3 className="text-xs font-bold" style={{ color: "#f2f2f7" }}>เตือนความจำ</h3>
              {reminders.length > 0 && (
                <span
                  className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(230, 180, 92, 0.18)", color: "#E6B45C", border: "1px solid rgba(230, 180, 92, 0.35)" }}
                >
                  {reminders.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg transition-all hover:bg-white/5"
                style={{ color: "#a1a1a6" }}
                title="ปิด"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-72 overflow-y-auto" style={{ background: "#1c1c1e" }}>
            {reminders.length === 0 ? (
              <div className="py-8 text-center text-xs" style={{ color: "#a1a1a6" }}>
                ไม่มีรายการเตือนความจำ ✨
              </div>
            ) : (
              reminders.map((r, i) => (
                <div
                  key={r.id}
                  className="p-3 flex items-start gap-2.5 cursor-pointer group transition-colors"
                  style={{
                    borderTop: i === 0 ? "none" : "1px solid #3a3a3c",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#2c2c2e")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  onClick={() => handleItemClick(r)}
                >
                  {/* Read indicator */}
                  <div
                    className="w-2 h-2 mt-2 rounded-full flex-shrink-0"
                    style={
                      r.isRead
                        ? { background: "#3a3a3c", border: "1px solid #48484a" }
                        : { background: "#E6B45C" }
                    }
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-relaxed" style={{ color: "#f2f2f7" }}>
                      {r.text}
                    </p>
                    {r.dueDate && (
                      <span
                        className="text-[10px] font-mono flex items-center gap-1 mt-0.5"
                        style={{ color: "#E6B45C" }}
                      >
                        <Clock className="w-3 h-3" /> {formatDateShort(r.dueDate)}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};