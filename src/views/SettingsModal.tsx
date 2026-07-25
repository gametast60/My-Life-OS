import React, { useState } from "react";
import { UserSettings } from "../types";
import { testAIConnection } from "../lib/aiService";
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
} from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSaveSettings: (s: UserSettings) => void;
  onReloadApp: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onReloadApp,
}) => {
  const [formData, setFormData] = useState<UserSettings>(settings);
  const [testStatus, setTestStatus] = useState<{ success?: boolean; message?: string }>({});
  const [isTesting, setIsTesting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestStatus({});
    const result = await testAIConnection(formData.aiApiKey, formData.aiModel);
    setTestStatus(result);
    setIsTesting(false);
  };

  const handleExportBackup = async () => {
    setIsExporting(true);
    try {
      const blob = await RoomDatabase.exportBackupZip();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "backup.zip";
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

    if (confirm("การนำเข้าจะทับข้อมูลปัจจุบัน ต้องการดำเนินการต่อหรือไม่?")) {
      const success = await RoomDatabase.importBackupZip(file);
      if (success) {
        alert("นำเข้าข้อมูลสำรองเรียบร้อยแล้ว!");
        onReloadApp();
      } else {
        alert("ไฟล์ข้อมูลสำรองไม่ถูกต้อง หรือเสียหาย");
      }
    }
  };

  const handleSave = () => {
    onSaveSettings(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#131913] rounded-3xl p-6 border border-[#1F2B1F] shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#1F2B1F] pb-4">
          <div>
            <h3 className="text-xl font-bold text-[#EBF1EA]">ตั้งค่า (Settings)</h3>
            <p className="text-xs text-[#869883]">ปรับแต่ง AI, ภาษา, ความปลอดภัย และสำรองข้อมูล</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#869883] hover:text-[#EBF1EA] hover:bg-[#182018]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile */}
        <div className="p-4 rounded-2xl bg-[#182018] border border-[#223022] space-y-3">
          <h4 className="text-xs font-mono text-[#6B9361] uppercase font-bold">ข้อมูลผู้ใช้งาน</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#869883]">ชื่อผู้ใช้</label>
              <input
                type="text"
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl bg-[#101610] border border-[#1F2B1F] text-xs text-[#EBF1EA]"
              />
            </div>
            <div>
              <label className="text-xs text-[#869883]">อีเมล</label>
              <input
                type="email"
                value={formData.userEmail}
                onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl bg-[#101610] border border-[#1F2B1F] text-xs text-[#EBF1EA]"
              />
            </div>
          </div>
        </div>

        {/* AI Provider Settings */}
        <div className="p-4 rounded-2xl bg-[#182218] border border-[#273727] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-[#6B9361] font-bold uppercase">
              <Bot className="w-4 h-4" />
              <span>การจัดการ AI (AI Configuration)</span>
            </div>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-[#6B9361] flex items-center gap-1 hover:underline font-mono bg-[#233523] px-2.5 py-1 rounded-lg border border-[#2E452E]"
            >
              <span>ขอรับ API Key ฟรี (Google AI Studio)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="p-3 rounded-xl bg-[#101610] border border-[#1F2B1F] text-xs text-[#869883] space-y-1">
            <div className="font-semibold text-[#6B9361]">💡 วิธีตั้งค่าใช้งาน AI Life Coach:</div>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-[#869883]">
              <li>คลิกปุ่ม <span className="text-[#6B9361] font-semibold">"ขอรับ API Key ฟรี"</span> ด้านบนเพื่อไปยัง Google AI Studio</li>
              <li>กดสร้าง API Key แล้วก๊อบปี้รหัสมาวางลงในช่องด้านล่าง</li>
              <li>ข้อมูล API Key จะถูกบันทึกในเครื่องของคุณอย่างปลอดภัย ไม่มีการส่งต่อไปยังเซิร์ฟเวอร์ภายนอก</li>
            </ol>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#869883]">AI Provider</label>
              <select
                value={formData.aiProvider}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    aiProvider: e.target.value as any,
                  })
                }
                className="w-full mt-1 p-2.5 rounded-xl bg-[#101610] border border-[#1F2B1F] text-xs text-[#EBF1EA]"
              >
                <option value="Gemini">Google AI Studio (Gemini)</option>
                <option value="Custom">Custom Endpoint</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-[#869883]">Model</label>
              <select
                value={formData.aiModel || "gemini-2.5-flash"}
                onChange={(e) => setFormData({ ...formData, aiModel: e.target.value })}
                className="w-full mt-1 p-2.5 rounded-xl bg-[#101610] border border-[#1F2B1F] text-xs text-[#EBF1EA]"
              >
                <option value="gemini-2.5-flash">gemini-2.5-flash (แนะนำ)</option>
                <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                <option value="gemini-2.0-flash">gemini-2.0-flash</option>
                <option value="gemini-3.6-flash">gemini-3.6-flash</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-[#869883] flex items-center justify-between">
              <span>Google AI Studio API Key (จัดเก็บปลอดภัยในเครื่อง)</span>
              <span className="text-[10px] text-[#6B9361] font-mono">Local Storage Only</span>
            </label>
            <input
              type="password"
              value={formData.aiApiKey || ""}
              onChange={(e) => setFormData({ ...formData, aiApiKey: e.target.value })}
              placeholder="วาง API Key ที่นี่ (ขึ้นต้นด้วย AIzaSy...)"
              className="w-full mt-1 p-2.5 rounded-xl bg-[#101610] border border-[#1F2B1F] text-xs text-[#EBF1EA] font-mono"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-4 py-2 rounded-xl bg-[#233523] text-[#6B9361] border border-[#2E452E] text-xs font-mono flex items-center gap-1.5 hover:bg-[#2E452E] disabled:opacity-50"
            >
              {isTesting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>ทดสอบการเชื่อมต่อ (Test Connection)</span>
            </button>

            {testStatus.message && (
              <span
                className={`text-xs flex items-center gap-1 font-mono ${
                  testStatus.success ? "text-[#6B9361]" : "text-rose-400"
                }`}
              >
                {testStatus.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {testStatus.message}
              </span>
            )}
          </div>
        </div>

        {/* Backup Export / Import */}
        <div className="p-4 rounded-2xl bg-[#182018] border border-[#223022] space-y-3">
          <h4 className="text-xs font-mono text-[#6B9361] uppercase font-bold flex items-center gap-2">
            <Database className="w-4 h-4" />
            <span>การจัดการข้อมูลสำรอง (Backup & Restore)</span>
          </h4>
          <p className="text-xs text-[#869883]">
            ข้อมูลทั้งหมดจัดเก็บใน Room Database ท้องถิ่น คุณสามารถส่งออกและนำเข้าเป็นไฟล์ backup.zip ได้ทุกเมื่อ
          </p>

          <div className="flex flex-wrap gap-3 pt-1">
            <button
              onClick={handleExportBackup}
              disabled={isExporting}
              className="px-4 py-2 rounded-xl bg-[#3F5C3A] text-white text-xs font-mono font-bold flex items-center gap-2 hover:bg-[#4E7345]"
            >
              <Download className="w-4 h-4" />
              <span>สำรองข้อมูล (Export backup.zip)</span>
            </button>

            <label className="px-4 py-2 rounded-xl bg-[#182218] hover:bg-[#233523] text-[#EBF1EA] border border-[#273727] text-xs font-mono font-bold flex items-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4 text-[#6B9361]" />
              <span>นำเข้าข้อมูล (Import backup.zip)</span>
              <input type="file" accept=".zip" onChange={handleImportBackup} className="hidden" />
            </label>

            <button
              onClick={() => {
                if (confirm("คุณต้องการล้างข้อมูลจำลองทั้งหมดและเริ่มใช้งานจริงหรือไม่?")) {
                  RoomDatabase.clearAllData();
                  onReloadApp();
                  alert("ล้างข้อมูลเรียบร้อยแล้ว แอปพร้อมสำหรับการใช้งานจริงของคุณ!");
                }
              }}
              className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-mono font-bold flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>ล้างข้อมูลจำลองทั้งหมด (Reset)</span>
            </button>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[#1F2B1F]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#182018] hover:bg-[#223022] text-xs font-mono text-[#EBF1EA]"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-xl bg-[#3F5C3A] hover:bg-[#4E7345] text-white text-xs font-mono font-bold"
          >
            บันทึกการตั้งค่า
          </button>
        </div>
      </div>
    </div>
  );
};
