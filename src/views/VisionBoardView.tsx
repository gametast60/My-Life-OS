import React, { useState, useRef } from "react";
import { VisionCategoryItem, SubVisionItem } from "../types";
import {
  Eye,
  Plus,
  Trash2,
  Edit2,
  Clock,
  Sparkles,
  X,
  Target,
  CheckCircle2,
} from "lucide-react";
import { ConfirmDialog } from "../components/ConfirmDialog";

const CATEGORIES = [
  "ทั้งหมด",
  "Health",
  "Career",
  "Business",
  "Finance",
  "Languages",
  "Family",
  "Travel",
  "Trading",
  "Dream House",
  "Dream Life",
] as const;

interface VisionBoardViewProps {
  visionItems: VisionCategoryItem[];
  onSaveVision: (items: VisionCategoryItem[]) => void;
}

interface BuddhistDateInputProps {
  value: string; // ISO YYYY-MM-DD (ค.ศ.)
  onChange: (val: string) => void;
}

const THAI_MONTHS_SHORT = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
];

export const BuddhistDateInput: React.FC<BuddhistDateInputProps> = ({ value, onChange }) => {
  const parseValue = (val: string) => {
    let y = new Date().getFullYear() + 543;
    let m = new Date().getMonth() + 1;
    let d = new Date().getDate();
    if (val) {
      const parts = val.split("-");
      if (parts.length === 3) {
        const yearCE = parseInt(parts[0], 10);
        const monthNum = parseInt(parts[1], 10);
        const dayNum = parseInt(parts[2], 10);
        if (!isNaN(yearCE)) y = yearCE + 543;
        if (!isNaN(monthNum)) m = monthNum;
        if (!isNaN(dayNum)) d = dayNum;
      }
    }
    return { y, m, d };
  };

  const initial = parseValue(value);
  const [day, setDay] = useState<number>(initial.d);
  const [month, setMonth] = useState<number>(initial.m);
  const [yearBE, setYearBE] = useState<number>(initial.y);

  React.useEffect(() => {
    const updated = parseValue(value);
    setDay(updated.d);
    setMonth(updated.m);
    setYearBE(updated.y);
  }, [value]);

  const updateDate = (newDay: number, newMonth: number, newYearBE: number) => {
    const yearCE = newYearBE - 543;
    if (isNaN(yearCE) || yearCE < 1900 || yearCE > 2200) return;
    const formatted = `${yearCE.toString().padStart(4, "0")}-${newMonth.toString().padStart(2, "0")}-${newDay.toString().padStart(2, "0")}`;
    onChange(formatted);
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      <select
        value={day}
        onChange={(e) => {
          const d = parseInt(e.target.value, 10);
          setDay(d);
          updateDate(d, month, yearBE);
        }}
        className="p-3 rounded-xl bg-[#101610] border border-[#1F2B1F] text-xs text-[#EBF1EA] focus:outline-none focus:border-[#4E7345]"
      >
        {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>

      <select
        value={month}
        onChange={(e) => {
          const m = parseInt(e.target.value, 10);
          setMonth(m);
          updateDate(day, m, yearBE);
        }}
        className="p-3 rounded-xl bg-[#101610] border border-[#1F2B1F] text-xs text-[#EBF1EA] focus:outline-none focus:border-[#4E7345]"
      >
        {THAI_MONTHS_SHORT.map((mName, idx) => (
          <option key={idx + 1} value={idx + 1}>
            {mName}
          </option>
        ))}
      </select>

      <input
        type="number"
        value={yearBE}
        placeholder="พ.ศ."
        onChange={(e) => {
          const y = parseInt(e.target.value, 10);
          setYearBE(y);
          if (!isNaN(y) && y >= 2400 && y <= 3100) {
            updateDate(day, month, y);
          }
        }}
        className="p-3 rounded-xl bg-[#101610] border border-[#1F2B1F] text-xs text-[#EBF1EA] focus:outline-none focus:border-[#4E7345]"
      />
    </div>
  );
};

/**
 * Normalizes string/Date input into a Date object set to local midnight (00:00:00.000).
 */
export function normalizeToMidnight(dateInput: string | Date | undefined): Date | null {
  if (!dateInput) return null;
  let d: Date;
  if (typeof dateInput === "string") {
    const parts = dateInput.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      d = new Date(year, month, day, 0, 0, 0, 0);
    } else {
      d = new Date(dateInput);
    }
  } else {
    d = new Date(dateInput);
  }
  if (isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

/**
 * Computes exact integer day difference and formatted countdown string.
 * Rules:
 * - daysRemaining > 365 -> "เหลืออีก X ปี Y เดือน"
 * - 30 < daysRemaining <= 365 -> "เหลืออีก X เดือน"
 * - 0 < daysRemaining <= 30 -> "เหลืออีก X วัน"
 * - daysRemaining === 0 -> "ถึงเป้าหมายแล้ว"
 * - daysRemaining < 0 -> "เลยกำหนดมาแล้ว X วัน"
 */
export function getDaysRemaining(targetDateStr?: string): { days: number | null; text: string } {
  const targetMidnight = normalizeToMidnight(targetDateStr);
  if (!targetMidnight) return { days: null, text: "ยังไม่กำหนดวันเป้าหมาย" };

  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  const diffMs = targetMidnight.getTime() - todayMidnight.getTime();
  const daysRemaining = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (daysRemaining === 0) {
    return { days: 0, text: "ถึงเป้าหมายแล้ว" };
  } else if (daysRemaining < 0) {
    return { days: daysRemaining, text: `เลยกำหนดมาแล้ว ${Math.abs(daysRemaining)} วัน` };
  } else if (daysRemaining > 365) {
    const years = Math.floor(daysRemaining / 365);
    const remDays = daysRemaining % 365;
    const months = Math.floor(remDays / 30);
    const monthText = months > 0 ? ` ${months} เดือน` : "";
    return { days: daysRemaining, text: `เหลืออีก ${years} ปี${monthText}` };
  } else if (daysRemaining > 30) {
    const months = Math.floor(daysRemaining / 30);
    return { days: daysRemaining, text: `เหลืออีก ${months} เดือน` };
  } else {
    return { days: daysRemaining, text: `เหลืออีก ${daysRemaining} วัน` };
  }
}

/**
 * Calculates elapsed time progress percentage clamped strictly between [0, 100].
 */
export function getTimeProgressPercent(startDateStr?: string, targetDateStr?: string): number | null {
  const startMidnight = normalizeToMidnight(startDateStr);
  const targetMidnight = normalizeToMidnight(targetDateStr);

  if (!startMidnight || !targetMidnight) return null;

  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  const totalMs = targetMidnight.getTime() - startMidnight.getTime();
  const elapsedMs = todayMidnight.getTime() - startMidnight.getTime();

  if (totalMs <= 0) {
    return todayMidnight.getTime() >= targetMidnight.getTime() ? 100 : 0;
  }

  const rawPct = (elapsedMs / totalMs) * 100;
  return Math.min(100, Math.max(0, Math.round(rawPct)));
}

function formatDateThai(dateStr?: string): string {
  const d = normalizeToMidnight(dateStr);
  if (!d) return "ไม่ระบุวัน";
  return d.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const VisionBoardView: React.FC<VisionBoardViewProps> = ({ visionItems, onSaveVision }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("ทั้งหมด");
  const [selectedVisionId, setSelectedVisionId] = useState<string | null>(null);

  // Main Vision Modal state
  const [isMainModalOpen, setIsMainModalOpen] = useState(false);
  const [editingMainVision, setEditingMainVision] = useState<VisionCategoryItem | null>(null);
  const [mainTitle, setMainTitle] = useState("");
  const [mainCategory, setMainCategory] = useState<VisionCategoryItem["category"]>("Dream House");
  const [mainImageUrl, setMainImageUrl] = useState("");
  const [mainNotes, setMainNotes] = useState("");
  const [mainTargetDate, setMainTargetDate] = useState("");
  const mainFileInputRef = useRef<HTMLInputElement>(null);

  // Sub-Vision Modal state
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [editingSubVision, setEditingSubVision] = useState<SubVisionItem | null>(null);
  const [subTitle, setSubTitle] = useState("");
  const [subImageUrl, setSubImageUrl] = useState("");
  const subFileInputRef = useRef<HTMLInputElement>(null);
  const [subNotes, setSubNotes] = useState("");
  const [subTargetDate, setSubTargetDate] = useState("");

  // Delete Confirm Dialog state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: "main" | "sub";
    mainId: string;
    subId?: string;
    title: string;
  }>({
    isOpen: false,
    type: "main",
    mainId: "",
    title: "",
  });

  // Lightbox state
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Expanded notes state
  const [expandedNotesId, setExpandedNotesId] = useState<string | null>(null);

  // Compress image before storing to avoid localStorage quota exceeded
  const compressImage = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        const MAX = 1200;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
          else { width = Math.round((width * MAX) / height); height = MAX; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("canvas not available")); return; }
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(objectUrl);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.onerror = reject;
      img.src = objectUrl;
    });

  const filteredItems = selectedCategory === "ทั้งหมด"
    ? visionItems
    : visionItems.filter((i) => i.category === selectedCategory);

  // Active Main Vision selection logic
  const activeMainVision = filteredItems.find((i) => i.id === selectedVisionId) || filteredItems[0] || null;

  // Handler: Open Main Vision Modal (Create / Edit)
  const handleOpenMainModal = (item?: VisionCategoryItem) => {
    if (item) {
      setEditingMainVision(item);
      setMainTitle(item.title);
      setMainCategory(item.category);
      setMainImageUrl(item.imageUrl);
      setMainNotes(item.notes);
      setMainTargetDate(item.targetDate || "");
    } else {
      setEditingMainVision(null);
      setMainTitle("");
      setMainCategory(selectedCategory !== "ทั้งหมด" ? (selectedCategory as any) : "Dream House");
      setMainImageUrl("");
      setMainNotes("");
      setMainTargetDate("");
    }
    setIsMainModalOpen(true);
  };

  // Handler: Save Main Vision
  const handleSaveMainVision = () => {
    if (!mainTitle.trim()) return;

    const todayStr = new Date().toISOString().split("T")[0];

    if (editingMainVision) {
      const updated = visionItems.map((item) => {
        if (item.id === editingMainVision.id) {
          return {
            ...item,
            title: mainTitle.trim(),
            category: mainCategory,
            imageUrl: mainImageUrl.trim() || item.imageUrl,
            notes: mainNotes.trim(),
            targetDate: mainTargetDate || undefined,
          };
        }
        return item;
      });
      onSaveVision(updated);
    } else {
      const newItem: VisionCategoryItem = {
        id: "v-" + Date.now(),
        category: mainCategory,
        title: mainTitle.trim(),
        imageUrl:
          mainImageUrl.trim() ||
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
        notes: mainNotes.trim() || "ภาพชีวิตที่ฉันเลือกสร้างและเดินหน้าไปสู่เป้าหมาย",
        progressPercent: 10,
        startDate: todayStr,
        targetDate: mainTargetDate || undefined,
        subVisions: [],
      };
      const updated = [newItem, ...visionItems];
      onSaveVision(updated);
      setSelectedVisionId(newItem.id);
    }

    setIsMainModalOpen(false);
  };

  // Handler: Delete Main Vision
  const handleConfirmDeleteMain = (mainId: string) => {
    const updated = visionItems.filter((i) => i.id !== mainId);
    onSaveVision(updated);
    if (selectedVisionId === mainId) {
      setSelectedVisionId(null);
    }
  };

  // Handler: Open Sub-Vision Modal (Create / Edit)
  const handleOpenSubModal = (subItem?: SubVisionItem) => {
    if (!activeMainVision) return;
    if (subItem) {
      setEditingSubVision(subItem);
      setSubTitle(subItem.title);
      setSubImageUrl(subItem.imageUrl);
      setSubNotes(subItem.notes);
      setSubTargetDate(subItem.targetDate || "");
    } else {
      setEditingSubVision(null);
      setSubTitle("");
      setSubImageUrl("");
      setSubNotes("");
      setSubTargetDate("");
    }
    setIsSubModalOpen(true);
  };

  // Handler: Save Sub-Vision
  const handleSaveSubVision = () => {
    if (!activeMainVision || !subTitle.trim()) return;

    const todayStr = new Date().toISOString().split("T")[0];
    const currentSubVisions = activeMainVision.subVisions || [];

    let updatedSubVisions: SubVisionItem[];

    if (editingSubVision) {
      updatedSubVisions = currentSubVisions.map((sv) => {
        if (sv.id === editingSubVision.id) {
          return {
            ...sv,
            title: subTitle.trim(),
            imageUrl: subImageUrl.trim() || sv.imageUrl,
            notes: subNotes.trim(),
            targetDate: subTargetDate || undefined,
          };
        }
        return sv;
      });
    } else {
      const newSub: SubVisionItem = {
        id: "sv-" + Date.now(),
        title: subTitle.trim(),
        imageUrl:
          subImageUrl.trim() ||
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
        notes: subNotes.trim() || "หมุดหมายย่อยเพื่อก้าวไปสู่ภาพนิมิตหลัก",
        startDate: todayStr,
        targetDate: subTargetDate || undefined,
      };
      updatedSubVisions = [...currentSubVisions, newSub];
    }

    const updated = visionItems.map((item) => {
      if (item.id === activeMainVision.id) {
        return {
          ...item,
          subVisions: updatedSubVisions,
        };
      }
      return item;
    });

    onSaveVision(updated);
    setIsSubModalOpen(false);
  };

  // Handler: Delete Sub-Vision
  const handleConfirmDeleteSub = (mainId: string, subId: string) => {
    const updated = visionItems.map((item) => {
      if (item.id === mainId) {
        return {
          ...item,
          subVisions: (item.subVisions || []).filter((sv) => sv.id !== subId),
        };
      }
      return item;
    });
    onSaveVision(updated);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#1F2B1F] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-[#4E7345]/20 border border-[#6B9361]/30 text-[#6B9361]">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#EBF1EA]">วิสัยทัศน์ชีวิต (Vision Board)</h1>
              <p className="text-xs md:text-sm text-[#869883] mt-0.5">ภาพชีวิตที่ฉันกำลังสร้าง — See it → Feel it → Know the deadline → Take action</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => handleOpenMainModal()}
          className="px-5 py-3 rounded-2xl bg-[#3F5C3A] hover:bg-[#4E7345] text-white font-semibold text-xs md:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#3F5C3A]/20 transition-all cursor-pointer group shrink-0"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
          <span>เพิ่มภาพชีวิตใหม่</span>
        </button>
      </div>

      {/* ── Category Filters & Main Vision Selector ───────────────── */}
      <div className="space-y-4">
        {/* Categories Carousel */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setSelectedVisionId(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#3F5C3A] text-white font-semibold shadow-md border border-[#6B9361]/40"
                    : "bg-[#131913] text-[#869883] hover:text-[#EBF1EA] hover:bg-[#182018] border border-[#1F2B1F]"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Main Vision Items Selector Cards (If multiple exist in selected category) */}
        {filteredItems.length > 1 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
            {filteredItems.map((item) => {
              const isSelected = activeMainVision?.id === item.id;
              const countdown = getDaysRemaining(item.targetDate);
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedVisionId(item.id)}
                  className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between relative overflow-hidden group ${
                    isSelected
                      ? "bg-[#182018] border-[#4E7345] ring-2 ring-[#4E7345]/30 shadow-lg"
                      : "bg-[#131913]/80 hover:bg-[#182018] border-[#1F2B1F] hover:border-[#273727]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-black/60 text-[#869883]">
                      {item.category}
                    </span>
                    {item.targetDate && (
                      <span className="text-[10px] font-mono text-[#6B9361]">{countdown.text}</span>
                    )}
                  </div>
                  <h4 className="font-bold text-xs text-[#EBF1EA] truncate">{item.title}</h4>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Empty State ────────────────────────────────────────────── */}
      {filteredItems.length === 0 && (
        <div className="bg-[#131913] rounded-3xl border border-[#1F2B1F] p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#182018] border border-[#223022] flex items-center justify-center mx-auto text-[#869883]">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#EBF1EA]">ยังไม่มีภาพชีวิตในหมวดนี้</h3>
            <p className="text-xs text-[#869883] mt-1">เริ่มต้นสร้างมโนภาพเป้าหมายที่คุณต้องการมุ่งไปให้ถึง</p>
          </div>
          <button
            onClick={() => handleOpenMainModal()}
            className="px-5 py-2.5 rounded-xl bg-[#3F5C3A] hover:bg-[#4E7345] text-white text-xs font-semibold inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>สร้างภาพชีวิตแรก</span>
          </button>
        </div>
      )}

      {/* ── Main Vision Active Content ─────────────────────────────── */}
      {activeMainVision && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Main Hero Card */}
          <div className="bg-[#131913] rounded-3xl border border-[#1F2B1F] overflow-hidden shadow-2xl relative">
            {/* Hero Image */}
            <div className="relative h-64 md:h-96 w-full overflow-hidden group">
              <img
                src={activeMainVision.imageUrl}
                alt={activeMainVision.title}
                onClick={() => setLightboxUrl(activeMainVision.imageUrl)}
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 cursor-zoom-in"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#131913] via-[#131913]/50 to-transparent pointer-events-none" />

              {/* Top Action Overlay Badges */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                <span className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-[#EBF1EA] text-xs font-mono font-semibold border border-white/10">
                  {activeMainVision.category}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenMainModal(activeMainVision)}
                    className="p-2 rounded-xl bg-black/70 hover:bg-black/90 text-[#EBF1EA] backdrop-blur-md border border-white/10 transition-colors"
                    title="แก้ไขภาพชีวิตหลัก"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      setDeleteConfirm({
                        isOpen: true,
                        type: "main",
                        mainId: activeMainVision.id,
                        title: activeMainVision.title,
                      })
                    }
                    className="p-2 rounded-xl bg-black/70 hover:bg-rose-900/80 text-rose-300 backdrop-blur-md border border-rose-500/20 transition-colors"
                    title="ลบภาพชีวิตหลัก"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Title & Short Statement inside Hero Image bottom */}
              <div className="absolute bottom-4 left-4 right-4 md:left-8 md:right-8 z-10 space-y-1.5">
                <h2 className="text-2xl md:text-4xl font-extrabold text-[#EBF1EA] drop-shadow-md tracking-tight">
                  {activeMainVision.title}
                </h2>
                {activeMainVision.notes && (
                  <div>
                    <p className={`text-sm md:text-base text-[#EBF1EA]/90 max-w-2xl font-light drop-shadow ${
                      expandedNotesId === activeMainVision.id ? "" : "line-clamp-2"
                    }`}>
                      "{activeMainVision.notes}"
                    </p>
                    {activeMainVision.notes.length > 80 && (
                      <button
                        onClick={() => setExpandedNotesId(
                          expandedNotesId === activeMainVision.id ? null : activeMainVision.id
                        )}
                        className="mt-1.5 px-2.5 py-0.5 rounded-full bg-white hover:bg-gray-100 text-black text-[10px] font-bold border border-gray-300 shadow-sm transition-all inline-flex items-center gap-1 cursor-pointer"
                      >
                        {expandedNotesId === activeMainVision.id ? "− ย่อลง" : "+ เพิ่มเติม..."}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Hero Information Details (Countdown & Time Progress) */}
            <div className="p-6 md:p-8 space-y-6">
              {/* Countdown & Target Date Box */}
              {activeMainVision.targetDate ? (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#182018] to-[#131913] border border-[#273727] shadow-inner flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#6B9361] text-xs font-mono font-semibold uppercase">
                      <Clock className="w-4 h-4 animate-pulse" />
                      <span>COUNTDOWN TO VISION</span>
                    </div>
                    <span className="text-xs text-[#869883] font-mono">
                      เป้าหมาย: {formatDateThai(activeMainVision.targetDate)}
                    </span>
                  </div>

                  <div className="text-2xl md:text-3xl font-black text-[#EBF1EA] tracking-wide">
                    {getDaysRemaining(activeMainVision.targetDate).text}
                  </div>

                  {/* Time Progress Bar */}
                  {getTimeProgressPercent(activeMainVision.startDate, activeMainVision.targetDate) !== null && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-[11px] font-mono text-[#869883]">
                        <span>ระยะเวลาสัดส่วนที่ผ่านไป</span>
                        <span className="text-[#6B9361] font-bold">
                          {getTimeProgressPercent(activeMainVision.startDate, activeMainVision.targetDate)}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-[#1F2B1F] overflow-hidden p-0.5 border border-[#273727]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#3F5C3A] to-[#6B9361] transition-all duration-500"
                          style={{
                            width: `${getTimeProgressPercent(
                              activeMainVision.startDate,
                              activeMainVision.targetDate
                            )}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-[#869883]/70 font-mono">
                        <span>เริ่ม: {formatDateThai(activeMainVision.startDate)}</span>
                        <span>สิ้นสุด: {formatDateThai(activeMainVision.targetDate)}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#182018]/40 border border-dashed border-[#1F2B1F] flex items-center justify-between text-xs text-[#869883]">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#6B9361]" />
                    <span>ยังไม่ได้กำหนดวันเป้าหมายสำหรับภาพชีวิตนี้</span>
                  </div>
                  <button
                    onClick={() => handleOpenMainModal(activeMainVision)}
                    className="text-[#6B9361] hover:underline font-medium"
                  >
                    ตั้งวันเป้าหมาย
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── Sub-Visions / Milestones Section ──────────────────────── */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between border-b border-[#1F2B1F] pb-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[#6B9361]" />
                <h3 className="text-lg font-bold text-[#EBF1EA]">MILESTONES (เป้าหมายย่อย)</h3>
                <span className="px-2 py-0.5 rounded-full bg-[#182018] text-[#869883] text-xs font-mono">
                  {(activeMainVision.subVisions || []).length}
                </span>
              </div>

              <button
                onClick={() => handleOpenSubModal()}
                className="px-3.5 py-1.5 rounded-xl bg-[#182018] hover:bg-[#223022] text-[#EBF1EA] border border-[#273727] text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#6B9361]" />
                <span>เพิ่มหมุดหมายย่อย</span>
              </button>
            </div>

            {/* Sub-Visions Grid */}
            {(!activeMainVision.subVisions || activeMainVision.subVisions.length === 0) ? (
              <div className="p-8 rounded-2xl bg-[#131913]/60 border border-dashed border-[#1F2B1F] text-center space-y-2">
                <p className="text-xs text-[#869883]">ยังไม่มีหมุดหมายย่อยสำหรับภาพชีวิตนี้</p>
                <button
                  onClick={() => handleOpenSubModal()}
                  className="text-xs text-[#6B9361] hover:underline font-semibold"
                >
                  + เพิ่มหมุดหมายแรกของภาพชีวิตนี้
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeMainVision.subVisions.map((sub) => {
                  const subCountdown = getDaysRemaining(sub.targetDate);
                  const subProgress = getTimeProgressPercent(sub.startDate, sub.targetDate);

                  return (
                    <div
                      key={sub.id}
                      className="bg-[#131913] rounded-2xl border border-[#1F2B1F] overflow-hidden hover:border-[#273727] transition-all flex flex-col justify-between space-y-3 p-4 relative group"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-20 h-20 rounded-xl overflow-hidden shrink-0 relative bg-[#182018] cursor-zoom-in"
                          onClick={() => setLightboxUrl(sub.imageUrl)}
                          title="กดเพื่อดูรูปขนาดเต็ม"
                        >
                          <img src={sub.imageUrl} alt={sub.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h4 className="font-bold text-sm text-[#EBF1EA] truncate pr-2">{sub.title}</h4>
                            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleOpenSubModal(sub)}
                                className="p-1 text-[#869883] hover:text-[#EBF1EA]"
                                title="แก้ไขหมุดหมายย่อย"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteConfirm({
                                    isOpen: true,
                                    type: "sub",
                                    mainId: activeMainVision.id,
                                    subId: sub.id,
                                    title: sub.title,
                                  })
                                }
                                className="p-1 text-[#869883] hover:text-rose-400"
                                title="ลบหมุดหมายย่อย"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          {sub.notes && (
                            <div>
                              <p className={`text-xs text-[#869883] mt-1 ${expandedNotesId === sub.id ? "" : "line-clamp-2"}`}>
                                {sub.notes}
                              </p>
                              {sub.notes.length > 50 && (
                                <button
                                  onClick={() => setExpandedNotesId(expandedNotesId === sub.id ? null : sub.id)}
                                  className="mt-1 px-2.5 py-0.5 rounded-full bg-white hover:bg-gray-100 text-black text-[10px] font-bold border border-gray-300 shadow-sm transition-all inline-flex items-center gap-1 cursor-pointer"
                                >
                                  {expandedNotesId === sub.id ? "− ย่อลง" : "+ เพิ่มเติม..."}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Sub-Vision Independent Countdown & Time Progress */}
                      {sub.targetDate ? (
                        <div className="pt-2 border-t border-[#1F2B1F] space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className="text-[#6B9361] font-semibold">{subCountdown.text}</span>
                            <span className="text-[#869883]">{formatDateThai(sub.targetDate)}</span>
                          </div>

                          {subProgress !== null && (
                            <div className="w-full h-1.5 rounded-full bg-[#1F2B1F] overflow-hidden">
                              <div
                                className="h-full bg-[#4E7345] rounded-full transition-all"
                                style={{ width: `${subProgress}%` }}
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="pt-2 border-t border-[#1F2B1F] text-[10px] text-[#869883] font-mono">
                          ยังไม่ได้กำหนดวันเป้าหมาย
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Main Vision Modal (Create / Edit) ───────────────────────── */}
      {isMainModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-[#131913] rounded-3xl p-6 border border-[#1F2B1F] shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-[#1F2B1F] pb-4">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#6B9361]" />
                <h3 className="text-lg font-bold text-[#EBF1EA]">
                  {editingMainVision ? "แก้ไขภาพชีวิตหลัก" : "สร้างภาพชีวิตใหม่"}
                </h3>
              </div>
              <button
                onClick={() => setIsMainModalOpen(false)}
                className="p-1.5 rounded-full text-[#869883] hover:text-[#EBF1EA] hover:bg-[#182018]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#869883] mb-1">ชื่อภาพชีวิต (Vision Title)</label>
                <input
                  type="text"
                  value={mainTitle}
                  onChange={(e) => setMainTitle(e.target.value)}
                  placeholder="เช่น Financial Freedom, บ้านเดี่ยวทรงมินิมอล"
                  className="w-full p-3 rounded-xl bg-[#101610] border border-[#1F2B1F] text-xs text-[#EBF1EA] focus:outline-none focus:border-[#4E7345]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-[#869883] mb-1">หมวดหมู่</label>
                  <select
                    value={mainCategory}
                    onChange={(e) => setMainCategory(e.target.value as any)}
                    className="w-full p-3 rounded-xl bg-[#101610] border border-[#1F2B1F] text-xs text-[#EBF1EA] focus:outline-none focus:border-[#4E7345]"
                  >
                    {CATEGORIES.filter((c) => c !== "ทั้งหมด").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

              <div>
                <label className="block text-xs font-mono text-[#869883] mb-1">วันเป้าหมาย <span className="text-[#4E7345">(พ.ศ.)</span></label>
                <BuddhistDateInput value={mainTargetDate} onChange={setMainTargetDate} />
              </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#869883] mb-1">รูปภาพ Hero Image</label>
                <input
                  ref={mainFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) setMainImageUrl(await compressImage(file));
                  }}
                />
                <button
                  type="button"
                  onClick={() => mainFileInputRef.current?.click()}
                  className="w-full p-3 rounded-xl bg-[#101610] border border-dashed border-[#1F2B1F] hover:border-[#4E7345] text-xs text-[#869883] hover:text-[#EBF1EA] flex items-center gap-2 transition-all"
                >
                  {mainImageUrl ? (
                    <>
                      <img src={mainImageUrl} className="w-8 h-8 rounded-lg object-cover shrink-0" alt="preview" />
                      <span className="truncate text-[#6B9361]">เลือกรูปแล้ว — คลิกเพื่อเปลี่ยน</span>
                    </>
                  ) : (
                    <span>📁 เลือกรูปจากเครื่อง</span>
                  )}
                </button>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#869883] mb-1">ข้อความมโนภาพสั้นๆ (Short Statement)</label>
                <textarea
                  rows={2}
                  value={mainNotes}
                  onChange={(e) => setMainNotes(e.target.value)}
                  placeholder="เช่น บ้านที่ฉันภูมิใจที่จะกลับมาในทุกวัน"
                  className="w-full p-3 rounded-xl bg-[#101610] border border-[#1F2B1F] text-xs text-[#EBF1EA] focus:outline-none focus:border-[#4E7345]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#1F2B1F]">
              <button
                onClick={() => setIsMainModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-[#182018] text-[#869883] hover:text-[#EBF1EA] text-xs font-semibold"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveMainVision}
                className="px-5 py-2.5 rounded-xl bg-[#3F5C3A] hover:bg-[#4E7345] text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>บันทึกภาพชีวิต</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Sub-Vision Modal (Create / Edit) ────────────────────────── */}
      {isSubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#131913] rounded-3xl p-6 border border-[#1F2B1F] shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-[#1F2B1F] pb-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[#6B9361]" />
                <h3 className="text-lg font-bold text-[#EBF1EA]">
                  {editingSubVision ? "แก้ไขหมุดหมายย่อย" : "เพิ่มหมุดหมายย่อย"}
                </h3>
              </div>
              <button
                onClick={() => setIsSubModalOpen(false)}
                className="p-1.5 rounded-full text-[#869883] hover:text-[#EBF1EA] hover:bg-[#182018]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#869883] mb-1">ชื่อหมุดหมายย่อย (Sub-Vision)</label>
                <input
                  type="text"
                  value={subTitle}
                  onChange={(e) => setSubTitle(e.target.value)}
                  placeholder="เช่น พอร์ต 10M จาก Trading"
                  className="w-full p-3 rounded-xl bg-[#101610] border border-[#1F2B1F] text-xs text-[#EBF1EA] focus:outline-none focus:border-[#4E7345]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#869883] mb-1">วันเป้าหมายหมุดหมายย่อย <span className="text-[#4E7345]">(พ.ศ.)</span></label>
                <BuddhistDateInput value={subTargetDate} onChange={setSubTargetDate} />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#869883] mb-1">รูปภาพประกอบ</label>
                <input
                  ref={subFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) setSubImageUrl(await compressImage(file));
                  }}
                />
                <button
                  type="button"
                  onClick={() => subFileInputRef.current?.click()}
                  className="w-full p-3 rounded-xl bg-[#101610] border border-dashed border-[#1F2B1F] hover:border-[#4E7345] text-xs text-[#869883] hover:text-[#EBF1EA] flex items-center gap-2 transition-all"
                >
                  {subImageUrl ? (
                    <>
                      <img src={subImageUrl} className="w-8 h-8 rounded-lg object-cover shrink-0" alt="preview" />
                      <span className="truncate text-[#6B9361]">เลือกรูปแล้ว — คลิกเพื่อเปลี่ยน</span>
                    </>
                  ) : (
                    <span>📁 เลือกรูปจากเครื่อง</span>
                  )}
                </button>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#869883] mb-1">คำอธิบายย่อย</label>
                <textarea
                  rows={2}
                  value={subNotes}
                  onChange={(e) => setSubNotes(e.target.value)}
                  placeholder="รายละเอียดสั้นๆ ของหมุดหมายนี้"
                  className="w-full p-3 rounded-xl bg-[#101610] border border-[#1F2B1F] text-xs text-[#EBF1EA] focus:outline-none focus:border-[#4E7345]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#1F2B1F]">
              <button
                onClick={() => setIsSubModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-[#182018] text-[#869883] hover:text-[#EBF1EA] text-xs font-semibold"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveSubVision}
                className="px-5 py-2.5 rounded-xl bg-[#3F5C3A] hover:bg-[#4E7345] text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>บันทึกหมุดหมายย่อย</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Delete Dialog ──────────────────────────────────── */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title={`ยืนยันการลบ ${deleteConfirm.type === "main" ? "ภาพชีวิตหลัก" : "หมุดหมายย่อย"}`}
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบ "${deleteConfirm.title}"?`}
        confirmText="ลบข้อมูล"
        cancelText="ยกเลิก"
        variant="danger"
        onConfirm={() => {
          if (deleteConfirm.type === "main") {
            handleConfirmDeleteMain(deleteConfirm.mainId);
          } else if (deleteConfirm.type === "sub" && deleteConfirm.subId) {
            handleConfirmDeleteSub(deleteConfirm.mainId, deleteConfirm.subId);
          }
          setDeleteConfirm({ isOpen: false, type: "main", mainId: "", title: "" });
        }}
        onCancel={() => setDeleteConfirm({ isOpen: false, type: "main", mainId: "", title: "" })}
      />

      {/* ── Lightbox ──────────────────────────────────────────────────── */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/95 animate-in fade-in duration-200"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="ปิด"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxUrl}
            alt="ภาพขนาดเต็ม"
            className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>

  );
};
