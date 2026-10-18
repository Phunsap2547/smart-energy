
// // routes/readings.js
// const express = require('express');
// const { createClient } = require('@supabase/supabase-js');
// const authenticateDevice = require('../middleware/deviceAuth');
// //const axios = require('axios');

// const router = express.Router();

// // สร้าง Supabase Client
// const supabaseUrl = process.env.SUPABASE_URL;
// const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
// const supabase = createClient(supabaseUrl, supabaseKey);

// // URL สำหรับเรียก Python ML Service
// //const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000/predict';

// // function getThaiTime() {
// //   const now = new Date();
// //   return new Date(now.getTime() + (7 * 60 * 60 * 1000)).toISOString();
// // }
// // ✅ ฟังก์ชันสร้าง ISO Time String กำหนด Timezone ไทย (+07:00) อย่างถูกต้อง
// function getThaiTime() {
//   const now = new Date();
//   const tzOffset = 7 * 60; // ไทย คือ +07:00 (ในหน่วยนาที)
//   const localTime = new Date(now.getTime() + (tzOffset * 60 * 1000));

//   // Format ออกมาเป็น YYYY-MM-DDTHH:mm:ss.sss+07:00
//   const iso = localTime.toISOString().replace('Z', '');
//   return `${iso}+07:00`;
// }

// // เกณฑ์แรงดัน: อ่านช่วงปกติจากตาราง devices (voltage_min / voltage_max)
// // ต่ำกว่า min หรือสูงกว่า max = ผิดปกติ, ถ้าเบี่ยงเกิน 10% ของขอบที่ละเมิด = critical
// function checkVoltage(value, device) {
//   if (value == null || !device) return null;

//   const v = Number(value);
//   const min = Number(device.voltage_min ?? 220); // fallback กันค่าว่าง
//   const max = Number(device.voltage_max ?? 240);

//   if (v > max) {
//     return {
//       type: 'over_voltage',
//       severity: (v - max) / max > 0.05 ? 'critical' : 'warning',
//       limit: max,
//     };
//   }
//   if (v < min) {
//     return {
//       type: 'under_voltage',
//       severity: (min - v) / min > 0.05 ? 'critical' : 'warning',
//       limit: min,
//     };
//   }
//   return null; // อยู่ในช่วงปกติ
// }
// // -----------------------------------------------------------------------------
// // GET /api/readings — ดึงประวัติค่าไฟดิบจาก Supabase
// // -----------------------------------------------------------------------------
// router.get('/', async (req, res) => {
//   const { device_id, from, to, limit = 100, page = 1 } = req.query;

//   try {
//     const safeLimit = Math.min(parseInt(limit, 10) || 100, 1000);
//     const currentPage = Math.max(parseInt(page, 10) || 1, 1);
//     const offset = (currentPage - 1) * safeLimit;

//     let query = supabase
//       .from('energy_readings')
//       .select('*')
//       .order('reading_time', { ascending: false })
//       .range(offset, offset + safeLimit - 1);

//     if (device_id) query = query.eq('device_id', device_id);
//     if (from) query = query.gte('reading_time', from);
//     if (to) query = query.lte('reading_time', to);

//     const { data, error } = await query;

//     if (error) throw error;

//     res.json(data);
//   } catch (err) {
//     console.error('❌ Error in GET /api/readings:', err);
//     res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล', error: err.message });
//   }
// });

// // GET /api/readings/energy — พลังงานที่ใช้ (kWh) แยกตามช่วงเวลา
// router.get('/energy', async (req, res) => {
//   const { device_id, range = 'Day', date } = req.query;
//   if (!device_id) return res.status(400).json({ message: 'กรุณาระบุ device_id' });

//   try {
//     // วันที่เป้าหมาย (เวลาไทย)
//     const base = date ? new Date(date) : new Date();
//     const thai = new Date(base.getTime() + 7 * 60 * 60 * 1000);
//     const y = thai.getUTCFullYear();
//     const m = thai.getUTCMonth();
//     const d = thai.getUTCDate();
//     const pad = (n) => String(n).padStart(2, '0');

//     let start, end, groupBy; // groupBy: 'hour' | 'day' | 'month'
//     if (range === 'Day') {
//       start = `${y}-${pad(m + 1)}-${pad(d)}T00:00:00+07:00`;
//       end   = `${y}-${pad(m + 1)}-${pad(d)}T23:59:59+07:00`;
//       groupBy = 'hour';
//     } else if (range === 'Month') {
//       const last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
//       start = `${y}-${pad(m + 1)}-01T00:00:00+07:00`;
//       end   = `${y}-${pad(m + 1)}-${pad(last)}T23:59:59+07:00`;
//       groupBy = 'day';
//     } else if (range === 'Year') {
//       start = `${y}-01-01T00:00:00+07:00`;
//       end   = `${y}-12-31T23:59:59+07:00`;
//       groupBy = 'month';
//     } else {
//       start = '2000-01-01T00:00:00+07:00';
//       end   = `${y}-${pad(m + 1)}-${pad(d)}T23:59:59+07:00`;
//       groupBy = 'month';
//     }

//     // ดึงแบบ pagination (Supabase จำกัด 1000 แถว/ครั้ง)
//     let all = [];
//     let page = 0;
//     const pageSize = 1000;
//     while (true) {
//       const { data, error } = await supabase
//         .from('energy_readings')
//         .select('reading_time, energy_kwh')
//         .eq('device_id', device_id)
//         .gte('reading_time', start)
//         .lte('reading_time', end)
//         .not('energy_kwh', 'is', null)
//         .order('reading_time', { ascending: true })
//         .range(page * pageSize, page * pageSize + pageSize - 1);

