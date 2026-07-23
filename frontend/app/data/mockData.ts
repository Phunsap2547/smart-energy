// ข้อมูลตัวอย่าง — ในระบบจริงสามารถแทนที่ด้วยการ fetch จาก API/DB ได้เลย
// โดยไม่ต้องแก้ไข component ใด ๆ (แค่เปลี่ยนแหล่งข้อมูลตรงนี้)

export const statCards = {
  energyToday: { value: 655, unit: "kWH", status: "Normal" },
  realPower: { value: 10, unit: "kW", status: "Normal" },
  powerFactor: { value: 0.48, status: "Low" },
  statusAlert: { count: 1, label: "devices" },
};

export const energyConsumptionSeries = [
  { time: "9.00 AM", voltage: 40, current: 55, power: 30 },
  { time: "9.30 AM", voltage: 60, current: 35, power: 50 },
  { time: "10.00 AM", voltage: 30, current: 60, power: 10 },
  { time: "10.30 AM", voltage: 55, current: 40, power: 45 },
  { time: "11.00 AM", voltage: 65, current: 50, power: 60 },
  { time: "11.30 AM", voltage: 45, current: 70, power: 35 },
  { time: "12.00 AM", voltage: 70, current: 45, power: 65 },
];

export const totalEnergyWeekly = [
  { day: "Mon", kwh: 30 },
  { day: "Tue", kwh: 32 },
  { day: "Wed", kwh: 55 },
  { day: "Thu", kwh: 62 },
  { day: "Fri", kwh: 78 },
];

export const buildingLocation = {
  name: "Academic Building",
  lat: 17.1664,
  lng: 104.1486,
};

export const deviceStatus = [
  { id: 1, name: "Meter #1", status: "online" as const },
  // เพิ่ม meter อื่นๆ ได้ที่นี่
];

export const recentAlerts = [
  {
    id: 1,
    date: "Today 12.00 AM",
    message: "แจ้งเตือนไฟฟ้า PF ต่ำ",
    severity: "warning" as const,
  },
];

export const aiInsight = {
  text: "การใช้พลังงานผิดปกติในอาคาร ใช้พลังงานมากกว่าปกติ 28% ในวันนี้",
};

// สถานะปัจจุบันของอาคาร (ค่าที่ระบบวัดได้แบบ real-time)
export const buildingStatus = {
  name: "อาคาร 22 ปฏิบัติการ",
  voltage: 198,        // V (ปกติ 210-230)
  current: 42,          // A
  powerFactor: 0.68,    // ปกติควร > 0.85
  baselineCurrent: 25,  // ค่าเฉลี่ยปกติ เอาไว้เทียบไฟกระชาก
};

