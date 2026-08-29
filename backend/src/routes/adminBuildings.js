// const express = require('express');
// const pool = require('../db');
// const authenticateAdmin = require('../middleware/auth');

// const router = express.Router();
// router.use(authenticateAdmin); // ทุก route ในไฟล์นี้ต้อง login ก่อน

// // GET /api/admin/buildings — ดึงรายการอาคารทั้งหมด
// router.get('/', async (req, res) => {
//   try {
//     const result = await pool.query(
//       'SELECT * FROM buildings ORDER BY id ASC'
//     );
//     res.json(result.rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
//   }
// });

// // POST /api/admin/buildings
// router.post('/', async (req, res) => {
//   const { name, location, lat, lng } = req.body;

//   if (!name) {
//     return res.status(400).json({ message: 'กรุณากรอกชื่ออาคาร' });
//   }

//   if (lat === undefined || lng === undefined || lat === null || lng === null) {
//     return res.status(400).json({ message: 'กรุณาระบุพิกัด lat และ lng' });
//   }

//   const latNum = Number(lat);
//   const lngNum = Number(lng);
//   if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
//     return res.status(400).json({ message: 'lat และ lng ต้องเป็นตัวเลข' });
//   }

//   try {
//     const result = await pool.query(
//       'INSERT INTO buildings (name, location, lat, lng) VALUES ($1, $2, $3, $4) RETURNING *',
//       [name, location || null, latNum, lngNum]
//     );
//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
//   }
// });

// // PUT /api/admin/buildings/:id
// router.put('/:id', async (req, res) => {
//   const { name, location, lat, lng } = req.body;

//   const latNum = lat !== undefined && lat !== null ? Number(lat) : null;
//   const lngNum = lng !== undefined && lng !== null ? Number(lng) : null;

//   if ((lat !== undefined && Number.isNaN(latNum)) || (lng !== undefined && Number.isNaN(lngNum))) {
//     return res.status(400).json({ message: 'lat และ lng ต้องเป็นตัวเลข' });
//   }

//   try {
//     const result = await pool.query(
//       `UPDATE buildings 
//        SET name = COALESCE($1, name), 
//            location = COALESCE($2, location),
//            lat = COALESCE($3, lat),
//            lng = COALESCE($4, lng)
//        WHERE id = $5 RETURNING *`,
//       [name, location, latNum, lngNum, req.params.id]
//     );
//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: 'ไม่พบอาคารนี้' });
//     }
//     res.json(result.rows[0]);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
//   }
// });

// // DELETE /api/admin/buildings/:id
// router.delete('/:id', async (req, res) => {
//   try {
//     const result = await pool.query('DELETE FROM buildings WHERE id = $1 RETURNING id', [req.params.id]);
//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: 'ไม่พบอาคารนี้' });
//     }
//     res.json({ message: 'ลบอาคารสำเร็จ' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
//   }
// });

// module.exports = router;



const express = require('express');
const pool = require('../scripts/db');
const authenticateAdmin = require('../middleware/auth');

const router = express.Router();
router.use(authenticateAdmin); // ทุก route ในไฟล์นี้ต้อง login ก่อน

// GET /api/admin/buildings — ดึงรายการอาคารทั้งหมด
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM buildings ORDER BY id ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// POST /api/admin/buildings
router.post('/', async (req, res) => {
  const { name, location, lat, lng, image_url } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'กรุณากรอกชื่ออาคาร' });
  }

  if (lat === undefined || lng === undefined || lat === null || lng === null) {
    return res.status(400).json({ message: 'กรุณาระบุพิกัด lat และ lng' });
  }

  const latNum = Number(lat);
  const lngNum = Number(lng);
  if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
    return res.status(400).json({ message: 'lat และ lng ต้องเป็นตัวเลข' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO buildings (name, location, lat, lng, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, location || null, latNum, lngNum, image_url || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// PUT /api/admin/buildings/:id
router.put('/:id', async (req, res) => {
  const { name, location, lat, lng, image_url } = req.body;

  const latNum = lat !== undefined && lat !== null ? Number(lat) : null;
  const lngNum = lng !== undefined && lng !== null ? Number(lng) : null;

  if ((lat !== undefined && Number.isNaN(latNum)) || (lng !== undefined && Number.isNaN(lngNum))) {
    return res.status(400).json({ message: 'lat และ lng ต้องเป็นตัวเลข' });
  }

  try {
    const result = await pool.query(
      `UPDATE buildings 
       SET name = COALESCE($1, name), 
           location = COALESCE($2, location),
           lat = COALESCE($3, lat),
           lng = COALESCE($4, lng),
           image_url = COALESCE($5, image_url)
       WHERE id = $6 RETURNING *`,
      [name, location, latNum, lngNum, image_url, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'ไม่พบอาคารนี้' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// DELETE /api/admin/buildings/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM buildings WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'ไม่พบอาคารนี้' });
    }
    res.json({ message: 'ลบอาคารสำเร็จ' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

module.exports = router;