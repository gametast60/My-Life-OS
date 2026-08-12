import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export type MenuItemId = "home" | "manifest" | "vision" | "insights" | "notes" | "settings";

export interface AppMenuDrawerProps {
  activeItem?: MenuItemId;
  onNavigate: (itemId: MenuItemId) => void;
}

export const AppMenuDrawer: React.FC<AppMenuDrawerProps> = ({ activeItem, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Close drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const primaryItems: { id: MenuItemId; label: string; icon: string; description: string }[] = [
    {
      id: "home",
      label: "หน้าหลัก",
      icon: "ti ti-home",
      description: "กลับสู่ภาพรวมระบบและแดชบอร์ดหลัก",
    },
    {
      id: "manifest",
      label: "Manifest",
      icon: "ti ti-sparkles",
      description: "ตัวตนและชีวิตที่ฉันเลือก",
    },
    {
      id: "vision",
      label: "Vision Board",
      icon: "ti ti-eye",
      description: "ภาพชีวิตที่ฉันกำลังสร้าง",
    },
    {
      id: "notes",
      label: "Notes",
      icon: "ti ti-notes",
      description: "โน๊ตย่อยและบันทึกด่วน",
    },
  ];

  const footerItems: { id: MenuItemId; label: string; icon: string; description: string }[] = [
    {
      id: "settings",
      label: "ตั้งค่าระบบ",
      icon: "ti ti-settings",
      description: "ปรับแต่งโปรไฟล์และ AI Key",
    },
  ];

  const handleItemClick = (id: MenuItemId) => {
    setIsOpen(false);
    onNavigate(id);
  };

  const renderMenuItem = (item: { id: MenuItemId; label: string; icon: string; description: string }) => {
    const isActive = activeItem === item.id;
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => handleItemClick(item.id)}
        className={`w-full flex items-start gap-3.5 p-3 rounded-2xl border text-left transition-all cursor-pointer group ${
          isActive
            ? "bg-[#3F5C3A] text-white border-[#6B9361]/60 shadow-lg ring-1 ring-[#6B9361]/40"
            : "bg-[#131913]/60 hover:bg-[#182218] border-transparent hover:border-[#273727]"
        }`}
      >
        <div
          className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors shrink-0 ${
            isActive
              ? "bg-[#4E7345] text-white border-[#6B9361]/50 shadow-sm"
              : "bg-[#182218] group-hover:bg-[#4E7345]/20 border-[#273727] text-[#6B9361] group-hover:text-[#EBF1EA]"
          }`}
        >
          <i className={`${item.icon} text-lg`} aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <div
            className={`font-semibold text-xs transition-colors ${
              isActive ? "text-white font-bold" : "text-[#EBF1EA] group-hover:text-emerald-400"
            }`}
          >
            {item.label}
          </div>
          <div
            className={`text-[11px] truncate mt-0.5 ${
              isActive ? "text-[#EBF1EA]/80" : "text-[#869883]"
            }`}
          >
            {item.description}
          </div>
        </div>
        <i
          className={`text-xs transition-all self-center ${
            isActive
              ? "ti ti-check text-white font-bold"
              : "ti ti-chevron-right text-[#869883]/50 group-hover:text-[#EBF1EA] group-hover:translate-x-0.5"
          }`}
        />
      </button>
    );
  };

  return (
    <>
      {/* Trigger Button: Clean Hamburger ☰ Button only (No OS Badge) */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-xl text-[#869883] hover:text-[#EBF1EA] hover:bg-white/5 transition-all cursor-pointer flex items-center justify-center outline-none focus:ring-2 focus:ring-[#4E7345]"
        title="เปิดเมนูหลัก"
        aria-label="เปิดเมนูหลัก"
      >
        <i className="ti ti-menu-2 text-xl" aria-hidden="true" />
      </button>

      {/* Drawer Overlay Modal via React Portal to document.body */}
      {isOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 flex">
            {/* Full Screen Dark Backdrop Overlay */}
            <div
              className="fixed inset-0 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />

            {/* Side Drawer Panel (Fixed to full left edge, height 100vh, width 250px) */}
            <div className="relative w-[250px] max-w-[85vw] bg-[#0A0E0A] border-r border-[#1F2B1F] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-250">
              {/* Header inside drawer */}
              <div className="p-5 border-b border-[#1F2B1F] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#4E7345] to-[#6B9361] flex items-center justify-center text-white font-bold text-sm shadow-md shadow-[#4E7345]/20">
                    OS
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-[#EBF1EA]">ไลฟ์ OS</h2>
                    <p className="text-[11px] text-[#869883]">เมนูนำทางหลัก</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl text-[#869883] hover:text-[#EBF1EA] hover:bg-white/5 transition-all cursor-pointer flex items-center justify-center"
                  aria-label="ปิดเมนู"
                >
                  <i className="ti ti-x text-lg" aria-hidden="true" />
                </button>
              </div>

              {/* Primary Menu Items List (Flex 1) */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {primaryItems.map((item) => renderMenuItem(item))}
              </div>

              {/* Footer Section: Settings separated by a subtle top border line */}
              <div className="p-4 border-t border-[#1F2B1F]">
                {footerItems.map((item) => renderMenuItem(item))}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
