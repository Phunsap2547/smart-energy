// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');

// const app = express();
// app.use(cors());
// app.use(express.json());

// // ดึงตัวแปร MONGO_URI จากที่ตั้งไว้ใน docker-compose
// const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/iot_db';

// // เชื่อมต่อฐานข้อมูล MongoDB
// mongoose.connect(mongoUri)
//   .then(() => console.log('🍃 MongoDB Connected Successfully!'))
//   .catch(err => console.error('❌ MongoDB Connection Error:', err));

// // สร้าง Route ทดสอบดึงข้อมูลพลังงาน (IoT Mockup)
// app.get('/api/energy', (req, res) => {
//   res.json({
//     status: "success",
//     message: "Smart Energy Backend is Running!",
//     data: {
//       voltage: 220, // แรงดันไฟฟ้า (โวลต์)
//       current: 4.5,  // กระแสไฟฟ้า (แอมป์)
//       power: 990     // พลังงานที่ใช้ (วัตต์)
//     }
//   });
// });

// const PORT = 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server is running on port ${PORT}`);
// });


// const express = require('express');
// const { Pool } = require('pg');
// const cors = require('cors');

// const app = express();
// app.use(cors());
// app.use(express.json());

// // เชื่อมต่อฐานข้อมูล PostgreSQL ด้วย connection pool
// // ค่าตัวแปรเหล่านี้มาจาก environment ที่ตั้งไว้ใน docker-compose (DB_HOST=database)
// const pool = new Pool({
//   host: process.env.DB_HOST || 'localhost',
//   port: process.env.DB_PORT || 5432,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
// });

// pool.connect()
//   .then(client => {
//     console.log('🐘 PostgreSQL Connected Successfully!');
//     client.release();
//   })
//   .catch(err => console.error('❌ PostgreSQL Connection Error:', err));

// // Route ทดสอบ: ดึงค่าไฟฟ้าล่าสุดของอุปกรณ์ (แทนที่ mock data เดิม)
// // เรียกใช้แบบ: GET /api/energy?device_id=1
// app.get('/api/energy', async (req, res) => {
//   const { device_id } = req.query;

//   if (!device_id) {
//     return res.status(400).json({
//       status: 'error',
//       message: 'กรุณาระบุ device_id เช่น /api/energy?device_id=1',
//     });
//   }

//   try {
//     const result = await pool.query(
//       `SELECT * FROM energy_readings WHERE device_id = $1
//        ORDER BY reading_time DESC LIMIT 1`,
//       [device_id]
//     );

//     res.json({
//       status: 'success',
//       message: 'Smart Energy Backend is Running!',
//       data: result.rows[0] || null,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ status: 'error', message: 'เกิดข้อผิดพลาดในระบบ' });
//   }
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server is running on port ${PORT}`);
// });


// const express = require('express');
// const cors = require('cors');
// const path = require('path'); 
// require('dotenv').config();
// const pool = require('./db');

// const adminRouter = require('./routes/admin');
// const adminBuildingsRouter = require('./routes/adminBuildings');
// const adminUploadRoute = require('./routes/adminUpload');
// const readingsRoutes = require('./routes/readings');

// const app = express();
// // Middlewares
// app.use(cors());
// app.use(express.json());

// // ⭐ เพิ่มบรรทัดนี้ — เปิดให้เข้าถึงไฟล์รูปที่อัปโหลดไว้ได้
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
// // เช็คการเชื่อมต่อ PostgreSQL
// pool.connect()
//   .then(client => {
//     console.log('🐘 PostgreSQL Connected Successfully!');
//     client.release();
//   })
//   .catch(err => console.error('❌ PostgreSQL Connection Error:', err));

// // --- . Authentication Routes ---
// // แมป /api/auth ไปยัง routes/admin.js (รวมถึง /login และ /me)
// app.use('/api/auth', adminRouter);
// app.use('/api/admin/buildings', adminBuildingsRouter); //เพิ่มอาคาร
// app.use('/api/admin/upload', adminUploadRoute); //เพิ่มรูป
// app.use('/api/readings', readingsRoutes);

// // --- . Energy API Routes ---
// // GET /api/energy?device_id=1
// app.get('/api/energy', async (req, res) => {
//   const { device_id } = req.query;

//   if (!device_id) {
//     return res.status(400).json({
//       status: 'error',
//       message: 'กรุณาระบุ device_id เช่น /api/energy?device_id=1',
//     });
//   }

//   try {
//     const result = await pool.query(
//       `SELECT * FROM energy_readings 
//        WHERE device_id = $1 
//        ORDER BY reading_time DESC 
//        LIMIT 1`,
//       [device_id]
//     );

//     res.json({
//       status: 'success',
//       message: 'Smart Energy Backend is Running!',
//       data: result.rows[0] || null,
//     });
//   } catch (err) {
//     console.error('Error fetching energy data:', err);
//     res.status(500).json({ status: 'error', message: 'เกิดข้อผิดพลาดในระบบ' });
//   }
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server is running on port ${PORT}`);
// });