const express = require('express');
const supabase = require('../supabase');
const authenticateAdmin = require('../middleware/auth');

const router = express.Router();
router.use(authenticateAdmin);

// -------------------------------------------------------------
// GET /api/admin/devices - ดึงรายการอุปกรณ์ (รองรับการกรองตาม building_id)
// -------------------------------------------------------------
router.get('/', async (req, res) => {
  const { building_id } = req.query;

  try {
    let query = supabase
      .from('devices')
      .select('*, buildings(name)')
      .order('id', { ascending: true });

    if (building_id) {
      query = query.eq('building_id', building_id);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลอุปกรณ์', error: err.message });
  }
});

// -------------------------------------------------------------
// POST /api/admin/devices - เพิ่มอุปกรณ์ใหม่
// -------------------------------------------------------------
router.post('/', async (req, res) => {
  const { building_id, name, install_point } = req.body;

  if (!building_id || !name) {
    return res.status(400).json({ message: 'กรุณาระบุ building_id และชื่ออุปกรณ์' });
  }

  try {
    // ตรวจสอบก่อนว่ามีอาคารนี้จริงหรือไม่
    const { data: building, error: buildingErr } = await supabase
      .from('buildings')
      .select('id')
      .eq('id', building_id)
      .maybeSingle();

    if (buildingErr || !building) {
      return res.status(404).json({ message: 'ไม่พบอาคารที่ระบุ' });
    }

    const { data, error } = await supabase
      .from('devices')
      .insert([{ building_id, name, install_point: install_point || null }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ', error: err.message });
  }
});

// -------------------------------------------------------------
// PUT /api/admin/devices/:id - แก้ไขข้อมูลอุปกรณ์
// -------------------------------------------------------------
router.put('/:id', async (req, res) => {
  const { name, install_point } = req.body;

  const updates = {};
  if (name !== undefined) updates.name = name;
  if (install_point !== undefined) updates.install_point = install_point;

  try {
    const { data, error } = await supabase
      .from('devices')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ message: 'ไม่พบอุปกรณ์นี้' });
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ', error: err.message });
  }
});

// -------------------------------------------------------------
// DELETE /api/admin/devices/:id - ลบอุปกรณ์
// -------------------------------------------------------------
router.delete('/:id', async (req, res) => {
  try {
    // 1. ค้นหาอุปกรณ์ที่จะลบเพื่อเอา building_id มาก่อน
    const { data: device, error: fetchErr } = await supabase
      .from('devices')
      .select('id, building_id')
      .eq('id', req.params.id)
      .maybeSingle();

    if (fetchErr) throw fetchErr;
    if (!device) {
      return res.status(404).json({ message: 'ไม่พบอุปกรณ์นี้' });
    }

    // 2. ลบข้อมูลการอ่านค่าที่ผูกกับอุปกรณ์นี้ก่อน (ป้องกัน Foreign Key Error)
    await supabase.from('energy_readings').delete().eq('device_id', device.id);
    await supabase.from('anomalies').delete().eq('device_id', device.id);

    // 3. ลบตัวอุปกรณ์
    const { error: deleteErr } = await supabase
      .from('devices')
      .delete()
      .eq('id', device.id);

    if (deleteErr) throw deleteErr;

    // 4. ตรวจสอบว่าอาคารนี้เหลืออุปกรณ์อื่นอีกไหม ถ้าไม่เหลือ ให้ปรับเป็น offline
    const { count } = await supabase
      .from('devices')
      .select('id', { count: 'exact', head: true })
      .eq('building_id', device.building_id);

    if (count === 0) {
      await supabase
        .from('buildings')
        .update({ status: 'offline' })
        .eq('id', device.building_id);
    }

    res.json({ message: 'ลบอุปกรณ์และข้อมูลประวัติสำเร็จ' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบอุปกรณ์', error: err.message });
  }
});

module.exports = router;



// const express = require('express');
// const supabase = require('../supabase');
// const authenticateAdmin = require('../middleware/auth');

// const router = express.Router();
// router.use(authenticateAdmin);

// // POST /api/admin/devices
// router.post('/', async (req, res) => {
//   const { building_id, name, install_point } = req.body;

//   if (!building_id || !name) {
//     return res.status(400).json({ message: 'กรุณาระบุ building_id และชื่ออุปกรณ์' });
//   }

//   try {
//     const { data, error } = await supabase
//       .from('devices')
//       .insert([{ building_id, name, install_point: install_point || null }])
//       .select()
//       .single();

//     if (error) throw error;
//     res.status(201).json(data);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ', error: err.message });
//   }
// });

// // PUT /api/admin/devices/:id
// router.put('/:id', async (req, res) => {
//   const { name, install_point } = req.body;

//   const updates = {};
//   if (name !== undefined) updates.name = name;
//   if (install_point !== undefined) updates.install_point = install_point;

//   try {
//     const { data, error } = await supabase
//       .from('devices')
//       .update(updates)
//       .eq('id', req.params.id)
//       .select()
//       .maybeSingle();

//     if (error) throw error;
//     if (!data) {
//       return res.status(404).json({ message: 'ไม่พบอุปกรณ์นี้' });
//     }

//     res.json(data);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ', error: err.message });
//   }
// });

// // DELETE /api/admin/devices/:id
// router.delete('/:id', async (req, res) => {
//   try {
//     const { data, error } = await supabase
//       .from('devices')
//       .delete()
//       .eq('id', req.params.id)
//       .select('id')
//       .maybeSingle();

//     if (error) throw error;
//     if (!data) {
//       return res.status(404).json({ message: 'ไม่พบอุปกรณ์นี้' });
//     }

//     res.json({ message: 'ลบอุปกรณ์สำเร็จ' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ', error: err.message });
//   }
// });

// module.exports = router;