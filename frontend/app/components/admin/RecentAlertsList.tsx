import { AlertTriangle } from "lucide-react";
import { recentAlerts } from "@/data/mockData";

export default function RecentAlertsList() {
  return (
    <div className="rounded-[12px] bg-white overflow-hidden shadow-sm border border-gray-100 flex-1">
      <div className="flex items-center justify-between px-[16px] py-[10px] bg-red-500">
        <h3 className="text-white font-semibold text-[14px]"
        >
          Recent Alerts
        </h3>
        <button className="text-white text-[12px] underline">
          View All
        </button>
      </div>

      <div className="px-[16px] py-[14px] flex flex-col gap-[10px]">
        {recentAlerts.map((alert) => (
          <div key={alert.id} className="flex items-start gap-[8px] text-[13px]">
            <AlertTriangle size={16} className="text-yellow-500 mt-[2px] shrink-0" />
            <div>
              <span className="text-gray-400 mr-[6px]">{alert.date}</span>
              <span className="text-gray-700">{alert.message}</span>
            </div>
          </div>
        ))}
        {recentAlerts.length === 0 && (
          <p className="text-gray-400 text-[13px]">ไม่มีการแจ้งเตือน</p>
        )}
      </div>
    </div>
  );
}