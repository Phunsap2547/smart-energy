
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

// src/lib/formatter.ts

// src/lib/formatter.ts

export function formatChartTime(rawTime: string): string {
  if (!rawTime) return "";

  // ดึง HH:mm จากข้อความตรงๆ (เพราะ Backend บวก +7 เป็นเวลาไทยใน String มาแล้ว)
  // วิธีนี้จะการันตีได้ 100% ว่าจะได้เลขเวลาตรงกับที่เก็บใน DB โดยไม่ถูก JS แปลง Timezone ซ้ำ
  const timeMatch = rawTime.match(/(\d{2}):(\d{2})/);
  if (timeMatch) {
    return `${timeMatch[1]}:${timeMatch[2]}`; // คืนค่า "22:42" ตรงๆ
  }

  // Fallback กรณีข้อความไม่อยู่ในฟอร์แมตปกติ
  const date = new Date(rawTime.replace(" ", "T"));
  if (isNaN(date.getTime())) return "";
  
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

// export function formatChartTime(rawTime: string): string {
//   if (!rawTime) return "";

//   // 1. เปลี่ยนเว้นวรรคเป็น T เพื่อให้ Safari อ่านได้ถูกต้อง
//   const formatted = rawTime.trim().replace(" ", "T");
//   const date = new Date(formatted);

//   if (isNaN(date.getTime())) return "";

//   // 2. แปลงเป็นเวลาไทย HH:mm
//   return date.toLocaleTimeString("th-TH", {
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: false,
//     timeZone: "Asia/Bangkok",
//   });
// }



// จัดรูปแบบวันเวลาเต็มสำหรับ Header (เช่น 9/9/2026, 14:30:00)
export const formatFullDateTime = (isoString: string | null | undefined): string => {
  if (!isoString) return "ไม่มีข้อมูล";
  return new Date(isoString).toLocaleString("th-TH");
};