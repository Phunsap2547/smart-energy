
const express = require('express');
const pool = require('../scripts/db');
const authenticateDevice = require('../middleware/deviceAuth');

const router = express.Router();

// ---- Threshold config (rule-based, ใช้ก่อนมีโมเดล ML) ----
const THRESHOLDS = {
  voltage: { nominal: 220, dropPct: 0.15, surgePct: 0.15 },
  currentOverloadA: 100,
  currentSpikeRatio: 3,
  powerOutageVoltage: 10,
};

function detectAnomalies(reading, lastAvg) {
  const { voltage_a, voltage_b, voltage_c, current_a, current_b, current_c } = reading;
  const voltages = [voltage_a, voltage_b, voltage_c].filter(v => v !== null && v !== undefined);
  const currents = [current_a, current_b, current_c].filter(v => v !== null && v !== undefined);
  const found = [];

  if (voltages.length > 0 && voltages.every(v => v < THRESHOLDS.powerOutageVoltage)) {
    found.push({ type: 'power_outage', severity: 'critical', description: 'ตรวจพบแรงดันไฟฟ้าหายทุกเฟส คาดว่าไฟดับ' });
    return found;
  }

  const nominal = THRESHOLDS.voltage.nominal;
  const phaseLabels = { voltage_a: 'A', voltage_b: 'B', voltage_c: 'C' };
  for (const key of ['voltage_a', 'voltage_b', 'voltage_c']) {
    const v = reading[key];
    if (v === null || v === undefined) continue;
    if (v < nominal * (1 - THRESHOLDS.voltage.dropPct)) {
      found.push({ type: 'voltage_drop', severity: 'high', description: `แรงดันเฟส ${phaseLabels[key]} ต่ำผิดปกติ (${v}V)` });
    } else if (v > nominal * (1 + THRESHOLDS.voltage.surgePct)) {
      found.push({ type: 'voltage_surge', severity: 'high', description: `แรงดันเฟส ${phaseLabels[key]} สูงผิดปกติ (${v}V)` });
    }
  }

  const currentLabels = { current_a: 'A', current_b: 'B', current_c: 'C' };
  for (const key of ['current_a', 'current_b', 'current_c']) {
    const c = reading[key];
    if (c === null || c === undefined) continue;
    if (c > THRESHOLDS.currentOverloadA) {
      found.push({ type: 'overload', severity: 'high', description: `กระแสเฟส ${currentLabels[key]} เกินพิกัด (${c}A)` });
    }
  }

  if (lastAvg && currents.length > 0) {
    const maxCurrent = Math.max(...currents);
    if (lastAvg > 0 && maxCurrent > lastAvg * THRESHOLDS.currentSpikeRatio) {
      found.push({ type: 'short_circuit', severity: 'critical', description: `กระแสพุ่งกะทันหัน (${maxCurrent}A เทียบค่าเฉลี่ย ${lastAvg.toFixed(1)}A)` });
    }
  }

  return found;
}