//       if (error) throw error;
//       if (!data || data.length === 0) break;
//       all = all.concat(data);
//       if (data.length < pageSize) break;
//       page++;
//     }

//     // จัดกลุ่ม แล้วหา min/max ต่อกลุ่ม
//     const groups = {};
//     for (const r of all) {
//       const t = new Date(new Date(r.reading_time).getTime() + 7 * 60 * 60 * 1000);
//       const iso = t.toISOString(); // เวลาไทยในรูป UTC
//       let key;
//       if (groupBy === 'hour')  key = `${iso.slice(11, 13)}:00`;
//       else if (groupBy === 'day') key = iso.slice(8, 10) + '/' + iso.slice(5, 7);
//       else key = iso.slice(0, 7); // YYYY-MM

//       const v = Number(r.energy_kwh);
//       if (!groups[key]) groups[key] = { min: v, max: v };
//       else {
//         groups[key].min = Math.min(groups[key].min, v);
//         groups[key].max = Math.max(groups[key].max, v);
//       }
//     }

//     const result = Object.keys(groups).sort().map((k) => ({
//       label: k,
//       energy: Number(Math.max(0, groups[k].max - groups[k].min).toFixed(2)),
//     }));

//     res.json(result);
//   } catch (err) {
//     console.error('❌ Error in GET /api/readings/energy:', err);
//     res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล', error: err.message });
//   }
// });


// // -----------------------------------------------------------------------------
// // GET /api/readings/latest — ดึงค่าล่าสุด + คำนวณ หน่วยไฟฟ้าวันนี้ (daily_energy_kwh)
// // -----------------------------------------------------------------------------
// router.get('/latest', async (req, res) => {
//   const { device_id } = req.query;
//   if (!device_id) {
//     return res.status(400).json({ message: 'กรุณาระบุ device_id' });
//   }

//   try {
//     // 1. ดึง Reading ล่าสุด
//     const { data: latestData, error: latestErr } = await supabase
//       .from('energy_readings')
//       .select('*')
//       .eq('device_id', device_id)
//       .order('reading_time', { ascending: false })
//       .limit(1)
//       .maybeSingle();

//     if (latestErr) throw latestErr;
//     if (!latestData) return res.json(null);

//     // 2. หาวันที่ปัจจุบัน (เวลาไทย)
//     // const now = new Date();
//     // const thaiDateStr = new Date(now.getTime() + (7 * 60 * 60 * 1000))
//     //   .toISOString().split('T')[0];
//     // const startOfToday = `${thaiDateStr}T00:00:00`;

//     const now = new Date();
//     const thaiTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
//     const thaiDateStr = thaiTime.toISOString().split('T')[0];
//     const startOfToday = `${thaiDateStr}T00:00:00+07:00`; // ระบุ Offset ให้ชัดเจน

//     // 3. ดึง Reading แรกของวันนี้เพื่อนำพลังงานมาลบกัน
//     const { data: startDayData, error: startDayErr } = await supabase
//       .from('energy_readings')
//       .select('energy_kwh')
//       .eq('device_id', device_id)
//       .gte('reading_time', startOfToday)
//       .order('reading_time', { ascending: true })
//       .limit(1)
//       .maybeSingle();

//     if (startDayErr) throw startDayErr;

//     const currentEnergy = Number(latestData.energy_kwh) || 0;
//     const startOfDayEnergy = startDayData?.energy_kwh != null
//       ? Number(startDayData.energy_kwh)
//       : currentEnergy;

//     const dailyEnergyKwh = Math.max(0, currentEnergy - startOfDayEnergy);

//     res.json({
//       ...latestData,
//       energy_start_of_day_kwh: startOfDayEnergy,
//       daily_energy_kwh: Number(dailyEnergyKwh.toFixed(2)),
//     });
//   } catch (err) {
//     console.error('❌ Error in GET /api/readings/latest:', err);
//     res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ', error: err.message });
//   }
// });

// // -----------------------------------------------------------------------------
// // POST /api/readings — รับค่าจาก ESP32 บันทึกลง Supabase และส่งต่อไป ML API
// // -----------------------------------------------------------------------------
// router.post('/', authenticateDevice, async (req, res) => {
//   const body = req.body;
//   const device_id = body.device_id;

//   if (!device_id) {
//     return res.status(400).json({ message: 'กรุณาระบุ device_id' });
//   }

//   // Normalize ค่าจาก ESP32
//   const payload = {
//     device_id,
//     reading_time: body.reading_time || getThaiTime(),

//     // Voltage
//     voltage_system: body.voltageSystemV ?? body.voltage_system ?? null,
//     voltage_a: body.voltageL1V ?? body.voltage_a ?? body.voltageSystemV ?? null,
//     voltage_b: body.voltageL2V ?? body.voltage_b ?? null,
//     voltage_c: body.voltageL3V ?? body.voltage_c ?? null,

//     // Current
//     current_system: body.currentSystemA ?? body.current_system ?? null,
//     current_a: body.currentL1A ?? body.current_a ?? body.currentSystemA ?? null,
//     current_b: body.currentL2A ?? body.current_b ?? null,
//     current_c: body.currentL3A ?? body.current_c ?? null,

