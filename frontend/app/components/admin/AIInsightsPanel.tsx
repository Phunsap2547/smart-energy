import { Sparkles } from "lucide-react";
import { aiInsight } from "@/data/mockData";

export default function AllInsightsPanel() {
  return (
    <div className="rounded-[12px] overflow-hidden shadow-sm border border-gray-100">
      <div className="flex items-center gap-[8px] px-[16px] py-[10px] bg-yellow-400">
        <Sparkles size={18} className="text-white" />
        <h3 className="text-white font-semibold text-[14px]">AI Insights</h3>
      </div>
      <div className="bg-white px-[16px] py-[16px]">
        <p className="text-gray-700 text-[14px] leading-relaxed">
          {aiInsight.text}
        </p>
      </div>
    </div>
  );
}