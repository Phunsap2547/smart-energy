// const express = require('express');
// const pool = require('../scripts/db');
// const router = express.Router();

// // GET /api/buildings?search=xxx
// router.get('/', async (req, res) => {
//   const { search } = req.query;

//   try {
//     let query = 'SELECT * FROM buildings';
//     const values = [];

//     if (search) {
//       query += ' WHERE name ILIKE $1 OR location ILIKE $1';
//       values.push(`%${search}%`);
//     }

//     query += ' ORDER BY name ASC';

//     const result = await pool.query(query, values);
//     res.json(result.rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
//   }
// });

// // GET /api/buildings/:id
// router.get('/:id', async (req, res) => {
//   try {
//     const result = await pool.query('SELECT * FROM buildings WHERE id = $1', [req.params.id]);
//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: 'ไม่พบอาคารนี้' });
//     }
//     res.json(result.rows[0]);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
//   }
// });

// module.exports = router;


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