//     // Power
//     power_kw: body.realPowerKw ?? body.power_kw ?? null,
//     power_a: body.realPowerL1Kw ?? body.power_a ?? null,
//     power_b: body.realPowerL2Kw ?? body.power_b ?? null,
//     power_c: body.realPowerL3Kw ?? body.power_c ?? null,
//     energy_kwh: body.energyKwh ?? body.energy_kwh ?? null,

//     // Power Factor
//     power_factor: body.powerFactor ?? body.power_factor ?? null,
//     pf_a: body.powerFactorL1 ?? body.pf_a ?? null,
//     pf_b: body.powerFactorL2 ?? body.pf_b ?? null,
//     pf_c: body.powerFactorL3 ?? body.pf_c ?? null,

//     // Quality
//     frequency_hz: body.frequencyHz ?? body.frequency_hz ?? null,
//     voltage_unbalance_pct: body.voltageUnbalPct ?? body.voltagePhaseUnbalancePct ?? body.voltage_unbalance_pct ?? null,
//     current_unbalance_pct: body.currentUnbalPct ?? body.current_unbalance_pct ?? null,

//     // THD Voltage
//     thd_voltage_l1_pct: body.thdVoltageL1Pct ?? body.thd_voltage_l1_pct ?? null,
//     thd_voltage_l2_pct: body.thdVoltageL2Pct ?? body.thd_voltage_l2_pct ?? null,
//     thd_voltage_l3_pct: body.thdVoltageL3Pct ?? body.thd_voltage_l3_pct ?? null,

//     // THD Current
//     thd_current_l1_pct: body.thdCurrentL1Pct ?? body.thd_current_l1_pct ?? null,
//     thd_current_l2_pct: body.thdCurrentL2Pct ?? body.thd_current_l2_pct ?? null,
//     thd_current_l3_pct: body.thdCurrentL3Pct ?? body.thd_current_l3_pct ?? null,
//   };

//   try {
//     // 1. ตรวจสอบว่า device_id มีจริงในระบบไหม
//     const { data: device, error: devErr } = await supabase
//       .from('devices')
//       .select('id, building_id')
//       .eq('id', device_id)
//       .maybeSingle();

//     if (devErr) throw devErr;
//     if (!device) {
//       return res.status(404).json({ message: `ไม่พบ device_id: ${device_id} ในระบบ` });
//     }

//     // 2. Insert ข้อมูลลงตาราง energy_readings ใน Supabase
//     const { data: savedReading, error: insertErr } = await supabase
//       .from('energy_readings')
//       .insert([payload])
//       .select()
//       .single();

//     if (insertErr) throw insertErr;

//     // 3. ส่งข้อมูลไปให้ ML API ตรวจสอบต่อแบบ Non-blocking
//     // axios.post(ML_SERVICE_URL, {
//     //   device_id: payload.device_id,
//     //   voltage_a: payload.voltage_a,
//     //   voltage_b: payload.voltage_b,
//     //   voltage_c: payload.voltage_c,
//     //   current_a: payload.current_a,
//     //   current_b: payload.current_b,
//     //   current_c: payload.current_c,
//     //   pf_a: payload.pf_a,
//     //   pf_b: payload.pf_b,
//     //   pf_c: payload.pf_c,
//     // }, { timeout: 3000 }).catch(err => {
//     //   console.warn('⚠️ ML Service response delay/warning:', err.message);
//     // });

//     return res.status(201).json({
//       message: 'บันทึกข้อมูลสำเร็จ',
//       reading: savedReading
//     });

//   } catch (err) {
//     console.error('❌ Error in POST /api/readings:', err);
//     return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', error: err.message });
//   }
// });

// // -----------------------------------------------------------------------------
// // GET /api/readings/chart — ดึงข้อมูลใส่ ActivePowerChart (ดึงทั้งวัน)
// // -----------------------------------------------------------------------------
// router.get('/chart', async (req, res) => {
//   const { device_id } = req.query;
//   if (!device_id) return res.status(400).json({ message: 'กรุณาระบุ device_id' });

//   try {
//     const now = new Date();
//     const thaiDateStr = new Date(now.getTime() + 7 * 3600 * 1000).toISOString().split('T')[0];
//     const startOfToday = `${thaiDateStr}T00:00:00+07:00`;

//     // ดึงทีละ 1000 แถวจนหมด
//     const PAGE = 1000;
//     let from = 0;
//     let rows = [];
//     while (true) {
//       const { data, error } = await supabase
//         .from('energy_readings')
//         .select('reading_time, power_kw')
//         .eq('device_id', device_id)
//         .gte('reading_time', startOfToday)
//         .order('reading_time', { ascending: true })
//         .range(from, from + PAGE - 1);

//       if (error) throw error;
//       rows = rows.concat(data || []);
//       if (!data || data.length < PAGE) break;
//       from += PAGE;
//     }

//     // รวมเป็น 1 ค่า/นาที (ใช้ค่าล่าสุดของนาทีนั้น)
//     const perMinute = new Map();
//     for (const item of rows) {
//       const t = new Date(new Date(item.reading_time).getTime() + 7 * 3600 * 1000);
//       const label = `${String(t.getUTCHours()).padStart(2, '0')}:${String(t.getUTCMinutes()).padStart(2, '0')}`;
//       perMinute.set(label, Number(item.power_kw ?? 0));
//     }

//     res.json([...perMinute].map(([label, cost]) => ({ label, cost })));
//   } catch (err) {
//     console.error('❌ Error in GET /api/readings/chart:', err);
//     res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล', error: err.message });
//   }
// });

// module.exports = router;


