const express = require('express');
const supabase = require('../supabase');
const authenticateAdmin = require('../middleware/auth');

const router = express.Router();
router.use(authenticateAdmin);

// POST /api/admin/devices
router.post('/', async (req, res) => {
  const { building_id, name, install_point } = req.body;

  if (!building_id || !name) {
    return res.status(400).json({ message: 'กรุณาระบุ building_id และชื่ออุปกรณ์' });
  }

  try {
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

// PUT /api/admin/devices/:id
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

// DELETE /api/admin/devices/:id
router.delete('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('devices')
      .delete()
      .eq('id', req.params.id)
      .select('id')
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ message: 'ไม่พบอุปกรณ์นี้' });
    }

    res.json({ message: 'ลบอุปกรณ์สำเร็จ' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ', error: err.message });
  }
});

module.exports = router;