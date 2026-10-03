
// const express = require('express');
// const pool = require('../scripts/db');
// const authenticateDevice = require('../middleware/deviceAuth');

// const router = express.Router();

// // ---- Threshold config (rule-based, ใช้ก่อนมีโมเดล ML) ----
// const THRESHOLDS = {
//   voltage: { nominal: 220, dropPct: 0.15, surgePct: 0.15 },
//   currentOverloadA: 100,
//   currentSpikeRatio: 3,
//   powerOutageVoltage: 10,
// };

// function detectAnomalies(reading, lastAvg) {
//   const { voltage_a, voltage_b, voltage_c, current_a, current_b, current_c } = reading;
//   const voltages = [voltage_a, voltage_b, voltage_c].filter(v => v !== null && v !== undefined);
//   const currents = [current_a, current_b, current_c].filter(v => v !== null && v !== undefined);
//   const found = [];

//   if (voltages.length > 0 && voltages.every(v => v < THRESHOLDS.powerOutageVoltage)) {
//     found.push({ type: 'power_outage', severity: 'critical', description: 'ตรวจพบแรงดันไฟฟ้าหายทุกเฟส คาดว่าไฟดับ' });
//     return found;
//   }

//   const nominal = THRESHOLDS.voltage.nominal;
//   const phaseLabels = { voltage_a: 'A', voltage_b: 'B', voltage_c: 'C' };
//   for (const key of ['voltage_a', 'voltage_b', 'voltage_c']) {
//     const v = reading[key];
//     if (v === null || v === undefined) continue;
//     if (v < nominal * (1 - THRESHOLDS.voltage.dropPct)) {
//       found.push({ type: 'voltage_drop', severity: 'high', description: `แรงดันเฟส ${phaseLabels[key]} ต่ำผิดปกติ (${v}V)` });
//     } else if (v > nominal * (1 + THRESHOLDS.voltage.surgePct)) {
//       found.push({ type: 'voltage_surge', severity: 'high', description: `แรงดันเฟส ${phaseLabels[key]} สูงผิดปกติ (${v}V)` });
//     }
//   }

//   const currentLabels = { current_a: 'A', current_b: 'B', current_c: 'C' };
//   for (const key of ['current_a', 'current_b', 'current_c']) {
//     const c = reading[key];
//     if (c === null || c === undefined) continue;
//     if (c > THRESHOLDS.currentOverloadA) {
//       found.push({ type: 'overload', severity: 'high', description: `กระแสเฟส ${currentLabels[key]} เกินพิกัด (${c}A)` });
//     }
//   }

//   if (lastAvg && currents.length > 0) {
//     const maxCurrent = Math.max(...currents);
//     if (lastAvg > 0 && maxCurrent > lastAvg * THRESHOLDS.currentSpikeRatio) {
//       found.push({ type: 'short_circuit', severity: 'critical', description: `กระแสพุ่งกะทันหัน (${maxCurrent}A เทียบค่าเฉลี่ย ${lastAvg.toFixed(1)}A)` });
//     }
//   }

//   return found;
// }

// const RANK_TO_BUILDING_STATUS = { 
//   0: 'normal', 
//   1: 'warning', 
//   2: 'warning', 
//   3: 'critical' 
// };
// // GET /api/readings
// router.get('/', async (req, res) => {
//   const { device_id, from, to, limit = 100, page = 1 } = req.query;

//   try {
//     const conditions = [];
//     const values = [];
//     let idx = 1;

//     if (device_id) {
//       conditions.push(`device_id = $${idx++}`);
//       values.push(device_id);
//     }
//     if (from) {
//       conditions.push(`reading_time >= $${idx++}`);
//       values.push(from);
//     }
//     if (to) {
//       conditions.push(`reading_time <= $${idx++}`);
//       values.push(to);
//     }

//     const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
//     const safeLimit = Math.min(parseInt(limit, 10) || 100, 1000);
//     const offset = (Math.max(parseInt(page, 10) || 1, 1) - 1) * safeLimit;