// // routes/readings.js
// const express = require('express');
// const { createClient } = require('@supabase/supabase-js');
// const authenticateDevice = require('../middleware/deviceAuth');
// //const axios = require('axios');

// const router = express.Router();

// // สร้าง Supabase Client
// const supabaseUrl = process.env.SUPABASE_URL;
// const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
// const supabase = createClient(supabaseUrl, supabaseKey);

// // URL สำหรับเรียก Python ML Service
// //const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000/predict';

// // ✅ ฟังก์ชันสร้าง ISO Time String กำหนด Timezone ไทย (+07:00) อย่างถูกต้อง
// function getThaiTime() {
//   const now = new Date();
//   const tzOffset = 7 * 60; // ไทย คือ +07:00 (ในหน่วยนาที)
//   const localTime = new Date(now.getTime() + (tzOffset * 60 * 1000));

//   // Format ออกมาเป็น YYYY-MM-DDTHH:mm:ss.sss+07:00
//   const iso = localTime.toISOString().replace('Z', '');
//   return `${iso}+07:00`;
// }

// // -----------------------------------------------------------------------------
// // GET /api/readings — ดึงประวัติค่าไฟดิบจาก Supabase
// // -----------------------------------------------------------------------------
// router.get('/', async (req, res) => {
//   const { device_id, from, to, limit = 100, page = 1 } = req.query;

//   try {
//     const safeLimit = Math.min(parseInt(limit, 10) || 100, 1000);
//     const currentPage = Math.max(parseInt(page, 10) || 1, 1);
//     const offset = (currentPage - 1) * safeLimit;

//     let query = supabase
//       .from('energy_readings')
//       .select('*')
//       .order('reading_time', { ascending: false })
//       .range(offset, offset + safeLimit - 1);

//     if (device_id) query = query.eq('device_id', device_id);
//     if (from) query = query.gte('reading_time', from);
//     if (to) query = query.lte('reading_time', to);

//     const { data, error } = await query;

//     if (error) throw error;

//     res.json(data);
//   } catch (err) {
//     console.error('❌ Error in GET /api/readings:', err);
//     res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล', error: err.message });
//   }
// });

// // GET /api/readings/energy — พลังงานที่ใช้ (kWh) แยกตามช่วงเวลา
// router.get('/energy', async (req, res) => {
//   const { device_id, range = 'Day', date } = req.query;
//   if (!device_id) return res.status(400).json({ message: 'กรุณาระบุ device_id' });

//   try {
//     // วันที่เป้าหมาย (เวลาไทย)
//     const base = date ? new Date(date) : new Date();
//     const thai = new Date(base.getTime() + 7 * 60 * 60 * 1000);
//     const y = thai.getUTCFullYear();
//     const m = thai.getUTCMonth();
//     const d = thai.getUTCDate();
//     const pad = (n) => String(n).padStart(2, '0');

//     let start, end, groupBy; // groupBy: 'hour' | 'day' | 'month'
//     if (range === 'Day') {
//       start = `${y}-${pad(m + 1)}-${pad(d)}T00:00:00+07:00`;
//       end   = `${y}-${pad(m + 1)}-${pad(d)}T23:59:59+07:00`;
//       groupBy = 'hour';
//     } else if (range === 'Month') {
//       const last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
//       start = `${y}-${pad(m + 1)}-01T00:00:00+07:00`;
//       end   = `${y}-${pad(m + 1)}-${pad(last)}T23:59:59+07:00`;
//       groupBy = 'day';
//     } else if (range === 'Year') {
//       start = `${y}-01-01T00:00:00+07:00`;
//       end   = `${y}-12-31T23:59:59+07:00`;
//       groupBy = 'month';
//     } else {
//       start = '2000-01-01T00:00:00+07:00';
//       end   = `${y}-${pad(m + 1)}-${pad(d)}T23:59:59+07:00`;
//       groupBy = 'month';
//     }

//     // ดึงแบบ pagination (Supabase จำกัด 1000 แถว/ครั้ง)
//     let all = [];
//     let page = 0;
//     const pageSize = 1000;
//     while (true) {
//       const { data, error } = await supabase
//         .from('energy_readings')
//         .select('reading_time, energy_kwh')
//         .eq('device_id', device_id)
//         .gte('reading_time', start)
//         .lte('reading_time', end)
//         .not('energy_kwh', 'is', null)
//         .order('reading_time', { ascending: true })
//         .range(page * pageSize, page * pageSize + pageSize - 1);

//       if (error) throw error;
//       if (!data || data.length === 0) break;
//       all = all.concat(data);
//       if (data.length < pageSize) break;
//       page++;
//     }

//     // จัดกลุ่ม แล้วหา min/max ต่อกลุ่ม
//     const groups = {};
//     for (const r of all) {
//       const t = new Date(new Date(r.reading_time).getTime() + 7 * 60 * 60 * 1000);
//       const iso = t.toISOString(); // เวลาไทยในรูป UTC
//       let key;
//       if (groupBy === 'hour')  key = `${iso.slice(11, 13)}:00`;
//       else if (groupBy === 'day') key = iso.slice(8, 10) + '/' + iso.slice(5, 7);
//       else key = iso.slice(0, 7); // YYYY-MM

//       const v = Number(r.energy_kwh);
//       if (!groups[key]) groups[key] = { min: v, max: v };
//       else {
//         groups[key].min = Math.min(groups[key].min, v);
//         groups[key].max = Math.max(groups[key].max, v);
//       }
//     }