const RANK_TO_BUILDING_STATUS = { 
  0: 'normal', 
  1: 'warning', 
  2: 'warning', 
  3: 'critical' 
};
// GET /api/readings
router.get('/', async (req, res) => {
  const { device_id, from, to, limit = 100, page = 1 } = req.query;

  try {
    const conditions = [];
    const values = [];
    let idx = 1;

    if (device_id) {
      conditions.push(`device_id = $${idx++}`);
      values.push(device_id);
    }
    if (from) {
      conditions.push(`reading_time >= $${idx++}`);
      values.push(from);
    }
    if (to) {
      conditions.push(`reading_time <= $${idx++}`);
      values.push(to);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const safeLimit = Math.min(parseInt(limit, 10) || 100, 1000);
    const offset = (Math.max(parseInt(page, 10) || 1, 1) - 1) * safeLimit;

    const limitIdx = idx++;
    const offsetIdx = idx++;
    values.push(safeLimit, offset);

    const result = await pool.query(
      `SELECT * FROM energy_readings ${where}
       ORDER BY reading_time DESC
       LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      values
    );

    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error in GET /api/readings:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ', error: err.message });
  }
});

// GET /api/readings/latest
router.get('/latest', async (req, res) => {
  const { device_id } = req.query;

  if (!device_id) {
    return res.status(400).json({ message: 'กรุณาระบุ device_id' });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM energy_readings WHERE device_id = $1
       ORDER BY reading_time DESC LIMIT 1`,
      [device_id]
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    console.error('❌ Error in GET /api/readings/latest:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ', error: err.message });
  }
});

// // POST /api/readings
// router.post('/', authenticateDevice, async (req, res) => {
//   const {
//     device_id, voltage_a, voltage_b, voltage_c,
//     current_a, current_b, current_c,
//     power_kw, energy_kwh, reading_time,
//   } = req.body;

//   if (!device_id) {
//     return res.status(400).json({ message: 'กรุณาระบุ device_id' });
//   }

//   const client = await pool.connect();
//   try {
//     await client.query('BEGIN');

//     // 1) เช็คว่า device มีอยู่จริง
//     const deviceResult = await client.query(
//       'SELECT id, building_id FROM devices WHERE id = $1',
//       [device_id]
//     );
//     if (deviceResult.rows.length === 0) {
//       await client.query('ROLLBACK');
//       return res.status(404).json({ message: `ไม่พบ device_id: ${device_id} ในระบบ` });
//     }
//     const buildingId = deviceResult.rows[0].building_id;

//     // 2) ค่าเฉลี่ยกระแสล่าสุด 5 รายการ
//     const avgResult = await client.query(
//       `SELECT AVG(GREATEST(current_a, current_b, current_c)) as avg_current
//        FROM (
//          SELECT current_a, current_b, current_c FROM energy_readings
//          WHERE device_id = $1 ORDER BY reading_time DESC LIMIT 5
//        ) recent`,
//       [device_id]
//     );
//     const lastAvg = avgResult.rows[0].avg_current !== null ? Number(avgResult.rows[0].avg_current) : null;

//     // 3) Insert reading (ปรับปรุงเวลาถ้าไม่ได้ส่งมาให้ใช้เวลาปัจจุบัน)
//     const timeValue = reading_time || new Date();
//     const insertResult = await client.query(
//       `INSERT INTO energy_readings
//         (device_id, reading_time, voltage_a, voltage_b, voltage_c, current_a, current_b, current_c, power_kw, energy_kwh)
//        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
//        RETURNING *`,
//       [device_id, timeValue, voltage_a, voltage_b, voltage_c, current_a, current_b, current_c, power_kw, energy_kwh]
//     );
//     const reading = insertResult.rows[0];

//     // 4) Detect anomalies
//     const anomaliesFound = detectAnomalies(req.body, lastAvg);
//     const insertedAnomalies = [];
//     for (const a of anomaliesFound) {
//       const r = await client.query(
//         `INSERT INTO anomalies (device_id, type, severity, description)
//          VALUES ($1, $2, $3, $4) RETURNING *`,
//         [device_id, a.type, a.severity, a.description]
//       );
//       insertedAnomalies.push(r.rows[0]);
//     }

//     // 5) คำนวณ status อาคาร
//     const rankResult = await client.query(
//       `SELECT COALESCE(MAX(
//          CASE a.severity
//            WHEN 'critical' THEN 3
//            WHEN 'high' THEN 2
//            ELSE 1
//          END
//        ), 0) as max_rank
//        FROM anomalies a
//        JOIN devices d ON d.id = a.device_id
//        WHERE d.building_id = $1 AND a.status = 'open'`,
//       [buildingId]
//     );
//     const maxRank = Number(rankResult.rows[0].max_rank);
//     const newStatus = RANK_TO_BUILDING_STATUS[maxRank] || 'Normal';

//     await client.query(
//       'UPDATE buildings SET status = $1 WHERE id = $2',
//       [newStatus, buildingId]
//     );

//     await client.query('COMMIT');

//     res.status(201).json({
//       reading,
//       anomalies: insertedAnomalies,
//       building_status: newStatus,
//     });
//   } catch (err) {
//     await client.query('ROLLBACK');
//     console.error('❌ Error in POST /api/readings:', err);
//     res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ', error: err.message });
//   } finally {
//     client.release();
//   }
// });



// POST /api/readings — เน้นบันทึกข้อมูลก่อนเพื่อสะสมให้ ML
router.post('/', authenticateDevice, async (req, res) => {
  const {
    device_id, voltage_a, voltage_b, voltage_c,
    current_a, current_b, current_c,
    power_kw, energy_kwh, reading_time,
  } = req.body;

  // if (!device_id) {
  //   return res.status(400).json({ message: 'กรุณาระบุ device_id' });
  // }

  const client = await pool.connect();
  let savedReading = null;

  try {
    // -----------------------------------------------------------------
    // STEP 1: บันทึกข้อมูล Energy Reading ลง DB ทันที (Data-First)
    // -----------------------------------------------------------------
    await client.query('BEGIN');

    // ตรวจสอบเบื้องต้นว่ามี Device นี้ไหม
    const deviceResult = await client.query(
      'SELECT id, building_id FROM devices WHERE id = $1',
      [device_id]
    );

    if (deviceResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: `ไม่พบ device_id: ${device_id} ในระบบ` });
    }

    const buildingId = deviceResult.rows[0].building_id;
    const timeValue = reading_time || new Date();

    // บันทึก Reading ทันที!
    const insertResult = await client.query(
      `INSERT INTO energy_readings
        (device_id, reading_time, voltage_a, voltage_b, voltage_c, current_a, current_b, current_c, power_kw, energy_kwh)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [device_id, timeValue, voltage_a, voltage_b, voltage_c, current_a, current_b, current_c, power_kw, energy_kwh]
    );

    savedReading = insertResult.rows[0];
    
    // Commit ขั้นแรกทันทีเพื่อการันตีว่าข้อมูล ML ไม่หายแน่นอน
    await client.query('COMMIT');

    // -----------------------------------------------------------------
    // STEP 2: Logic วิเคราะห์ Anomaly (ครอบ try-catch แยกไว้ ถ้าพังก็ไม่กระทบ Reading)
    // -----------------------------------------------------------------
    let insertedAnomalies = [];
    let newStatus = 'normal';

    try {
      await client.query('BEGIN');

      // 2.1 หาค่าเฉลี่ยย้อนหลัง
      const avgResult = await client.query(
        `SELECT AVG(GREATEST(current_a, current_b, current_c)) as avg_current
         FROM (
           SELECT current_a, current_b, current_c FROM energy_readings
           WHERE device_id = $1 ORDER BY reading_time DESC LIMIT 5
         ) recent`,
        [device_id]
      );
      const lastAvg = avgResult.rows[0].avg_current !== null ? Number(avgResult.rows[0].avg_current) : null;

      // 2.2 ตรวจ Anomaly แบบ Rule-based
      const anomaliesFound = detectAnomalies(req.body, lastAvg);
      for (const a of anomaliesFound) {
        const r = await client.query(
          `INSERT INTO anomalies (device_id, type, severity, description)
           VALUES ($1, $2, $3, $4) RETURNING *`,
          [device_id, a.type, a.severity, a.description]
        );
        insertedAnomalies.push(r.rows[0]);
      }

      // 2.3 อัปเดต Status อาคาร
      const rankResult = await client.query(
        `SELECT COALESCE(MAX(
           CASE a.severity
             WHEN 'critical' THEN 3
             WHEN 'high' THEN 2
             ELSE 1
           END
         ), 0) as max_rank
         FROM anomalies a
         JOIN devices d ON d.id = a.device_id
         WHERE d.building_id = $1 AND a.status = 'open'`,
        [buildingId]
      );
      const maxRank = Number(rankResult.rows[0].max_rank);
      newStatus = RANK_TO_BUILDING_STATUS[maxRank] || 'normal';

      await client.query(
        'UPDATE buildings SET status = $1 WHERE id = $2',
        [newStatus, buildingId]
      );

      await client.query('COMMIT');
    } catch (anomalyErr) {
      // หากเกิดข้อผิดพลาดในการตรวจ anomaly ให้ Rollback แค่ส่วนนี้ แล้ว Log บอกผู้พัฒนา
      await client.query('ROLLBACK');
      console.error('⚠️ Anomaly detection process failed, but reading was saved:', anomalyErr.message);
    }

    // ตอบกลับ API Success พร้อมส่งข้อมูล Reading ที่เซฟสำเร็จกลับไป
    return res.status(201).json({
      reading: savedReading,
      anomalies: insertedAnomalies,
      building_status: newStatus,
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error saving energy reading:', err);
    return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', error: err.message });
  } finally {
    client.release();
  }
});


module.exports = router;

