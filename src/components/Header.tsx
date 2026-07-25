import React, { useState, useEffect } from "react";
import { UserSettings } from "../types";
import { Settings, Download } from "lucide-react";

interface HeaderProps {
  settings: UserSettings;
  onOpenSettings: () => void;
  onOpenSearch: () => void;
  onOpenAIQuick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onOpenSettings,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-[#0A0E0A]/95 backdrop-blur-xl border-b border-[#1A241A] px-4 md:px-8 py-3.5 flex justify-between items-center transition-colors">
      {/* Left: App Title */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="font-extrabold text-xl md:text-2xl text-[#EBF1EA] tracking-tight leading-none">
            ไลฟ์ OS
          </h1>
        </div>
      </div>

      {/* Right Actions: Install PWA & Settings Gear */}
      <div className="flex items-center gap-2 md:gap-3">
        {deferredPrompt && !isInstalled && (
          <button
            onClick={handleInstallPWA}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1F2E1E] hover:bg-[#2A3F29] text-[#6B9361] border border-[#375235] text-xs font-mono transition-all animate-pulse"
            title="ติดตั้งแอป ไลฟ์ OS บนเครื่อง"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ติดตั้ง App</span>
          </button>
        )}

        <button
          onClick={onOpenSettings}
          className="w-10 h-10 rounded-full bg-[#151D15] border border-[#222F22] text-[#869883] hover:text-[#EBF1EA] hover:bg-[#1E281E] flex items-center justify-center transition-all shadow-sm"
          title="ตั้งค่า"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
