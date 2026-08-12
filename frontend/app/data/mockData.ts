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

// export const buildingLocation = {
//   name: "Academic Building",
//   lat: 17.1664,
//   lng: 104.1486,
// };

// export const deviceStatus = [
//   { id: 1, name: "Meter #1", status: "online" as const },
//   // เพิ่ม meter อื่นๆ ได้ที่นี่
// ];

// export const recentAlerts = [
//   {
//     id: 1,
//     date: "Today 12.00 AM",
//     message: "แจ้งเตือนไฟฟ้า PF ต่ำ",
//     severity: "warning" as const,
//   },
// ];

// export const aiInsight = {
//   text: "การใช้พลังงานผิดปกติในอาคาร ใช้พลังงานมากกว่าปกติ 28% ในวันนี้",
// };

// // สถานะปัจจุบันของอาคาร (ค่าที่ระบบวัดได้แบบ real-time)
// export const buildingStatus = {
//   name: "อาคาร 22 ปฏิบัติการ",
//   voltage: 198,        // V (ปกติ 210-230)
//   current: 42,          // A
//   powerFactor: 0.68,    // ปกติควร > 0.85
//   baselineCurrent: 25,  // ค่าเฉลี่ยปกติ เอาไว้เทียบไฟกระชาก
// };

export type RangeMode = "Day" | "Month" | "Year" | "Total";

export interface DeviceIssue {
  id: string;
  name: string;
  zone: string;
  issue: string;
  severity: "low" | "medium" | "high";
}

export const ENERGY_TODAY: Record<RangeMode, { value: number; unit: string; changePct: number }> = {
  Day: { value: 655, unit: "kWh", changePct: 12 },
  Month: { value: 12019, unit: "kWh", changePct: -8 },
  Year: { value: 144300, unit: "kWh", changePct: 5 },
  Total: { value: 890450, unit: "kWh", changePct: 3 },
};

export const COST_ESTIMATE: Record<RangeMode, { value: number; changePct: number }> = {
  Day: { value: 2685, changePct: 12 },
  Month: { value: 50478, changePct: -8 },
  Year: { value: 591200, changePct: 5 },
  Total: { value: 3648000, changePct: 3 },
};

export const PEAK_DEMAND: Record<RangeMode, { value: number; time: string }> = {
  Day: { value: 117.85, time: "10:42 AM" },
  Month: { value: 132.4, time: "Mar 12, 09:15 AM" },
  Year: { value: 148.9, time: "Jul 2023" },
  Total: { value: 148.9, time: "Jul 2023" },
};

export const consumptionSeries: Record<RangeMode, { label: string; today: number; yesterday: number }[]> = {
  Day: [
    { label: "9:00", today: 42, yesterday: 38 },
    { label: "9:30", today: 55, yesterday: 44 },
    { label: "10:00", today: 18, yesterday: 41 },
    { label: "10:30", today: 34, yesterday: 47 },
    { label: "11:00", today: 61, yesterday: 39 },
    { label: "11:30", today: 48, yesterday: 52 },
    { label: "12:00", today: 57, yesterday: 45 },
  ],
  Month: [
    { label: "Wk1", today: 2850, yesterday: 3100 },
    { label: "Wk2", today: 3120, yesterday: 2950 },
    { label: "Wk3", today: 2990, yesterday: 3200 },
    { label: "Wk4", today: 3059, yesterday: 2870 },
  ],
  Year: [
    { label: "Jan", today: 11800, yesterday: 12400 },
    { label: "Feb", today: 10950, yesterday: 11200 },
    { label: "Mar", today: 12019, yesterday: 12600 },
    { label: "Apr", today: 12450, yesterday: 11900 },
    { label: "May", today: 13100, yesterday: 12800 },
    { label: "Jun", today: 12780, yesterday: 13400 },
  ],
  Total: [
    { label: "2021", today: 148200, yesterday: 0 },
    { label: "2022", today: 152400, yesterday: 0 },
    { label: "2023", today: 144300, yesterday: 0 },
  ],
};

export const usageSeries: Record<RangeMode, { label: string; kwh: number }[]> = {
  Day: [
    { label: "Mon", kwh: 32 },
    { label: "Tue", kwh: 34 },
    { label: "Wed", kwh: 58 },
    { label: "Thu", kwh: 61 },
    { label: "Fri", kwh: 77 },
  ],
  Month: [
    { label: "Wk1", kwh: 2850 },
    { label: "Wk2", kwh: 3120 },
    { label: "Wk3", kwh: 2990 },
    { label: "Wk4", kwh: 3059 },
  ],
  Year: [
    { label: "Jan", kwh: 11800 },
    { label: "Feb", kwh: 10950 },
    { label: "Mar", kwh: 12019 },
    { label: "Apr", kwh: 12450 },
    { label: "May", kwh: 13100 },
    { label: "Jun", kwh: 12780 },
  ],
  Total: [
    { label: "2021", kwh: 148200 },
    { label: "2022", kwh: 152400 },
    { label: "2023", kwh: 144300 },
  ],
};

export const costSeries: Record<RangeMode, { label: string; cost: number }[]> = {
  Day: usageSeries.Day.map((d) => ({ label: d.label, cost: Math.round(d.kwh * 4.1) })),
  Month: usageSeries.Month.map((d) => ({ label: d.label, cost: Math.round(d.kwh * 4.1) })),
  Year: usageSeries.Year.map((d) => ({ label: d.label, cost: Math.round(d.kwh * 4.1) })),
  Total: usageSeries.Total.map((d) => ({ label: d.label, cost: Math.round(d.kwh * 4.1) })),
};

export const devices: DeviceIssue[] = [
  {
    id: "1",
    name: "Panel MDB-2 / Floor 3",
    zone: "อาคาร 22 ปฏิบัติการ",
    issue: "Power Factor ต่ำกว่าเกณฑ์ (0.48)",
    severity: "high",
  },
];