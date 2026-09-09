export interface EnergyIngest {
  id: number | string;
  created_at: string;
  building_id?: number;
  active_power: number;     // กำลังไฟฟ้าขณะนั้น (kW)
  active_energy: number;    // พลังงานไฟฟ้ารวม (kWh)
  voltage_l1: number;       // แรงดัน L1 (V)
  voltage_l2: number;       // แรงดัน L2 (V)
  voltage_l3: number;       // แรงดัน L3 (V)
  current_l1: number;       // กระแส L1 (A)
  current_l2: number;       // กระแส L2 (A)
  current_l3: number;       // กระแส L3 (A)
  pf_l1: number;            // Power Factor L1
  pf_l2: number;            // Power Factor L2
  pf_l3: number;            // Power Factor L3
  total_pf: number;         // Power Factor รวม
}