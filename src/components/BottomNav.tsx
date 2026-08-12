import React from "react";
import { LayoutDashboard, Brain, Bot, BookOpen, Layers } from "lucide-react";

export type NavTab = "home" | "pi" | "coach" | "journal" | "brain" | "journey" | "progress" | "vision";

interface BottomNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  /** Hide mobile nav when keyboard is open (desktop nav is never hidden) */
  hidden?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange, hidden = false }) => {
  const tabs = [
    { id: "home" as NavTab, label: "หน้าแรก", icon: LayoutDashboard },
    { id: "pi" as NavTab, label: "ความเข้าใจ", icon: Brain },
    { id: "coach" as NavTab, label: "โค้ช", icon: Bot },
    { id: "journal" as NavTab, label: "Journal", icon: BookOpen },
    { id: "brain" as NavTab, label: "คลังสมอง", icon: Layers },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation Shell */}
      <nav
        className={`fixed bottom-3 left-3 right-3 z-40 flex justify-around items-center px-2 py-2 bg-[#131913]/95 backdrop-blur-2xl border border-[#1F2B1F] rounded-3xl shadow-2xl md:hidden safe-area-bottom transition-transform duration-200 ${
          hidden ? "translate-y-[150%] opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
        }`}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center px-4 py-2 rounded-2xl transition-all duration-200 ${
                isActive
                  ? "bg-[#3E5C3A] text-white font-semibold shadow-md"
                  : "text-[#869883] hover:text-[#EBF1EA]"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium tracking-wide mt-1">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Desktop Floating Navigation Shell */}
      <div className="hidden md:flex fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#131913]/95 rounded-3xl px-6 py-2.5 items-center gap-4 border border-[#1F2B1F] shadow-2xl backdrop-blur-2xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center px-5 py-2 rounded-2xl transition-all duration-200 ${
                isActive
                  ? "text-white bg-[#3E5C3A] font-bold shadow-md scale-105"
                  : "text-[#869883] hover:text-[#EBF1EA] hover:scale-102"
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[11px] font-medium tracking-wider">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};
