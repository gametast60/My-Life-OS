import React, { useState } from "react";
import { VisionCategoryItem } from "../types";
import { X, Eye, Plus, Trash2 } from "lucide-react";

interface VisionBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  visionItems: VisionCategoryItem[];
  onSaveVision: (items: VisionCategoryItem[]) => void;
}

export const VisionBoardModal: React.FC<VisionBoardModalProps> = ({
  isOpen,
  onClose,
  visionItems,
  onSaveVision,
}) => {
  const [items, setItems] = useState<VisionCategoryItem[]>(visionItems);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Dream House");
  const [newImageUrl, setNewImageUrl] = useState("");

  if (!isOpen) return null;

  const handleAddItem = () => {
    if (!newTitle.trim()) return;
    const newItem: VisionCategoryItem = {
      id: "v-" + Date.now(),
      category: newCategory as any,
      title: newTitle.trim(),
      imageUrl:
        newImageUrl.trim() ||
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
      notes: "วิสัยทัศน์ที่ชัดเจนนำมาซึ่งแรงขับเคลื่อนในการลงมือทำ",
      progressPercent: 10,
    };
    const updated = [newItem, ...items];
    setItems(updated);
    onSaveVision(updated);
    setNewTitle("");
    setNewImageUrl("");
  };

  const handleDeleteItem = (id: string) => {
    const updated = items.filter((i) => i.id !== id);
    setItems(updated);
    onSaveVision(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-[#131913] rounded-3xl p-6 border border-[#1F2B1F] shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#1F2B1F] pb-4">
          <div className="flex items-center gap-2">
            <Eye className="w-6 h-6 text-[#6B9361]" />
            <div>
              <h3 className="text-xl font-bold text-[#EBF1EA]">บอร์ดภาพนิมิต (Vision Board)</h3>
              <p className="text-xs text-[#869883]">สร้างภาพชีวิตในฝัน ครอบคลุม สุขภาพ, บ้าน, การเงิน, การเดินทาง</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#182018] text-[#869883] hover:text-[#EBF1EA]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add Vision Card */}
        <div className="p-4 rounded-2xl bg-[#182018] border border-[#223022] space-y-3">
          <h4 className="text-xs font-mono text-[#6B9361] uppercase font-bold">เพิ่มมโนภาพใหม่</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="เป้าหมายภาพนิมิต เช่น บ้านเดี่ยวทรงมินิมอล"
              className="p-2.5 rounded-xl bg-[#101610] border border-[#1F2B1F] text-xs text-[#EBF1EA]"
            />
            <input
              type="text"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="URL รูปภาพ (หรือเว้นว่างไว้เพื่อสุ่มรูป)"
              className="p-2.5 rounded-xl bg-[#101610] border border-[#1F2B1F] text-xs text-[#EBF1EA]"
            />
            <button
              onClick={handleAddItem}
              className="px-4 py-2.5 rounded-xl bg-[#3F5C3A] text-white text-xs font-mono font-bold flex items-center justify-center gap-1 hover:bg-[#4E7345]"
            >
              <Plus className="w-4 h-4" />
              <span>บันทึกภาพนิมิต</span>
            </button>
          </div>
        </div>

        {/* Vision Board Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-[#182018] rounded-2xl overflow-hidden border border-[#223022] relative group hover:border-[#273727] transition-all space-y-2 p-3"
            >
              <div className="h-40 rounded-xl overflow-hidden relative">
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-black/70 text-white font-mono text-[10px]">
                  {item.category}
                </span>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="px-1">
                <h4 className="font-bold text-[#EBF1EA] text-sm">{item.title}</h4>
                <p className="text-xs text-[#869883] line-clamp-2 mt-0.5">{item.notes}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
