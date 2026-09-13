export interface EnergyIngest {
  id: number;
  building_id: number;
  device_id?: string;
  created_at: string;
  reading_time?: string;

  // Voltage
  voltage_system?: number;
  voltage_a?: number;
  voltage_b?: number;
  voltage_c?: number;

  // Current
  current_system?: number;
  current_a?: number;
  current_b?: number;
  current_c?: number;

  // Power & Energy
  power_kw?: number;
  power_a?: number;
  power_b?: number;
  power_c?: number;
  energy_kwh?: number;

  // Other Metrics
  power_factor?: number;
  frequency_hz?: number;
  voltage_unbalance_pct?: number;
  current_unbalance_pct?: number;
  thd_voltage_l1_pct?: number;
  thd_current_l1_pct?: number;
}

// export interface EnergyIngest {
//   id: number | string;
//   created_at: string;
//   building_id?: number;
//   active_power: number;     // กำลังไฟฟ้าขณะนั้น (kW)
//   active_energy: number;    // พลังงานไฟฟ้ารวม (kWh)
//   voltage_l1: number;       // แรงดัน L1 (V)
//   voltage_l2: number;       // แรงดัน L2 (V)
//   voltage_l3: number;       // แรงดัน L3 (V)
//   current_l1: number;       // กระแส L1 (A)
//   current_l2: number;       // กระแส L2 (A)
//   current_l3: number;       // กระแส L3 (A)
//   pf_l1: number;            // Power Factor L1
//   pf_l2: number;            // Power Factor L2
//   pf_l3: number;            // Power Factor L3
//   total_pf: number;         // Power Factor รวม
// }
