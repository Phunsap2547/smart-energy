const express = require('express');
const supabase = require('../supabase');
const router = express.Router();

// GET /api/buildings?search=xxx
router.get('/', async (req, res) => {
  const { search } = req.query;

  try {
    let query = supabase.from('buildings').select('*').order('name', { ascending: true });

    if (search) {
      query = query.or(`name.ilike.%${search}%,location.ilike.%${search}%`);
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



// const express = require('express');
// const supabase = require('../supabase');
// const authenticateAdmin = require('../middleware/auth');

// const router = express.Router();

// router.use(authenticateAdmin); // ทุก route ในไฟล์นี้ต้อง login ก่อน

// // GET /api/admin/buildings/:id/ingest
// router.get('/:id/ingest', async (req, res) => {
//   const buildingId = Number(req.params.id);
//   if (!buildingId) {
//     return res.status(400).json({ message: 'building id ไม่ถูกต้อง' });
//   }

//   try {
//     const { data, error } = await supabase
//       .from('energy_ingest')
//       .select('*')
//       .eq('building_id', buildingId)
//       .order('created_at', { ascending: false })
//       .limit(30);

//     if (error) throw error;

//     res.json({ data: data.reverse() });
//   } catch (err) {
//     console.error('Fetch ingest error:', err);
//     res.status(500).json({ message: 'ดึงข้อมูลไม่สำเร็จ', error: err.message });
//   }
// });

// module.exports = router;