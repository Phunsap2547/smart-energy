
const express = require('express');
const supabase = require('../supabase');
const authenticateAdmin = require('../middleware/auth');

const router = express.Router();
router.use(authenticateAdmin);

// GET /api/admin/buildings
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('buildings').select('*').order('id', { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ', error: err.message });
  }
});

// POST /api/admin/buildings
router.post('/', async (req, res) => {
  const { name, location, lat, lng, image_url } = req.body;

  if (!name) return res.status(400).json({ message: 'กรุณากรอกชื่ออาคาร' });
  if (lat === undefined || lng === undefined || lat === null || lng === null) {
    return res.status(400).json({ message: 'กรุณาระบุพิกัด lat และ lng' });
  }

  const latNum = Number(lat);
  const lngNum = Number(lng);
  if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
    return res.status(400).json({ message: 'lat และ lng ต้องเป็นตัวเลข' });
  }

  try {
    const { data, error } = await supabase
      .from('buildings')
      .insert([{ name, location: location || null, lat: latNum, lng: lngNum, image_url: image_url || null }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ', error: err.message });
  }
});

// PUT /api/admin/buildings/:id
router.put('/:id', async (req, res) => {
  const { name, location, lat, lng, image_url } = req.body;

  const updates = {};
  if (name !== undefined) updates.name = name;
  if (location !== undefined) updates.location = location;
  if (lat !== undefined) {
    const latNum = Number(lat);
    if (Number.isNaN(latNum)) return res.status(400).json({ message: 'lat ต้องเป็นตัวเลข' });
    updates.lat = latNum;
  }
  if (lng !== undefined) {
    const lngNum = Number(lng);
    if (Number.isNaN(lngNum)) return res.status(400).json({ message: 'lng ต้องเป็นตัวเลข' });
    updates.lng = lngNum;
  }
  if (image_url !== undefined) updates.image_url = image_url;

  try {
    const { data, error } = await supabase
      .from('buildings')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'ไม่พบอาคารนี้' });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ', error: err.message });
  }
});

// DELETE /api/admin/buildings/:id
router.delete('/:id', async (req, res) => {
  try {
    // 1. ดึงข้อมูลอาคารเพื่อเอา image_url มาก่อนลบ
    const { data: building, error: fetchErr } = await supabase
      .from('buildings')
      .select('image_url')
      .eq('id', req.params.id)
      .maybeSingle();

    if (fetchErr) throw fetchErr;
    if (!building) return res.status(404).json({ message: 'ไม่พบอาคารนี้' });

    // 2. ลบข้อมูลอาคารใน Database
    const { error: deleteErr } = await supabase
      .from('buildings')
      .delete()
      .eq('id', req.params.id);

    if (deleteErr) throw deleteErr;

    // 3. ถ้ามีรูปภาพ ให้ลบไฟล์ออกจาก Storage ด้วย
    if (building.image_url) {
      const fileName = building.image_url.split('/').pop();
      if (fileName) {
        await supabase.storage.from('building-images').remove([fileName]);
      }
    }

    res.json({ message: 'ลบอาคารสำเร็จ' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ', error: err.message });
  }
});

module.exports = router;