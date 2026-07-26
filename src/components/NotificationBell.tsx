import React, { useState, useRef, useEffect } from "react";
import { ReminderItem } from "../types";
import { Bell, Check, Clock, X } from "lucide-react";

interface NotificationBellProps {
  reminders: ReminderItem[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  reminders,
  onMarkAsRead,
  onClearAll,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = reminders.filter((r) => !r.isRead).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-all"
        title="การแจ้งเตือนและการเตือนความจำ"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span
            className="absolute top-1 right-1 flex items-center justify-center text-[10px] font-bold text-white rounded-full min-w-[16px] h-[16px] px-1 animate-pulse"
            style={{ background: "#B07070" }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
          style={{ background: "#131a13", border: "1px solid rgba(107,147,97,0.3)" }}
        >
          {/* Dropdown Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-emerald-900/30">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-emerald-400" />
              <h3 className="text-xs font-bold text-gray-200">การแจ้งเตือนและ Reminder</h3>
            </div>
            {reminders.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-[11px] text-gray-400 hover:text-emerald-400 transition-colors"
              >
                ลบทั้งหมด
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-72 overflow-y-auto divide-y divide-emerald-900/20">
            {reminders.length === 0 ? (
              <div className="py-8 text-center text-gray-500 text-xs">
                ไม่มีการแจ้งเตือนค้างอยู่ 🎉
              </div>
            ) : (
              reminders.map((r) => (
                <div
                  key={r.id}
                  className={`p-3 transition-colors flex items-start gap-3 ${
                    r.isRead ? "opacity-60 bg-transparent" : "bg-emerald-950/20"
                  }`}
                >
                  <button
                    onClick={() => onMarkAsRead(r.id)}
                    className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                      r.isRead
                        ? "bg-emerald-600/30 text-emerald-400"
                        : "border border-gray-500 hover:border-emerald-400 text-transparent"
                    }`}
                  >
                    <Check size={12} />
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className={`text-xs ${r.isRead ? "line-through text-gray-400" : "text-gray-200 font-medium"}`}>
                      {r.text}
                    </p>
                    {r.scheduledAt && (
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400">
                        <Clock size={10} />
                        <span>{new Date(r.scheduledAt).toLocaleString("th-TH")}</span>
                      </div>
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
