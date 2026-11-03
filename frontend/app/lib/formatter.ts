
// จัดรูปแบบตัวเลขพร้อมใส่คอมมา (เช่น 1,234.56)
export const formatNumber = (
  value: number | null | undefined,
  decimals: number = 2
): string => {
  if (value === null || value === undefined || isNaN(value)) return "0.00";
  return value.toLocaleString("th-TH", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

// จัดรูปแบบกำลังไฟฟ้า (Active Power: kW)
export const formatPower = (value: number | null | undefined): string => {
  return `${formatNumber(value, 2)} kW`;
};

// จัดรูปแบบพลังงานสะสม (Active Energy: kWh)
export const formatEnergy = (value: number | null | undefined): string => {
  return `${formatNumber(value, 1)} kWh`;
};

// จัดรูปแบบกระแสไฟฟ้า (Current: A)
export const formatCurrent = (value: number | null | undefined): string => {
  return `${formatNumber(value, 2)} A`;
};

// จัดรูปแบบแรงดันไฟฟ้า (Voltage: V)
export const formatVoltage = (value: number | null | undefined): string => {
  return `${formatNumber(value, 1)} V`;
};

export function formatChartTime(rawTime: string): string {
  if (!rawTime) return "";

  const date = new Date(rawTime.trim().replace(" ", "T"));
  if (isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Bangkok",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date); // "23:10"
}

  export const formatFullDateTime = (isoString: string | null | undefined): string => {
    if (!isoString) return "ไม่มีข้อมูล";
    return new Date(isoString).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" });
  };