//     const limitIdx = idx++;
//     const offsetIdx = idx++;
//     values.push(safeLimit, offset);

//     const result = await pool.query(
//       `SELECT * FROM energy_readings ${where}
//        ORDER BY reading_time DESC
//        LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
//       values
//     );

//     res.json(result.rows);
//   } catch (err) {
//     console.error('❌ Error in GET /api/readings:', err);
//     res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ', error: err.message });
//   }
// });

// // // GET /api/readings/latest
// // router.get('/latest', async (req, res) => {
// //   const { device_id } = req.query;

// //   if (!device_id) {
// //     return res.status(400).json({ message: 'กรุณาระบุ device_id' });
// //   }

// //   try {
// //     const result = await pool.query(
// //       `SELECT * FROM energy_readings WHERE device_id = $1
// //        ORDER BY reading_time DESC LIMIT 1`,
// //       [device_id]
// //     );
// //     res.json(result.rows[0] || null);
// //   } catch (err) {
// //     console.error('❌ Error in GET /api/readings/latest:', err);
// //     res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ', error: err.message });
// //   }
// // });

// // GET /api/readings/latest
// router.get('/latest', async (req, res) => {
//   const { device_id } = req.query;

//   if (!device_id) {
//     return res.status(400).json({ message: 'กรุณาระบุ device_id' });
//   }

//   try {
//     // 1. ดึงข้อมูลล่าสุด (Latest Reading)
//     const latestResult = await pool.query(
//       `SELECT * FROM energy_readings WHERE device_id = $1
//        ORDER BY reading_time DESC LIMIT 1`,
//       [device_id]
//     );

//     const latestReading = latestResult.rows[0];

//     if (!latestReading) {
//       return res.json(null);
//     }

//     // 2. หาวันเวลาเริ่มต้นของวันนี้ (00:00:00 น. เวลาไทย UTC+7)
//     const now = new Date();
//     const thaiDateStr = new Date(now.getTime() + (7 * 60 * 60 * 1000))
//       .toISOString()
//       .split('T')[0];
//     const startOfToday = `${thaiDateStr}T00:00:00`;

//     // 3. ดึงค่า energy_kwh แถวแรกสุดที่เกิดขึ้นตั้งแต่เที่ยงคืนของวันนี้
//     const startOfDayResult = await pool.query(
//       `SELECT energy_kwh FROM energy_readings
//        WHERE device_id = $1 AND reading_time >= $2
//        ORDER BY reading_time ASC LIMIT 1`,
//       [device_id, startOfToday]
//     );

//     // 4. คำนวณหน่วยไฟฟ้าที่ใช้ไปในวันนี้ (ลบค่า ณ เที่ยงคืน)
//     const currentEnergy = Number(latestReading.energy_kwh) || 0;
//     const startOfDayEnergy = startOfDayResult.rows[0]?.energy_kwh != null
//       ? Number(startOfDayResult.rows[0].energy_kwh)
//       : currentEnergy;

//     const dailyEnergyKwh = Math.max(0, currentEnergy - startOfDayEnergy);

//     // 5. ส่ง Response รวมค่าที่คำนวณเรียบร้อยแล้วกลับไป
//     res.json({
//       ...latestReading,
//       energy_start_of_day_kwh: startOfDayEnergy,
//       daily_energy_kwh: dailyEnergyKwh,
//     });
//   } catch (err) {
//     console.error('❌ Error in GET /api/readings/latest:', err);
//     res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ', error: err.message });
//   }
// });

// // POST /api/readings — เน้นบันทึกข้อมูลก่อนเพื่อสะสมให้ ML
// router.post('/', authenticateDevice, async (req, res) => {
//   const {
//     device_id, voltage_a, voltage_b, voltage_c,
//     current_a, current_b, current_c,
//     power_kw, energy_kwh, reading_time,
//   } = req.body;

