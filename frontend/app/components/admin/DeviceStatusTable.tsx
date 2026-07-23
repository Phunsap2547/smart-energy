import { Radio } from "lucide-react";
import theme from "@/config/theme.js";
import { deviceStatus } from "@/data/mockData";

export default function DeviceStatusTable() {
  return (
    <div className="rounded-[12px] bg-white overflow-hidden shadow-sm border border-gray-100 flex-1">
      <div
        className="flex items-center gap-[8px] px-[16px] py-[10px]"
        style={{ backgroundColor: theme.colors.primary ?? "#2E7D32" }}
      >
        <Radio size={18} className="text-white" />
        <h3 className="text-white font-semibold text-[14px]">
          Device Status
        </h3>
      </div>

      <div className="px-[16px] py-[14px] flex flex-col gap-[10px]">
        {deviceStatus.map((device) => (
          <div
            key={device.id}
            className="flex items-center justify-between text-[14px]"
          >
            <span className="text-gray-700">{device.name}</span>
            <span className="flex items-center gap-[6px]">
              <span
                className={`w-[8px] h-[8px] rounded-full ${
                  device.status === "online" ? "bg-green-500" : "bg-gray-400"
                }`}
              />
              <span
                className={
                  device.status === "online"
                    ? "text-green-600"
                    : "text-gray-500"
                }
              >
                {device.status === "online" ? "Online" : "Offline"}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}