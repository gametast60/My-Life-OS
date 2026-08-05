import React, { useState } from "react";
import { UserSettings } from "../types";
import { RoomDatabase } from "../lib/db";
import {
  X,
  Bot,
  Download,
  Upload,
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Trash2,
  Clipboard,
  Shield,
  Key,
  BrainCircuit,
} from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSaveSettings: (s: UserSettings) => void;
  onReloadApp: () => void;
  onOpenManageAPI?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onReloadApp,
  onOpenManageAPI,
}) => {
  const [formData, setFormData] = useState<UserSettings>(settings);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExportBackup = async () => {
    setIsExporting(true);
    try {
      const blob = await RoomDatabase.exportBackupZip();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mylifeos_backup_${new Date().toISOString().slice(0, 10)}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("เกิดข้อผิดพลาดในการส่งออกข้อมูลสำรอง");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (confirm("การนำเข้าข้อมูลจะเขียนทับข้อมูลปัจจุบันของคุณ คุณแน่ใจหรือไม่?")) {
      const success = await RoomDatabase.importBackupZip(file);
      if (success) {
        alert("นำเข้าข้อมูลสำรองสำเร็จ!");
        onReloadApp();
        onClose();
      } else {
        alert("ไฟล์สำรองข้อมูลไม่ถูกต้อง");
      }
    }
  };

  const handleResetData = () => {
    if (confirm("⚠️ คำเตือน: ข้อมูลทั้งหมดในแอพจะถูกลบทิ้งอย่างถาวร! คุณแน่ใจหรือไม่?")) {
      RoomDatabase.clearAllData();
      onReloadApp();
      onClose();
    }
  };

  const handleSave = () => {
    onSaveSettings(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        className="w-full max-w-lg rounded-2xl flex flex-col overflow-hidden shadow-2xl border border-emerald-900/40"
        style={{ background: "#131a13", maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-900/30">
          <h2 className="font-bold text-base text-gray-200">ตั้งค่าระบบ (Settings)</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-lg">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section: User Profile */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">โปรไฟล์ผู้ใช้งาน</h3>
            <div>
              <label className="text-xs text-gray-400 block mb-1">ชื่อเรียกของคุณ</label>
              <input
                type="text"
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                className="w-full bg-black/40 border border-emerald-900/40 rounded-xl px-3.5 py-2 text-xs text-gray-200 outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          {/* Section: Manage API Keys Button */}
          <div className="space-y-2 pt-2 border-t border-emerald-900/20">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">การตั้งค่า AI Providers</h3>
            <p className="text-xs text-gray-400">
              จัดการ API Key ของ Gemini, Groq หรือ OpenRouter พร้อมระบบ Failover อัตโนมัติ
            </p>
            <button
              onClick={() => {
                onClose();
                if (onOpenManageAPI) onOpenManageAPI();
              }}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <Key size={16} />
              🔑 เปิดหน้าจัดการ AI Providers (Manage API)
            </button>
          </div>

          {/* Section: BIE Learning Cycle (Architect Fix 2 — Final) */}
          <div className="space-y-3 pt-2 border-t border-emerald-900/20">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <BrainCircuit size={13} />
              BIE — การเรียนรู้ระยะยาว
            </h3>
            <div className="flex items-center justify-between gap-3 bg-black/30 border border-emerald-900/30 rounded-xl px-3.5 py-3">
              <div className="pr-3">
                <p className="text-xs font-semibold text-gray-200">
                  เปิดใช้งาน BIE Learning Cycle
                </p>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                  {formData.bieEnabled !== false
                    ? "เปิด: BIE จะเรียนรู้จาก Journal และ Evidence ที่สะสมไว้โดยอัตโนมัติ (เมื่อมีข้อมูลเพียงพอ)"
                    : "ปิด: BIE จะไม่รันรอบการเรียนรู้อัตโนมัติ — Journal และข้อมูลอื่นยังบันทึกตามปกติ"}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={formData.bieEnabled !== false}
                onClick={() =>
                  setFormData({
                    ...formData,
                    bieEnabled: formData.bieEnabled === false ? true : false,
                  })
                }
                className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${
                  formData.bieEnabled !== false ? "bg-emerald-500" : "bg-gray-700"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    formData.bieEnabled !== false ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Section: Backup & Restore */}
          <div className="space-y-3 pt-2 border-t border-emerald-900/20">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">สำรองข้อมูล & กู้คืน</h3>
            <div className="flex gap-3">
              <button
                onClick={handleExportBackup}
                disabled={isExporting}
                className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold bg-emerald-900/30 hover:bg-emerald-800/30 border border-emerald-500/20 text-emerald-200 transition-all flex items-center justify-center gap-1.5"
              >
                <Download size={14} />
                ส่งออก Backup (ZIP)
              </button>

              <label className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold bg-emerald-900/30 hover:bg-emerald-800/30 border border-emerald-500/20 text-emerald-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                <Upload size={14} />
                นำเข้า Backup
                <input type="file" accept=".zip" onChange={handleImportBackup} className="hidden" />
              </label>
            </div>
            <p className="text-[11px] text-gray-500 text-end">ขนาดข้อมูลปัจจุบัน: {RoomDatabase.getStorageSize()}</p>
          </div>

          {/* Section: Danger Zone */}
          <div className="space-y-2 pt-2 border-t border-emerald-900/20">
            <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider">Danger Zone</h3>
            <button
              onClick={handleResetData}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-red-950/30 hover:bg-red-900/30 border border-red-500/30 text-red-400 transition-all flex items-center justify-center gap-1.5"
            >
              <Trash2 size={14} />
              ล้างข้อมูลทั้งหมดในเครื่อง (Reset Local Storage)
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-emerald-900/30 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:bg-white/5"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all"
            style={{ background: "linear-gradient(135deg, #4E7345, #6B9361)" }}
          >
            บันทึกการตั้งค่า
          </button>
        </div>
      </div>
    </div>
  );
};
