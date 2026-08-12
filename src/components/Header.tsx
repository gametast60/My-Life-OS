import React from "react";
import { UserSettings, ReminderItem } from "../types";
import { Search, Key } from "lucide-react";
import { NotificationBell } from "./NotificationBell";
import { AppMenuDrawer, MenuItemId } from "./Navigation/AppMenuDrawer";

interface HeaderProps {
  settings: UserSettings;
  reminders?: ReminderItem[];
  activeMenuItem?: MenuItemId;
  onMarkReminderAsRead?: (id: string) => void;
  onNavigateToReminder?: (reminder: ReminderItem) => void;
  onOpenSettings: () => void;
  onOpenSearch: () => void;
  onOpenAIQuick?: () => void;
  onOpenManageAPI?: () => void;
  onOpenBieDiscovery?: () => void;
  onNavigate?: (itemId: MenuItemId) => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  reminders = [],
  activeMenuItem,
  onMarkReminderAsRead = () => {},
  onNavigateToReminder = () => {},
  onOpenSettings,
  onOpenSearch,
  onOpenAIQuick,
  onOpenManageAPI,
  onOpenBieDiscovery,
  onNavigate = () => {},
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-[#0A0E0A]/90 backdrop-blur-md border-b border-[#6B9361]/15 px-4 md:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* App Title / Menu Drawer replacing static logo */}
        <div className="flex items-center gap-3">
          <AppMenuDrawer activeItem={activeMenuItem} onNavigate={onNavigate} />
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
            onMarkAsRead={onMarkReminderAsRead}
            onNavigateToReminder={onNavigateToReminder}
          />
        </div>
      </div>
    </header>
  );
};