//     const result = Object.keys(groups).sort().map((k) => ({
//       label: k,
//       energy: Number(Math.max(0, groups[k].max - groups[k].min).toFixed(2)),
//     }));

//     res.json(result);
//   } catch (err) {
//     console.error('❌ Error in GET /api/readings/energy:', err);
//     res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล', error: err.message });
//   }
// });


// // -----------------------------------------------------------------------------
// // GET /api/readings/latest — ดึงค่าล่าสุด + หน่วยไฟฟ้าวันนี้ + ช่วงแรงดันปกติของอุปกรณ์
// // -----------------------------------------------------------------------------
// router.get('/latest', async (req, res) => {
//   const { device_id } = req.query;
//   if (!device_id) {
//     return res.status(400).json({ message: 'กรุณาระบุ device_id' });
//   }

//   try {
//     // 1. ดึง Reading ล่าสุด
//     const { data: latestData, error: latestErr } = await supabase
//       .from('energy_readings')
//       .select('*')
//       .eq('device_id', device_id)
//       .order('reading_time', { ascending: false })
//       .limit(1)
//       .maybeSingle();

//     if (latestErr) throw latestErr;
//     if (!latestData) return res.json(null);

//     // 2. หาวันที่ปัจจุบัน (เวลาไทย)
//     const now = new Date();
//     const thaiTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
//     const thaiDateStr = thaiTime.toISOString().split('T')[0];
//     const startOfToday = `${thaiDateStr}T00:00:00+07:00`; // ระบุ Offset ให้ชัดเจน

//     // 3. ดึง Reading แรกของวันนี้เพื่อนำพลังงานมาลบกัน
//     const { data: startDayData, error: startDayErr } = await supabase
//       .from('energy_readings')
//       .select('energy_kwh')
//       .eq('device_id', device_id)
//       .gte('reading_time', startOfToday)
//       .order('reading_time', { ascending: true })
//       .limit(1)
//       .maybeSingle();

//     if (startDayErr) throw startDayErr;

//     const currentEnergy = Number(latestData.energy_kwh) || 0;
//     const startOfDayEnergy = startDayData?.energy_kwh != null
//       ? Number(startDayData.energy_kwh)
//       : currentEnergy;

//     const dailyEnergyKwh = Math.max(0, currentEnergy - startOfDayEnergy);

//     // 4. ดึงช่วงแรงดันปกติของอุปกรณ์นี้ ให้หน้าเว็บใช้ตัดสินแทนเลข 220-240 ตายตัว
//     const { data: dev, error: devErr } = await supabase
//       .from('devices')
//       .select('voltage_min, voltage_max')
//       .eq('id', device_id)
//       .maybeSingle();

//     if (devErr) throw devErr;

//     res.json({
//       ...latestData,
//       voltage_min: dev?.voltage_min ?? 220,
//       voltage_max: dev?.voltage_max ?? 240,
//       energy_start_of_day_kwh: startOfDayEnergy,
//       daily_energy_kwh: Number(dailyEnergyKwh.toFixed(2)),
//     });
//   } catch (err) {
//     console.error('❌ Error in GET /api/readings/latest:', err);
//     res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ', error: err.message });
//   }
// });

// // -----------------------------------------------------------------------------
// // POST /api/readings — รับค่าจาก ESP32 บันทึกลง Supabase
// // (การสร้าง anomaly ทำโดย Python poller ในโฟลเดอร์ ml)
// // -----------------------------------------------------------------------------
// router.post('/', authenticateDevice, async (req, res) => {
//   const body = req.body;
//   const device_id = body.device_id;

//   if (!device_id) {
//     return res.status(400).json({ message: 'กรุณาระบุ device_id' });
//   }

//   // Normalize ค่าจาก ESP32
//   const payload = {
//     device_id,
//     reading_time: body.reading_time || getThaiTime(),

//     // Voltage
//     voltage_system: body.voltageSystemV ?? body.voltage_system ?? null,
//     voltage_a: body.voltageL1V ?? body.voltage_a ?? body.voltageSystemV ?? null,
//     voltage_b: body.voltageL2V ?? body.voltage_b ?? null,
//     voltage_c: body.voltageL3V ?? body.voltage_c ?? null,

//     // Current
//     current_system: body.currentSystemA ?? body.current_system ?? null,
//     current_a: body.currentL1A ?? body.current_a ?? body.currentSystemA ?? null,
//     current_b: body.currentL2A ?? body.current_b ?? null,
//     current_c: body.currentL3A ?? body.current_c ?? null,

//     // Power
//     power_kw: body.realPowerKw ?? body.power_kw ?? null,
//     power_a: body.realPowerL1Kw ?? body.power_a ?? null,
//     power_b: body.realPowerL2Kw ?? body.power_b ?? null,
//     power_c: body.realPowerL3Kw ?? body.power_c ?? null,
//     energy_kwh: body.energyKwh ?? body.energy_kwh ?? null,

//     // Power Factor
//     power_factor: body.powerFactor ?? body.power_factor ?? null,
//     pf_a: body.powerFactorL1 ?? body.pf_a ?? null,
//     pf_b: body.powerFactorL2 ?? body.pf_b ?? null,
//     pf_c: body.powerFactorL3 ?? body.pf_c ?? null,

//     // Quality
//     frequency_hz: body.frequencyHz ?? body.frequency_hz ?? null,
//     voltage_unbalance_pct: body.voltageUnbalPct ?? body.voltagePhaseUnbalancePct ?? body.voltage_unbalance_pct ?? null,
//     current_unbalance_pct: body.currentUnbalPct ?? body.current_unbalance_pct ?? null,

