import React from "react";
import { UserSettings, ReminderItem } from "../types";
import { Search, Settings, Key } from "lucide-react";
import { NotificationBell } from "./NotificationBell";

interface HeaderProps {
  settings: UserSettings;
  reminders?: ReminderItem[];
  onAddReminder?: (text: string, dueDate?: string) => void;
  onEditReminder?: (id: string, newText: string, dueDate?: string) => void;
  onDeleteReminder?: (id: string) => void;
  onCompleteReminder?: (item: ReminderItem) => void;
  onClearAllReminders?: () => void;
  onOpenSettings: () => void;
  onOpenSearch: () => void;
  onOpenAIQuick?: () => void;
  onOpenManageAPI?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  reminders = [],
  onAddReminder = () => {},
  onEditReminder = () => {},
  onDeleteReminder = () => {},
  onCompleteReminder = () => {},
  onClearAllReminders = () => {},
  onOpenSettings,
  onOpenSearch,
  onOpenAIQuick,
  onOpenManageAPI,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-[#0A0E0A]/90 backdrop-blur-md border-b border-[#6B9361]/15 px-4 md:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* App Title / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#4E7345] to-[#6B9361] flex items-center justify-center text-white font-bold text-sm shadow-md shadow-[#4E7345]/20">
            OS
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSearch}
            className="p-2 rounded-xl text-[#869883] hover:text-[#EBF1EA] hover:bg-white/5 transition-all"
            title="ค้นหา"
          >
            <Search size={18} />
          </button>

          {onOpenManageAPI && (
            <button
              onClick={onOpenManageAPI}
              className="p-2 rounded-xl text-[#869883] hover:text-emerald-400 hover:bg-white/5 transition-all flex items-center gap-1 text-xs font-semibold"
              title="จัดการ AI Providers"
            >
              <Key size={16} />
              <span className="hidden sm:inline">Manage AI</span>
            </button>
          )}

          <NotificationBell
            reminders={reminders}
            onAddReminder={onAddReminder}
            onEditReminder={onEditReminder}
            onDeleteReminder={onDeleteReminder}
            onCompleteReminder={onCompleteReminder}
            onClearAllReminders={onClearAllReminders}
          />

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-[#869883] hover:text-[#EBF1EA] hover:bg-white/5 transition-all"
            title="ตั้งค่า"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};
