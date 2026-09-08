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

// ฟังก์ชันรับและแมปค่ารองรับทั้ง ESP32 (camelCase) และ Database (snake_case)
const handleIngestReadings = async (req, res) => {
  const body = req.body;

  // รองรับทั้ง device_id และ meterId
  const device_id = body.device_id || body.meterId;

  if (!device_id) {
    return res.status(400).json({ message: 'กรุณาระบุ device_id' });
  }

 const getThaiTime = () => {
  const now = new Date();
  // บวกเพิ่ม 7 ชั่วโมง
  const thaiDate = new Date(now.getTime() + (7 * 60 * 60 * 1000));
  return thaiDate.toISOString().replace('Z', '');
};
  // แปลงค่าจาก ESP32 ให้ลงคอลัมน์ Supabase ถูกต้อง (แก้ปัญหา NULL)
  const payload = {
    device_id,
    reading_time: body.reading_time || new Date().toISOString(),

    // แรงดันไฟฟ้า (ลงทั้ง voltage_system และ voltage_a เพื่อความชัวร์)
    voltage_system: body.voltageSystemV ?? body.voltage_system ?? null,
    voltage_a: body.voltage_a ?? body.voltageSystemV ?? null,
    voltage_b: body.voltage_b ?? null,
    voltage_c: body.voltage_c ?? null,

    // กระแสไฟฟ้า
    current_system: body.currentSystemA ?? body.current_system ?? null,
    current_a: body.current_a ?? body.currentSystemA ?? null,
    current_b: body.current_b ?? null,
    current_c: body.current_c ?? null,

    // กำลังไฟฟ้า และ พลังงาน
    power_kw: body.realPowerKw ?? body.power_kw ?? null,
    power_a: body.power_a ?? null,
    power_b: body.power_b ?? null,
    power_c: body.power_c ?? null,
    energy_kwh: body.energyKwh ?? body.energy_kwh ?? null,

    // ค่าทางไฟฟ้าอื่นๆ
    power_factor: body.powerFactor ?? body.power_factor ?? null,
    frequency_hz: body.frequencyHz ?? body.frequency_hz ?? null,
    voltage_unbalance_pct: body.voltagePhaseUnbalancePct ?? body.voltage_unbalance_pct ?? null,
    current_unbalance_pct: body.currentUnbalancePct ?? body.current_unbalance_pct ?? null,
    thd_voltage_l1_pct: body.thdVoltageL1Pct ?? body.thd_voltage_l1_pct ?? null,
    thd_current_l1_pct: body.thdCurrentL1Pct ?? body.thd_current_l1_pct ?? null,
  };

  try {
    const { data, error } = await supabase
      .from('energy_readings')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

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
