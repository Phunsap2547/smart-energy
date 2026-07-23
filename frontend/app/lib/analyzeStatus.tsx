export interface AnalysisResult {
  isNormal: boolean;
  severity: "normal" | "warning" | "critical";
  issues: {
    title: string;
    detail: string;
    confidence: number; // จำลอง confidence score แบบโมเดล ML (0-1)
  }[];
}

interface BuildingMetrics {
  voltage: number;
  current: number;
  powerFactor: number;
  baselineCurrent: number;
}

// TODO: เมื่อมี ML API จริง ให้แทนที่ function นี้ด้วยการ fetch ไปยัง
// endpoint ของโมเดล เช่น POST /api/ml/analyze แล้ว return ผลลัพธ์รูปแบบเดียวกัน
export function analyzeStatus(metrics: BuildingMetrics): AnalysisResult {
  const issues: AnalysisResult["issues"] = [];

  // เกณฑ์ไฟฟ้ามาตรฐาน (220V ±5%)
  if (metrics.voltage < 209) {
    issues.push({
      title: "แรงดันไฟฟ้าต่ำกว่าปกติ (Voltage Drop)",
      detail: `ตรวจพบแรงดัน ${metrics.voltage}V ต่ำกว่าเกณฑ์มาตรฐาน (210-230V) อาจเกิดจากโหลดไฟฟ้าเกินพิกัด หรือสายไฟ/จุดต่อหลวมและเสื่อมสภาพ`,
      confidence: 0.87,
    });
  }

  if (metrics.powerFactor < 0.85) {
    issues.push({
      title: "ค่า Power Factor ต่ำกว่ามาตรฐาน",
      detail: `PF ปัจจุบัน ${metrics.powerFactor.toFixed(2)} ต่ำกว่าเกณฑ์ 0.85 บ่งชี้ว่ามีโหลดประเภท Inductive (มอเตอร์ เครื่องปรับอากาศ) ทำงานพร้อมกันจำนวนมาก โดยไม่มีอุปกรณ์ชดเชย (Capacitor Bank) เพียงพอ ทำให้สูญเสียพลังงานส่วนเกินและอาจเป็นสาเหตุร่วมของแรงดันตก`,
      confidence: 0.91,
    });
  }

  if (metrics.current > metrics.baselineCurrent * 1.5) {
    issues.push({
      title: "กระแสไฟฟ้าสูงผิดปกติ",
      detail: `กระแสวัดได้ ${metrics.current}A สูงกว่าค่าเฉลี่ยปกติ (${metrics.baselineCurrent}A) มากกว่า 50% อาจเกิดจากอุปกรณ์เริ่มทำงานพร้อมกันหลายตัว หรือมีความผิดปกติของวงจรไฟฟ้า`,
      confidence: 0.78,
    });
  }

  if (issues.length === 0) {
    return { isNormal: true, severity: "normal", issues: [] };
  }

  const severity = issues.length >= 2 ? "critical" : "warning";
  return { isNormal: false, severity, issues };
}