export type VoltageCfg = { min: number; max: number };

export const DEFAULT_VOLTAGE_CFG: VoltageCfg = { min: 220, max: 240 };

type DeviceVoltageRow = {
  voltage_min?: number | string | null;
  voltage_max?: number | string | null;
  nominal_voltage?: number | string | null;
};

// ถ้าตั้ง min/max ไว้ใช้ค่านั้น ถ้าไม่ตั้งคำนวณจาก nominal ±10%
export function resolveVoltageCfg(dev?: DeviceVoltageRow | null): VoltageCfg {
  if (!dev) return DEFAULT_VOLTAGE_CFG;
  const nominal = Number(dev.nominal_voltage) || 230;
  return {
    min: dev.voltage_min != null ? Number(dev.voltage_min) : Math.round(nominal * 0.9),
    max: dev.voltage_max != null ? Number(dev.voltage_max) : Math.round(nominal * 1.1),
  };
}