//     // THD Voltage
//     thd_voltage_l1_pct: body.thdVoltageL1Pct ?? body.thd_voltage_l1_pct ?? null,
//     thd_voltage_l2_pct: body.thdVoltageL2Pct ?? body.thd_voltage_l2_pct ?? null,
//     thd_voltage_l3_pct: body.thdVoltageL3Pct ?? body.thd_voltage_l3_pct ?? null,

//     // THD Current
//     thd_current_l1_pct: body.thdCurrentL1Pct ?? body.thd_current_l1_pct ?? null,
//     thd_current_l2_pct: body.thdCurrentL2Pct ?? body.thd_current_l2_pct ?? null,
//     thd_current_l3_pct: body.thdCurrentL3Pct ?? body.thd_current_l3_pct ?? null,
//   };

//   try {
//     // 1. ตรวจสอบว่า device_id มีจริงในระบบไหม
//     const { data: device, error: devErr } = await supabase
//       .from('devices')
//       .select('id, building_id')
//       .eq('id', device_id)
//       .maybeSingle();

//     if (devErr) throw devErr;
//     if (!device) {
//       return res.status(404).json({ message: `ไม่พบ device_id: ${device_id} ในระบบ` });
//     }

//     // 2. Insert ข้อมูลลงตาราง energy_readings ใน Supabase
//     const { data: savedReading, error: insertErr } = await supabase
//       .from('energy_readings')
//       .insert([payload])
//       .select()
//       .single();

//     if (insertErr) throw insertErr;

//     return res.status(201).json({
//       message: 'บันทึกข้อมูลสำเร็จ',
//       reading: savedReading
//     });

//   } catch (err) {
//     console.error('❌ Error in POST /api/readings:', err);
//     return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', error: err.message });
//   }
// });

// // -----------------------------------------------------------------------------
// // GET /api/readings/chart — ดึงข้อมูลใส่ ActivePowerChart (ดึงทั้งวัน)
// // -----------------------------------------------------------------------------
// router.get('/chart', async (req, res) => {
//   const { device_id } = req.query;
//   if (!device_id) return res.status(400).json({ message: 'กรุณาระบุ device_id' });

//   try {
//     const now = new Date();
//     const thaiDateStr = new Date(now.getTime() + 7 * 3600 * 1000).toISOString().split('T')[0];
//     const startOfToday = `${thaiDateStr}T00:00:00+07:00`;

//     // ดึงทีละ 1000 แถวจนหมด
//     const PAGE = 1000;
//     let from = 0;
//     let rows = [];
//     while (true) {
//       const { data, error } = await supabase
//         .from('energy_readings')
//         .select('reading_time, power_kw')
//         .eq('device_id', device_id)
//         .gte('reading_time', startOfToday)
//         .order('reading_time', { ascending: true })
//         .range(from, from + PAGE - 1);

//       if (error) throw error;
//       rows = rows.concat(data || []);
//       if (!data || data.length < PAGE) break;
//       from += PAGE;
//     }

//     // รวมเป็น 1 ค่า/นาที (ใช้ค่าล่าสุดของนาทีนั้น)
//     const perMinute = new Map();
//     for (const item of rows) {
//       const t = new Date(new Date(item.reading_time).getTime() + 7 * 3600 * 1000);
//       const label = `${String(t.getUTCHours()).padStart(2, '0')}:${String(t.getUTCMinutes()).padStart(2, '0')}`;
//       perMinute.set(label, Number(item.power_kw ?? 0));
//     }

//     res.json([...perMinute].map(([label, cost]) => ({ label, cost })));
//   } catch (err) {
//     console.error('❌ Error in GET /api/readings/chart:', err);
//     res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล', error: err.message });
//   }
// });

// module.exports = router;


// routes/readings.js
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const authenticateDevice = require('../middleware/deviceAuth');

const router = express.Router();

// สร้าง Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ✅ ฟังก์ชันสร้าง ISO String เวลาไทย (+07:00) อย่างถูกต้อง
function getThaiTime() {
  const now = new Date();
  // ปรับเป็นเวลาท้องถิ่นไทย
  const thaiString = now.toLocaleString('sv-SE', { timeZone: 'Asia/Bangkok' }); // ได้รูปแบบ "YYYY-MM-DD HH:mm:ss"
  return `${thaiString.replace(' ', 'T')}.000+07:00`;
}

// -----------------------------------------------------------------------------
// GET /api/readings — ดึงประวัติค่าไฟดิบจาก Supabase
// -----------------------------------------------------------------------------
router.get('/', async (req, res) => {
  const { device_id, from, to, limit = 100, page = 1 } = req.query;

  try {
    const safeLimit = Math.min(parseInt(limit, 10) || 100, 1000);
    const currentPage = Math.max(parseInt(page, 10) || 1, 1);
    const offset = (currentPage - 1) * safeLimit;

    let query = supabase
      .from('energy_readings')
      .select('*')
      .order('reading_time', { ascending: false })
      .range(offset, offset + safeLimit - 1);

    if (device_id) query = query.eq('device_id', device_id);
    if (from) query = query.gte('reading_time', from);
    if (to) query = query.lte('reading_time', to);

    const { data, error } = await query;

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('❌ Error in GET /api/readings:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล', error: err.message });
  }
});

