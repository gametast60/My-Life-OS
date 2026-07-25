import React from "react";
import { TimelineEvent } from "../types";
import { X, Calendar } from "lucide-react";

interface TimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  timeline: TimelineEvent[];
}

export const TimelineModal: React.FC<TimelineModalProps> = ({
  isOpen,
  onClose,
  timeline,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#131913] rounded-3xl p-6 border border-[#1F2B1F] shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#1F2B1F] pb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#6B9361]" />
            <div>
              <h3 className="text-xl font-bold text-[#EBF1EA]">Timeline ชีวิต (Life Timeline)</h3>
              <p className="text-xs text-[#869883]">รวบรวมประวัติการเติบโต เหตุการณ์สำคัญ และความสำเร็จ</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#182018] text-[#869883] hover:text-[#EBF1EA]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Timeline Stream */}
        <div className="relative pl-6 space-y-6 border-l border-[#1F2B1F] ml-2">
          {timeline.map((event) => (
            <div key={event.id} className="relative space-y-2">
              <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[#4E7345] ring-4 ring-[#131913] flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>

              <div className="p-4 rounded-2xl bg-[#182018] border border-[#223022] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-[#6B9361] font-bold">{event.dateStr}</span>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#182218] text-[#6B9361] border border-[#273727]">
                    {event.badge}
                  </span>
                </div>

                <h4 className="font-bold text-[#EBF1EA] text-sm">{event.title}</h4>
                <p className="text-xs text-[#869883] leading-relaxed">{event.description}</p>

                {event.imageUrl && (
                  <div className="h-32 rounded-xl overflow-hidden my-2 border border-[#1F2B1F]">
                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