//   // if (!device_id) {
//   //   return res.status(400).json({ message: 'กรุณาระบุ device_id' });
//   // }

//   const client = await pool.connect();
//   let savedReading = null;

//   try {
//     // -----------------------------------------------------------------
//     // STEP 1: บันทึกข้อมูล Energy Reading ลง DB ทันที (Data-First)
//     // -----------------------------------------------------------------
//     await client.query('BEGIN');

//     // ตรวจสอบเบื้องต้นว่ามี Device นี้ไหม
//     const deviceResult = await client.query(
//       'SELECT id, building_id FROM devices WHERE id = $1',
//       [device_id]
//     );

//     if (deviceResult.rows.length === 0) {
//       await client.query('ROLLBACK');
//       return res.status(404).json({ message: `ไม่พบ device_id: ${device_id} ในระบบ` });
//     }

//     const buildingId = deviceResult.rows[0].building_id;
//     const timeValue = reading_time || new Date();

//     // บันทึก Reading ทันที!
//     const insertResult = await client.query(
//       `INSERT INTO energy_readings
//         (device_id, reading_time, voltage_a, voltage_b, voltage_c, current_a, current_b, current_c, power_kw, energy_kwh)
//        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
//        RETURNING *`,
//       [device_id, timeValue, voltage_a, voltage_b, voltage_c, current_a, current_b, current_c, power_kw, energy_kwh]
//     );

//     savedReading = insertResult.rows[0];
    
//     // Commit ขั้นแรกทันทีเพื่อการันตีว่าข้อมูล ML ไม่หายแน่นอน
//     await client.query('COMMIT');

//     // -----------------------------------------------------------------
//     // STEP 2: Logic วิเคราะห์ Anomaly (ครอบ try-catch แยกไว้ ถ้าพังก็ไม่กระทบ Reading)
//     // -----------------------------------------------------------------
//     let insertedAnomalies = [];
//     let newStatus = 'normal';

//     try {
//       await client.query('BEGIN');

//       // 2.1 หาค่าเฉลี่ยย้อนหลัง
//       const avgResult = await client.query(
//         `SELECT AVG(GREATEST(current_a, current_b, current_c)) as avg_current
//          FROM (
//            SELECT current_a, current_b, current_c FROM energy_readings
//            WHERE device_id = $1 ORDER BY reading_time DESC LIMIT 5
//          ) recent`,
//         [device_id]
//       );
//       const lastAvg = avgResult.rows[0].avg_current !== null ? Number(avgResult.rows[0].avg_current) : null;

//       // 2.2 ตรวจ Anomaly แบบ Rule-based
//       const anomaliesFound = detectAnomalies(req.body, lastAvg);
//       for (const a of anomaliesFound) {
//         const r = await client.query(
//           `INSERT INTO anomalies (device_id, type, severity, description)
//            VALUES ($1, $2, $3, $4) RETURNING *`,
//           [device_id, a.type, a.severity, a.description]
//         );
//         insertedAnomalies.push(r.rows[0]);
//       }

//       // 2.3 อัปเดต Status อาคาร
//       const rankResult = await client.query(
//         `SELECT COALESCE(MAX(
//            CASE a.severity
//              WHEN 'critical' THEN 3
//              WHEN 'high' THEN 2
//              ELSE 1
//            END
//          ), 0) as max_rank
//          FROM anomalies a
//          JOIN devices d ON d.id = a.device_id
//          WHERE d.building_id = $1 AND a.status = 'open'`,
//         [buildingId]
//       );
//       const maxRank = Number(rankResult.rows[0].max_rank);
//       newStatus = RANK_TO_BUILDING_STATUS[maxRank] || 'normal';

//       await client.query(
//         'UPDATE buildings SET status = $1 WHERE id = $2',
//         [newStatus, buildingId]
//       );

