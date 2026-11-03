//routes/buildings.js
const express = require('express');
const supabase = require('../supabase');
const router = express.Router();

// GET /api/buildings?search=xxx
router.get('/', async (req, res) => {
  const { search } = req.query;

  try {
    let query = supabase.from('buildings').select('*').order('name', { ascending: true });

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ', error: err.message });
  }
});

// GET /api/buildings/:id
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('buildings')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'ไม่พบอาคารนี้' });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ', error: err.message });
  }
});

module.exports = router;

