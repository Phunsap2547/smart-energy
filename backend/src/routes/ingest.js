const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const verifyApiKey = require('../middleware/apiKey');

const router = express.Router();

// 1. ประกาศ Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
  realtime: { transport: null },
});

router.use(verifyApiKey);

// POST /api/ingest/readings
router.post('/readings', async (req, res) => {
  const {
    device_id, reading_time,
    voltage_a, voltage_b, voltage_c,
    current_a, current_b, current_c,
    power_kw, energy_kwh,
  } = req.body;

  if (!device_id) {
    return res.status(400).json({ message: 'กรุณาระบุ device_id' });
  }

  try {
    // 2. เปลี่ยนมา insert ลง Supabase
    const { data, error } = await supabase
      .from('energy_readings')
      .insert([
        {
          device_id,
          reading_time: reading_time || new Date().toISOString(),
          voltage_a, voltage_b, voltage_c,
          current_a, current_b, current_c,
          power_kw, energy_kwh,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    console.error('Supabase Ingest Error:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// POST /api/ingest/anomalies
router.post('/anomalies', async (req, res) => {
  const { device_id, detected_at, type, severity, description } = req.body;

  if (!device_id || !type) {
    return res.status(400).json({ message: 'กรุณาระบุ device_id และ type' });
  }

  try {
    // 3. เปลี่ยนมา insert ลง Supabase
    const { data, error } = await supabase
      .from('anomalies')
      .insert([
        {
          device_id,
          detected_at: detected_at || new Date().toISOString(),
          type,
          severity: severity || 'medium',
          description: description || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    console.error('Supabase Anomalies Error:', err);
    res.status(400).json({ message: 'ข้อมูลไม่ถูกต้อง หรือ type/severity ไม่อยู่ในรายการที่กำหนด' });
  }
});

module.exports = router;

// routes/ingest.js
// รับข้อมูลจาก IoT gateway / โมเดล ML แล้วบันทึกลง energy_readings
// ต้องแนบ header: x-api-key: <IOT_API_KEY>

// const express = require('express');
// const router = express.Router();
// const pool = require('../scripts/db');

// const NUMERIC_FIELDS = [
//   'voltage_a', 'voltage_b', 'voltage_c',
//   'current_a', 'current_b', 'current_c',
//   'power_kw', 'energy_kwh',
// ];

// function checkApiKey(req, res, next) {
//   const apiKey = req.header('x-api-key');
//   if (!apiKey || apiKey !== process.env.INGEST_API_KEY) {
//     return res.status(401).json({ status: 'error', message: 'Invalid or missing API key' });
//   }
//   next();
// }

// function validateReading(payload) {
//   const errors = [];

//   if (!payload.device_id || !Number.isInteger(Number(payload.device_id))) {
//     errors.push('device_id is required and must be an integer');
//   }

//   for (const field of NUMERIC_FIELDS) {
//     if (payload[field] !== undefined && payload[field] !== null && isNaN(Number(payload[field]))) {
//       errors.push(`${field} must be a number`);
//     }
//   }

//   if (payload.reading_time && isNaN(Date.parse(payload.reading_time))) {
//     errors.push('reading_time must be a valid ISO date string');
//   }

//   return errors;
// }

// async function insertOneReading(client, payload) {
//   const query = `
//     INSERT INTO energy_readings
//       (device_id, reading_time, voltage_a, voltage_b, voltage_c,
//        current_a, current_b, current_c, power_kw, energy_kwh)
//     VALUES ($1, COALESCE($2, NOW()), $3, $4, $5, $6, $7, $8, $9, $10)
//     RETURNING id, device_id, reading_time
//   `;
//   const values = [
//     payload.device_id,
//     payload.reading_time || null,
//     payload.voltage_a ?? null,
//     payload.voltage_b ?? null,
//     payload.voltage_c ?? null,
//     payload.current_a ?? null,
//     payload.current_b ?? null,
//     payload.current_c ?? null,
//     payload.power_kw ?? null,
//     payload.energy_kwh ?? null,
//   ];
//   const { rows } = await client.query(query, values);
//   return rows[0];
// }

// // POST /api/ingest/readings
// // body: { device_id, voltage_a, ... }  หรือ array ของ object เดียวกัน (batch)
// router.post('/readings', checkApiKey, async (req, res) => {
//   const body = req.body;
//   const isBatch = Array.isArray(body);
//   const readings = isBatch ? body : [body];

//   if (readings.length === 0) {
//     return res.status(400).json({ status: 'error', message: 'Empty payload' });
//   }
//   if (readings.length > 500) {
//     return res.status(400).json({ status: 'error', message: 'Too many readings in one batch (max 500)' });
//   }

//   const allErrors = [];
//   readings.forEach((r, idx) => {
//     const errs = validateReading(r);
//     if (errs.length) allErrors.push({ index: idx, errors: errs });
//   });
//   if (allErrors.length) {
//     return res.status(400).json({ status: 'error', message: 'Validation failed', details: allErrors });
//   }

//   const client = await pool.connect();
//   try {
//     await client.query('BEGIN');

//     // กันข้อมูลผีจาก device_id ที่ไม่มีในระบบ
//     const deviceIds = [...new Set(readings.map((r) => Number(r.device_id)))];
//     const { rows: existingDevices } = await client.query(
//       'SELECT id FROM devices WHERE id = ANY($1::int[])',
//       [deviceIds]
//     );
//     const existingIds = new Set(existingDevices.map((d) => d.id));
//     const unknownIds = deviceIds.filter((id) => !existingIds.has(id));
//     if (unknownIds.length) {
//       await client.query('ROLLBACK');
//       return res.status(400).json({
//         status: 'error',
//         message: 'Unknown device_id(s)',
//         unknown_device_ids: unknownIds,
//       });
//     }

//     const inserted = [];
//     for (const reading of readings) {
//       const row = await insertOneReading(client, reading);
//       inserted.push(row);
//     }

//     await client.query('COMMIT');
//     return res.status(201).json({
//       status: 'success',
//       message: `Inserted ${inserted.length} reading(s)`,
//       data: inserted,
//     });
//   } catch (err) {
//     await client.query('ROLLBACK');
//     console.error('Ingest energy_readings error:', err);
//     return res.status(500).json({ status: 'error', message: 'Internal server error' });
//   } finally {
//     client.release();
//   }
// });

// module.exports = router;