// -----------------------------------------------------------------------------
// GET /api/readings/energy — พลังงานที่ใช้ (kWh) แยกตามช่วงเวลา
// -----------------------------------------------------------------------------
router.get('/energy', async (req, res) => {
  const { device_id, range = 'Day', date } = req.query;
  if (!device_id) return res.status(400).json({ message: 'กรุณาระบุ device_id' });

  try {
    const base = date ? new Date(date) : new Date();
    // ดึงวันที่ ณ เวลาไทย
    const thaiDateStr = base.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' }); // "YYYY-MM-DD"
    const [y, m, d] = thaiDateStr.split('-').map(Number);
    const pad = (n) => String(n).padStart(2, '0');

    let start, end, groupBy;
    if (range === 'Day') {
      start = `${y}-${pad(m)}-${pad(d)}T00:00:00+07:00`;
      end = `${y}-${pad(m)}-${pad(d)}T23:59:59+07:00`;
      groupBy = 'hour';
    } else if (range === 'Month') {
      const last = new Date(y, m, 0).getDate();
      start = `${y}-${pad(m)}-01T00:00:00+07:00`;
      end = `${y}-${pad(m)}-${pad(last)}T23:59:59+07:00`;
      groupBy = 'day';
    } else if (range === 'Year') {
      start = `${y}-01-01T00:00:00+07:00`;
      end = `${y}-12-31T23:59:59+07:00`;
      groupBy = 'month';
    } else {
      start = '2000-01-01T00:00:00+07:00';
      end = `${y}-${pad(m)}-${pad(d)}T23:59:59+07:00`;
      groupBy = 'month';
    }

    let all = [];
    let page = 0;
    const pageSize = 1000;
    while (true) {
      const { data, error } = await supabase
        .from('energy_readings')
        .select('reading_time, energy_kwh')
        .eq('device_id', device_id)
        .gte('reading_time', start)
        .lte('reading_time', end)
        .not('energy_kwh', 'is', null)
        .order('reading_time', { ascending: true })
        .range(page * pageSize, page * pageSize + pageSize - 1);

      if (error) throw error;
      if (!data || data.length === 0) break;
      all = all.concat(data);
      if (data.length < pageSize) break;
      page++;
    }

    const groups = {};
    for (const r of all) {
      const dateObj = new Date(r.reading_time);
      // แปลงเป็น ISO string ใน Timezone ไทย
      const thaiIso = dateObj.toLocaleString('sv-SE', { timeZone: 'Asia/Bangkok' }); // "YYYY-MM-DD HH:mm:ss"
      
      let key;
      if (groupBy === 'hour') key = `${thaiIso.slice(11, 13)}:00`;
      else if (groupBy === 'day') key = `${thaiIso.slice(8, 10)}/${thaiIso.slice(5, 7)}`;
      else key = thaiIso.slice(0, 7);

      const v = Number(r.energy_kwh);
      if (!groups[key]) groups[key] = { min: v, max: v };
      else {
        groups[key].min = Math.min(groups[key].min, v);
        groups[key].max = Math.max(groups[key].max, v);
      }
    }

    const result = Object.keys(groups).sort().map((k) => ({
      label: k,
      energy: Number(Math.max(0, groups[k].max - groups[k].min).toFixed(2)),
    }));

    res.json(result);
  } catch (err) {
    console.error('❌ Error in GET /api/readings/energy:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล', error: err.message });
  }
});

// -----------------------------------------------------------------------------
// GET /api/readings/latest — ดึงค่าล่าสุด + หน่วยไฟฟ้าวันนี้
// -----------------------------------------------------------------------------
router.get('/latest', async (req, res) => {
  const { device_id } = req.query;
  if (!device_id) {
    return res.status(400).json({ message: 'กรุณาระบุ device_id' });
  }

  try {
    // 1. ดึง Reading ล่าสุด
    const { data: latestData, error: latestErr } = await supabase
      .from('energy_readings')
      .select('*')
      .eq('device_id', device_id)
      .order('reading_time', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestErr) throw latestErr;
    if (!latestData) return res.json(null);

    // 2. หาวันที่ปัจจุบัน (เวลาไทย)
    const thaiDateStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
    const startOfToday = `${thaiDateStr}T00:00:00+07:00`;

    // 3. ดึง Reading แรกของวันนี้
    const { data: startDayData, error: startDayErr } = await supabase
      .from('energy_readings')
      .select('energy_kwh')
      .eq('device_id', device_id)
      .gte('reading_time', startOfToday)
      .order('reading_time', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (startDayErr) throw startDayErr;

    const currentEnergy = Number(latestData.energy_kwh) || 0;
    const startOfDayEnergy = startDayData?.energy_kwh != null
      ? Number(startDayData.energy_kwh)
      : currentEnergy;

    const dailyEnergyKwh = Math.max(0, currentEnergy - startOfDayEnergy);

    // 4. ดึงข้อมูลอุปกรณ์
    const { data: dev, error: devErr } = await supabase
      .from('devices')
      .select('voltage_min, voltage_max, nominal_voltage, voltage_basis')
      .eq('id', device_id)
      .maybeSingle();

    if (devErr) throw devErr;

    const nominal = Number(dev?.nominal_voltage) || 230;

    res.json({
      ...latestData,
      voltage_basis: dev?.voltage_basis ?? 'LN',
      nominal_voltage: nominal,
      voltage_min: dev?.voltage_min != null ? Number(dev.voltage_min) : Math.round(nominal * 0.9),
      voltage_max: dev?.voltage_max != null ? Number(dev.voltage_max) : Math.round(nominal * 1.1),
      energy_start_of_day_kwh: startOfDayEnergy,
      daily_energy_kwh: Number(dailyEnergyKwh.toFixed(2)),
    });
  } catch (err) {
    console.error('❌ Error in GET /api/readings/latest:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ', error: err.message });
  }
});

