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

// จัดรูปแบบเวลาแบบสั้นสำหรับแกน X กราฟ (เช่น 14:30)
export const formatChartTime = (isoString: string | null | undefined): string => {
  if (!isoString) return "--:--";
  return new Date(isoString).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

// จัดรูปแบบวันเวลาเต็มสำหรับ Header (เช่น 9/9/2026, 14:30:00)
export const formatFullDateTime = (isoString: string | null | undefined): string => {
  if (!isoString) return "ไม่มีข้อมูล";
  return new Date(isoString).toLocaleString("th-TH");
};