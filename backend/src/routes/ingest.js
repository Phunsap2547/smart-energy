//ingest.js
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

// ฟังก์ชันสร้าง Timestamp เวลาไทย (UTC+7)
const getThaiTime = () => {
  const now = new Date();
  const thaiDate = new Date(now.getTime() + (7 * 60 * 60 * 1000));
  return thaiDate.toISOString().replace('Z', '');
};

// ฟังก์ชันรับและแมปค่ารองรับทั้ง ESP32 (camelCase) และ Database (snake_case)
const handleIngestReadings = async (req, res) => {
  const body = req.body;

  // รองรับทั้ง device_id และ meterId
  const device_id = body.device_id || body.meterId;

  if (!device_id) {
    return res.status(400).json({ message: 'กรุณาระบุ device_id' });
  }

  // แปลงค่าจาก ESP32 ให้ลงคอลัมน์ Supabase ถูกต้อง
  const payload = {
    device_id,
    reading_time: body.reading_time || getThaiTime(),

    // แรงดันไฟฟ้า (System & Per-Phase)
    voltage_system: body.voltageSystemV ?? body.voltage_system ?? null,
    voltage_a: body.voltageL1V ?? body.voltage_a ?? body.voltageSystemV ?? null,
    voltage_b: body.voltageL2V ?? body.voltage_b ?? null,
    voltage_c: body.voltageL3V ?? body.voltage_c ?? null,

    // กระแสไฟฟ้า (System & Per-Phase)
    current_system: body.currentSystemA ?? body.current_system ?? null,
    current_a: body.currentL1A ?? body.current_a ?? body.currentSystemA ?? null,
    current_b: body.currentL2A ?? body.current_b ?? null,
    current_c: body.currentL3A ?? body.current_c ?? null,

    // กำลังไฟฟ้า และ พลังงาน (System & Per-Phase)
    power_kw: body.realPowerKw ?? body.power_kw ?? null,
    power_a: body.realPowerL1Kw ?? body.power_a ?? null,
    power_b: body.realPowerL2Kw ?? body.power_b ?? null,
    power_c: body.realPowerL3Kw ?? body.power_c ?? null,
    energy_kwh: body.energyKwh ?? body.energy_kwh ?? null,

    // Power Factor (System & Per-Phase)
    power_factor: body.powerFactor ?? body.power_factor ?? null,
    pf_a: body.powerFactorL1 ?? body.pf_a ?? null,
    pf_b: body.powerFactorL2 ?? body.pf_b ?? null,
    pf_c: body.powerFactorL3 ?? body.pf_c ?? null,

    // ค่าคุณภาพไฟฟ้า (เพิ่ม THD L2 และ L3 ให้ครบ)
    frequency_hz: body.frequencyHz ?? body.frequency_hz ?? null,
    voltage_unbalance_pct: body.voltageUnbalPct ?? body.voltagePhaseUnbalancePct ?? body.voltage_unbalance_pct ?? null,
    current_unbalance_pct: body.currentUnbalPct ?? body.current_unbalance_pct ?? null,
    
    // THD Voltage L1 / L2 / L3
    thd_voltage_l1_pct: body.thdVoltageL1Pct ?? body.thd_voltage_l1_pct ?? null,
    thd_voltage_l2_pct: body.thdVoltageL2Pct ?? body.thd_voltage_l2_pct ?? null,
    thd_voltage_l3_pct: body.thdVoltageL3Pct ?? body.thd_voltage_l3_pct ?? null, 
    
    // THD Current L1 / L2 / L3
    thd_current_l1_pct: body.thdCurrentL1Pct ?? body.thd_current_l1_pct ?? null,
    thd_current_l2_pct: body.thdCurrentL2Pct ?? body.thd_current_l2_pct ?? null,
    thd_current_l3_pct: body.thdCurrentL3Pct ?? body.thd_current_l3_pct ?? null,
  };

  try {
    // 1. บันทึกข้อมูลลงตาราง energy_readings
    const { data, error } = await supabase
      .from('energy_readings')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    // 2. [เพิ่มใหม่] ดึง building_id จากอุปกรณ์ และอัปเดตสถานะอาคารเป็น 'online'
    const { data: device } = await supabase
      .from('devices')
      .select('building_id')
      .eq('id', device_id)
      .maybeSingle();

    if (device?.building_id) {
      await supabase
        .from('buildings')
        .update({ status: 'online' })
        .eq('id', device.building_id);
    }

    res.status(201).json(data);
  } catch (err) {
    console.error('Supabase Ingest Error:', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', error: err.message });
  }
};

// รองรับทั้ง POST /api/ingest และ POST /api/ingest/readings
router.post('/', handleIngestReadings);
router.post('/readings', handleIngestReadings);

// POST /api/ingest/anomalies
router.post('/anomalies', async (req, res) => {
  const { device_id, detected_at, type, severity, description } = req.body;

  if (!device_id || !type) {
    return res.status(400).json({ message: 'กรุณาระบุ device_id และ type' });
  }

  try {
    const { data, error } = await supabase
      .from('anomalies')
      .insert([
        {
          device_id,
          detected_at: detected_at || getThaiTime(),
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


// //ingest.js
// const express = require('express');
// const { createClient } = require('@supabase/supabase-js');
// const verifyApiKey = require('../middleware/apiKey');

// const router = express.Router();

// // 1. ประกาศ Supabase Client
// const supabaseUrl = process.env.SUPABASE_URL;
// const supabaseKey = process.env.SUPABASE_KEY;
// const supabase = createClient(supabaseUrl, supabaseKey, {
//   auth: { persistSession: false },
//   realtime: { transport: null },
// });

// router.use(verifyApiKey);

// // ฟังก์ชันสร้าง Timestamp เวลาไทย (UTC+7)
// const getThaiTime = () => {
//   const now = new Date();
//   const thaiDate = new Date(now.getTime() + (7 * 60 * 60 * 1000));
//   return thaiDate.toISOString().replace('Z', '');
// };

// // ฟังก์ชันรับและแมปค่ารองรับทั้ง ESP32 (camelCase) และ Database (snake_case)
// const handleIngestReadings = async (req, res) => {
//   const body = req.body;
//   const device_id = body.device_id || body.meterId;

//   if (!device_id) {
//     return res.status(400).json({ message: 'กรุณาระบุ device_id' });
//   }

//   // heartbeat = บอร์ดยังอยู่ แต่มิเตอร์ไม่ตอบ (บอร์ดส่ง meter_ok: 0)
//   const isHeartbeat = body.meter_ok === 0 || body.meter_ok === false;

//   // เวลาวัดจริงจากบอร์ด (epoch วินาที, UTC) ใช้ได้เมื่อ NTP ซิงก์แล้ว
//   const tsMs = Number(body.ts) > 1700000000 ? Number(body.ts) * 1000 : null;
//   const isBackfill = tsMs !== null && Date.now() - tsMs > 15000;

//   // ใช้รูปแบบเดียวกับ getThaiTime() เพื่อให้ตรงกับข้อมูลเดิมในตาราง
//   const readingTime =
//     body.reading_time ||
//     (tsMs
//       ? new Date(tsMs + 7 * 60 * 60 * 1000).toISOString().replace('Z', '')
//       : getThaiTime());

//   const payload = {
//     device_id,
//     reading_time: readingTime,

//     voltage_system: body.voltageSystemV ?? body.voltage_system ?? null,
//     voltage_a: body.voltageL1V ?? body.voltage_a ?? body.voltageSystemV ?? null,
//     voltage_b: body.voltageL2V ?? body.voltage_b ?? null,
//     voltage_c: body.voltageL3V ?? body.voltage_c ?? null,

//     current_system: body.currentSystemA ?? body.current_system ?? null,
//     current_a: body.currentL1A ?? body.current_a ?? body.currentSystemA ?? null,
//     current_b: body.currentL2A ?? body.current_b ?? null,
//     current_c: body.currentL3A ?? body.current_c ?? null,

//     power_kw: body.realPowerKw ?? body.power_kw ?? null,
//     power_a: body.realPowerL1Kw ?? body.power_a ?? null,
//     power_b: body.realPowerL2Kw ?? body.power_b ?? null,
//     power_c: body.realPowerL3Kw ?? body.power_c ?? null,
//     energy_kwh: body.energyKwh ?? body.energy_kwh ?? null,

//     power_factor: body.powerFactor ?? body.power_factor ?? null,
//     pf_a: body.powerFactorL1 ?? body.pf_a ?? null,
//     pf_b: body.powerFactorL2 ?? body.pf_b ?? null,
//     pf_c: body.powerFactorL3 ?? body.pf_c ?? null,

//     frequency_hz: body.frequencyHz ?? body.frequency_hz ?? null,
//     voltage_unbalance_pct: body.voltageUnbalPct ?? body.voltagePhaseUnbalancePct ?? body.voltage_unbalance_pct ?? null,
//     current_unbalance_pct: body.currentUnbalPct ?? body.current_unbalance_pct ?? null,

//     thd_voltage_l1_pct: body.thdVoltageL1Pct ?? body.thd_voltage_l1_pct ?? null,
//     thd_voltage_l2_pct: body.thdVoltageL2Pct ?? body.thd_voltage_l2_pct ?? null,
//     thd_voltage_l3_pct: body.thdVoltageL3Pct ?? body.thd_voltage_l3_pct ?? null,

//     thd_current_l1_pct: body.thdCurrentL1Pct ?? body.thd_current_l1_pct ?? null,
//     thd_current_l2_pct: body.thdCurrentL2Pct ?? body.thd_current_l2_pct ?? null,
//     thd_current_l3_pct: body.thdCurrentL3Pct ?? body.thd_current_l3_pct ?? null,
//   };

//   try {
//     // 1. ดึงข้อมูลอุปกรณ์ (ใช้เช็กว่ามีอยู่จริง + boot_count เดิม)
//     const { data: device, error: devErr } = await supabase
//       .from('devices')
//       .select('id, building_id, boot_count')
//       .eq('id', device_id)
//       .maybeSingle();

//     if (devErr) throw devErr;
//     if (!device) {
//       return res.status(404).json({ message: `ไม่พบ device_id: ${device_id} ในระบบ` });
//     }

//     // 2. อัปเดตสถานะบอร์ด
//     //    last_seen_at อัปเดตเสมอ (ข้อมูลย้อนหลังที่เพิ่งมาถึงก็แปลว่าบอร์ดยังอยู่)
//     //    ฟิลด์วินิจฉัยอัปเดตเฉพาะข้อมูลสด เพราะข้อมูลย้อนหลังมีค่าเก่า
//     const status = { last_seen_at: new Date().toISOString() };
//     if (!isBackfill) {
//       Object.assign(
//         status,
//         Object.fromEntries(
//           Object.entries({
//             meter_ok: !isHeartbeat,
//             uptime_sec: body.uptime_sec,
//             boot_count: body.boot_count,
//             reset_reason: body.reset_reason,
//             wifi_rssi: body.wifi_rssi,
//             wifi_drops: body.wifi_drops,
//             modbus_fail: body.modbus_fail,
//           }).filter(([, v]) => v !== undefined && v !== null)
//         )
//       );
//     }

//     const { error: stErr } = await supabase.from('devices').update(status).eq('id', device_id);
//     if (stErr) console.error('⚠️ update device status:', stErr.message);

//     // 3. boot_count เพิ่ม = บอร์ดเพิ่งรีบูต บันทึกเป็นเหตุการณ์
//     if (!isBackfill && body.boot_count != null && device.boot_count != null
//         && body.boot_count > device.boot_count) {
//       const { error: evErr } = await supabase.from('device_events').insert([{
//         device_id,
//         type: 'boot',
//         detail: {
//           reset_reason: body.reset_reason ?? null,
//           uptime_sec: body.uptime_sec ?? null,
//           boot_count: body.boot_count,
//         },
//       }]);
//       if (evErr) console.error('⚠️ insert device_events:', evErr.message);
//     }

//     // 4. heartbeat: ไม่บันทึกลง energy_readings ตอบ 200 ให้บอร์ดถือว่าส่งสำเร็จ
//     if (isHeartbeat) {
//       return res.status(200).json({ message: 'รับ heartbeat แล้ว (มิเตอร์ไม่ตอบ)' });
//     }

//     // 5. บันทึกค่าไฟ (upsert กันซ้ำตอนบอร์ดส่งย้อนหลัง)
//     const { data, error } = await supabase
//       .from('energy_readings')
//       .upsert([payload], { onConflict: 'device_id,reading_time', ignoreDuplicates: true })
//       .select()
//       .maybeSingle();

//     if (error) throw error;

//     // 6. อาคารเป็น online เฉพาะตอนมีค่าไฟสดจริง
//     if (!isBackfill && device.building_id) {
//       await supabase
//         .from('buildings')
//         .update({ status: 'online' })
//         .eq('id', device.building_id);
//     }

//     res.status(201).json(data ?? { message: 'ข้อมูลซ้ำ ข้ามการบันทึก' });
//   } catch (err) {
//     console.error('Supabase Ingest Error:', err);
//     res.status(500).json({ message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', error: err.message });
//   }
// };

// // รองรับทั้ง POST /api/ingest และ POST /api/ingest/readings
// router.post('/', handleIngestReadings);
// router.post('/readings', handleIngestReadings);

// // POST /api/ingest/anomalies
// router.post('/anomalies', async (req, res) => {
//   const { device_id, detected_at, type, severity, description } = req.body;

//   if (!device_id || !type) {
//     return res.status(400).json({ message: 'กรุณาระบุ device_id และ type' });
//   }

//   try {
//     const { data, error } = await supabase
//       .from('anomalies')
//       .insert([
//         {
//           device_id,
//           detected_at: detected_at || getThaiTime(),
//           type,
//           severity: severity || 'medium',
//           description: description || null,
//         },
//       ])
//       .select()
//       .single();

//     if (error) throw error;

//     res.status(201).json(data);
//   } catch (err) {
//     console.error('Supabase Anomalies Error:', err);
//     res.status(400).json({ message: 'ข้อมูลไม่ถูกต้อง หรือ type/severity ไม่อยู่ในรายการที่กำหนด' });
//   }
// });

// module.exports = router;

// const express = require('express');
// const { createClient } = require('@supabase/supabase-js');
// const verifyApiKey = require('../middleware/apiKey');

// const router = express.Router();

// // 1. ประกาศ Supabase Client
// const supabaseUrl = process.env.SUPABASE_URL;
// const supabaseKey = process.env.SUPABASE_KEY;
// const supabase = createClient(supabaseUrl, supabaseKey, {
//   auth: { persistSession: false },
//   realtime: { transport: null },
// });

// router.use(verifyApiKey);

// // ฟังก์ชันสร้าง Timestamp เวลาไทย (UTC+7)
// const getThaiTime = () => {
//   const now = new Date();
//   const thaiDate = new Date(now.getTime() + (7 * 60 * 60 * 1000));
//   return thaiDate.toISOString().replace('Z', '');
// };

// // ฟังก์ชันรับและแมปค่ารองรับทั้ง ESP32 (camelCase) และ Database (snake_case)
// const handleIngestReadings = async (req, res) => {
//   const body = req.body;

//   // รองรับทั้ง device_id และ meterId
//   const device_id = body.device_id || body.meterId;

//   if (!device_id) {
//     return res.status(400).json({ message: 'กรุณาระบุ device_id' });
//   }

//   // แปลงค่าจาก ESP32 ให้ลงคอลัมน์ Supabase ถูกต้อง
//   const payload = {
//   device_id,
//   reading_time: body.reading_time || getThaiTime(),

//   // แรงดันไฟฟ้า (System & Per-Phase)
//   voltage_system: body.voltageSystemV ?? body.voltage_system ?? null,
//   voltage_a: body.voltageL1V ?? body.voltage_a ?? body.voltageSystemV ?? null,
//   voltage_b: body.voltageL2V ?? body.voltage_b ?? null,
//   voltage_c: body.voltageL3V ?? body.voltage_c ?? null,

//   // กระแสไฟฟ้า (System & Per-Phase)
//   current_system: body.currentSystemA ?? body.current_system ?? null,
//   current_a: body.currentL1A ?? body.current_a ?? body.currentSystemA ?? null,
//   current_b: body.currentL2A ?? body.current_b ?? null,
//   current_c: body.currentL3A ?? body.current_c ?? null,

//   // กำลังไฟฟ้า และ พลังงาน (System & Per-Phase)
//   power_kw: body.realPowerKw ?? body.power_kw ?? null,
//   power_a: body.realPowerL1Kw ?? body.power_a ?? null,
//   power_b: body.realPowerL2Kw ?? body.power_b ?? null,
//   power_c: body.realPowerL3Kw ?? body.power_c ?? null,
//   energy_kwh: body.energyKwh ?? body.energy_kwh ?? null,

//   // Power Factor (System & Per-Phase)
//   power_factor: body.powerFactor ?? body.power_factor ?? null,
//   pf_a: body.powerFactorL1 ?? body.pf_a ?? null, // เพิ่ม PF รายเฟส
//   pf_b: body.powerFactorL2 ?? body.pf_b ?? null,
//   pf_c: body.powerFactorL3 ?? body.pf_c ?? null,

//   // ค่าคุณภาพไฟฟ้า
//   frequency_hz: body.frequencyHz ?? body.frequency_hz ?? null,
//   voltage_unbalance_pct: body.voltageUnbalPct ?? body.voltagePhaseUnbalancePct ?? body.voltage_unbalance_pct ?? null, // แก้ไขชื่อให้ตรง Arduino
//   current_unbalance_pct: body.currentUnbalPct ?? body.current_unbalance_pct ?? null,
//   thd_voltage_l1_pct: body.thdVoltageL1Pct ?? body.thd_voltage_l1_pct ?? null,
//   thd_current_l1_pct: body.thdCurrentL1Pct ?? body.thd_current_l1_pct ?? null,
// };

//   try {
//     const { data, error } = await supabase
//       .from('energy_readings')
//       .insert([payload])
//       .select()
//       .single();

//     if (error) throw error;

//     res.status(201).json(data);
//   } catch (err) {
//     console.error('Supabase Ingest Error:', err);
//     res.status(500).json({ message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', error: err.message });
//   }
// };

// // รองรับทั้ง POST /api/ingest และ POST /api/ingest/readings
// router.post('/', handleIngestReadings);
// router.post('/readings', handleIngestReadings);

// // POST /api/ingest/anomalies
// router.post('/anomalies', async (req, res) => {
//   const { device_id, detected_at, type, severity, description } = req.body;

//   if (!device_id || !type) {
//     return res.status(400).json({ message: 'กรุณาระบุ device_id และ type' });
//   }

//   try {
//     const { data, error } = await supabase
//       .from('anomalies')
//       .insert([
//         {
//           device_id,
//           detected_at: detected_at || getThaiTime(), // ✅ ปรับเวลาไทยตรงส่วนนี้ด้วย
//           type,
//           severity: severity || 'medium',
//           description: description || null,
//         },
//       ])
//       .select()
//       .single();

//     if (error) throw error;

//     res.status(201).json(data);
//   } catch (err) {
//     console.error('Supabase Anomalies Error:', err);
//     res.status(400).json({ message: 'ข้อมูลไม่ถูกต้อง หรือ type/severity ไม่อยู่ในรายการที่กำหนด' });
//   }
// });

// module.exports = router;