// -----------------------------------------------------------------------------
// POST /api/readings — รับค่าจาก ESP32 บันทึกลง Supabase
// -----------------------------------------------------------------------------
router.post('/', authenticateDevice, async (req, res) => {
  const body = req.body;
  const device_id = body.device_id;

  if (!device_id) {
    return res.status(400).json({ message: 'กรุณาระบุ device_id' });
  }

  const payload = {
    device_id,
    reading_time: body.reading_time || getThaiTime(),

    // Voltage
    voltage_system: body.voltageSystemV ?? body.voltage_system ?? null,
    voltage_a: body.voltageL1V ?? body.voltage_a ?? body.voltageSystemV ?? null,
    voltage_b: body.voltageL2V ?? body.voltage_b ?? null,
    voltage_c: body.voltageL3V ?? body.voltage_c ?? null,

    // Current
    current_system: body.currentSystemA ?? body.current_system ?? null,
    current_a: body.currentL1A ?? body.current_a ?? body.currentSystemA ?? null,
    current_b: body.currentL2A ?? body.current_b ?? null,
    current_c: body.currentL3A ?? body.current_c ?? null,

    // Power
    power_kw: body.realPowerKw ?? body.power_kw ?? null,
    power_a: body.realPowerL1Kw ?? body.power_a ?? null,
    power_b: body.realPowerL2Kw ?? body.power_b ?? null,
    power_c: body.realPowerL3Kw ?? body.power_c ?? null,
    energy_kwh: body.energyKwh ?? body.energy_kwh ?? null,

    // Power Factor
    power_factor: body.powerFactor ?? body.power_factor ?? null,
    pf_a: body.powerFactorL1 ?? body.pf_a ?? null,
    pf_b: body.powerFactorL2 ?? body.pf_b ?? null,
    pf_c: body.powerFactorL3 ?? body.pf_c ?? null,

    // Quality
    frequency_hz: body.frequencyHz ?? body.frequency_hz ?? null,
    voltage_unbalance_pct: body.voltageUnbalPct ?? body.voltagePhaseUnbalancePct ?? body.voltage_unbalance_pct ?? null,
    current_unbalance_pct: body.currentUnbalPct ?? body.current_unbalance_pct ?? null,

    // THD Voltage
    thd_voltage_l1_pct: body.thdVoltageL1Pct ?? body.thd_voltage_l1_pct ?? null,
    thd_voltage_l2_pct: body.thdVoltageL2Pct ?? body.thd_voltage_l2_pct ?? null,
    thd_voltage_l3_pct: body.thdVoltageL3Pct ?? body.thd_voltage_l3_pct ?? null,

    // THD Current
    thd_current_l1_pct: body.thdCurrentL1Pct ?? body.thd_current_l1_pct ?? null,
    thd_current_l2_pct: body.thdCurrentL2Pct ?? body.thd_current_l2_pct ?? null,
    thd_current_l3_pct: body.thdCurrentL3Pct ?? body.thd_current_l3_pct ?? null,
  };

  try {
    const { data: device, error: devErr } = await supabase
      .from('devices')
      .select('id, building_id')
      .eq('id', device_id)
      .maybeSingle();

    if (devErr) throw devErr;
    if (!device) {
      return res.status(404).json({ message: `ไม่พบ device_id: ${device_id} ในระบบ` });
    }

    const { data: savedReading, error: insertErr } = await supabase
      .from('energy_readings')
      .insert([payload])
      .select()
      .single();

    if (insertErr) throw insertErr;

    return res.status(201).json({
      message: 'บันทึกข้อมูลสำเร็จ',
      reading: savedReading
    });
  } catch (err) {
    console.error('❌ Error in POST /api/readings:', err);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', error: err.message });
  }
});

// -----------------------------------------------------------------------------
// GET /api/readings/chart — ดึงข้อมูลใส่ ActivePowerChart (ดึงทั้งวัน)
// -----------------------------------------------------------------------------
router.get('/chart', async (req, res) => {
  const { device_id } = req.query;
  if (!device_id) return res.status(400).json({ message: 'กรุณาระบุ device_id' });

  try {
    const thaiDateStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
    const startOfToday = `${thaiDateStr}T00:00:00+07:00`;

    const PAGE = 1000;
    let from = 0;
    let rows = [];
    while (true) {
      const { data, error } = await supabase
        .from('energy_readings')
        .select('reading_time, power_kw')
        .eq('device_id', device_id)
        .gte('reading_time', startOfToday)
        .order('reading_time', { ascending: true })
        .range(from, from + PAGE - 1);

      if (error) throw error;
      rows = rows.concat(data || []);
      if (!data || data.length < PAGE) break;
      from += PAGE;
    }

    const perMinute = new Map();
    for (const item of rows) {
      const thaiIso = new Date(item.reading_time).toLocaleString('sv-SE', { timeZone: 'Asia/Bangkok' });
      const label = thaiIso.slice(11, 16); // "HH:mm"
      perMinute.set(label, Number(item.power_kw ?? 0));
    }

    res.json([...perMinute].map(([label, cost]) => ({ label, cost })));
  } catch (err) {
    console.error('❌ Error in GET /api/readings/chart:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล', error: err.message });
  }
});

module.exports = router;