//       await client.query('COMMIT');
//     } catch (anomalyErr) {
//       // หากเกิดข้อผิดพลาดในการตรวจ anomaly ให้ Rollback แค่ส่วนนี้ แล้ว Log บอกผู้พัฒนา
//       await client.query('ROLLBACK');
//       console.error('⚠️ Anomaly detection process failed, but reading was saved:', anomalyErr.message);
//     }

//     // ตอบกลับ API Success พร้อมส่งข้อมูล Reading ที่เซฟสำเร็จกลับไป
//     return res.status(201).json({
//       reading: savedReading,
//       anomalies: insertedAnomalies,
//       building_status: newStatus,
//     });

//   } catch (err) {
//     await client.query('ROLLBACK');
//     console.error('❌ Error saving energy reading:', err);
//     return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', error: err.message });
//   } finally {
//     client.release();
//   }
// });


// module.exports = router;

// routes/readings.js
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const authenticateDevice = require('../middleware/deviceAuth');
const axios = require('axios');

const router = express.Router();

// สร้าง Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// URL สำหรับเรียก Python ML Service
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000/predict';

function getThaiTime() {
  const now = new Date();
  return new Date(now.getTime() + (7 * 60 * 60 * 1000)).toISOString();
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
// GET /api/readings/latest — ดึงค่าล่าสุด + คำนวณ หน่วยไฟฟ้าวันนี้ (daily_energy_kwh)
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
    const now = new Date();
    const thaiDateStr = new Date(now.getTime() + (7 * 60 * 60 * 1000))
      .toISOString().split('T')[0];
    const startOfToday = `${thaiDateStr}T00:00:00`;

    // 3. ดึง Reading แรกของวันนี้เพื่อนำพลังงานมาลบกัน
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

    res.json({
      ...latestData,
      energy_start_of_day_kwh: startOfDayEnergy,
      daily_energy_kwh: Number(dailyEnergyKwh.toFixed(2)),
    });
  } catch (err) {
    console.error('❌ Error in GET /api/readings/latest:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ', error: err.message });
  }
});

// -----------------------------------------------------------------------------
// POST /api/readings — รับค่าจาก ESP32 บันทึกลง Supabase และส่งต่อไป ML API
// -----------------------------------------------------------------------------
router.post('/', authenticateDevice, async (req, res) => {
  const body = req.body;
  const device_id = body.device_id;

  if (!device_id) {
    return res.status(400).json({ message: 'กรุณาระบุ device_id' });
  }

  // Normalize ค่าจาก ESP32
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
    // 1. ตรวจสอบว่า device_id มีจริงในระบบไหม
    const { data: device, error: devErr } = await supabase
      .from('devices')
      .select('id, building_id')
      .eq('id', device_id)
      .maybeSingle();

    if (devErr) throw devErr;
    if (!device) {
      return res.status(404).json({ message: `ไม่พบ device_id: ${device_id} ในระบบ` });
    }

    // 2. Insert ข้อมูลลงตาราง energy_readings ใน Supabase
    const { data: savedReading, error: insertErr } = await supabase
      .from('energy_readings')
      .insert([payload])
      .select()
      .single();

    if (insertErr) throw insertErr;

    // 3. ส่งข้อมูลไปให้ ML API ตรวจสอบต่อแบบ Non-blocking
    axios.post(ML_SERVICE_URL, {
      device_id: payload.device_id,
      voltage_a: payload.voltage_a,
      voltage_b: payload.voltage_b,
      voltage_c: payload.voltage_c,
      current_a: payload.current_a,
      current_b: payload.current_b,
      current_c: payload.current_c,
      pf_a: payload.pf_a,
      pf_b: payload.pf_b,
      pf_c: payload.pf_c,
    }, { timeout: 3000 }).catch(err => {
      console.warn('⚠️ ML Service response delay/warning:', err.message);
    });

    return res.status(201).json({
      message: 'บันทึกข้อมูลสำเร็จ',
      reading: savedReading
    });

  } catch (err) {
    console.error('❌ Error in POST /api/readings:', err);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', error: err.message });
  }
});

module.exports = router;