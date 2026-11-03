
// module.exports = router;


const express = require('express');
const supabase = require('../supabase');
const router = express.Router();

// GET /api/devices?building_id=1&search=xxx
router.get('/', async (req, res) => {
  const { building_id, search } = req.query;

  try {
    let query = supabase.from('devices').select('*').order('name', { ascending: true });

    if (building_id) {
      query = query.eq('building_id', building_id);
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,install_point.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ', error: err.message });
  }
});

module.exports = router;