
// require('dotenv').config();
// console.log('DEBUG SUPABASE_URL:', process.env.SUPABASE_URL);
// const express = require('express');
// const cors = require('cors');
// const path = require('path');
// // const pool = require('./scripts/db');
// const { createClient } = require('@supabase/supabase-js');

// // --- Supabase Client Configuration ---
// const supabaseUrl = process.env.SUPABASE_URL;
// const supabaseKey = process.env.SUPABASE_KEY;

// const supabase = createClient(supabaseUrl, supabaseKey, {
//   auth: {
//     persistSession: false,
//   },
//   realtime: {
//     transport: null, // ปิด WebSocket ป้องกัน Error บน Node v20
//   },
// });

// // route ฝั่ง public (ไม่ต้อง login)
// const buildingsRoutes = require('./routes/buildings');
// const devicesRoutes = require('./routes/devices');
// const readingsRoutes = require('./routes/readings');
// const alertsRoutes = require('./routes/alerts');

// // route ฝั่ง admin (ต้อง login)
// const adminRoutes = require('./routes/admin'); 
// const adminBuildingsRoutes = require('./routes/adminBuildings');
// const adminDevicesRoutes = require('./routes/adminDevices');
// const adminAlertsRoutes = require('./routes/adminAlerts');
// const adminUploadRoute = require('./routes/adminUpload'); 

// // route สำหรับ IoT pipeline / โมเดล ML ยิงข้อมูลเข้ามา (ใช้ API key)
// const ingestRoutes = require('./routes/ingest');

// const app = express();

// app.use(cors());
// app.use(express.json());

// // เปิดให้เข้าถึงไฟล์รูปที่อัปโหลดไว้ผ่าน URL /uploads/xxx.jpg
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // --- Database Connections Check ---
// // pool.connect()
// //   .then(client => {
// //     console.log('🐘 PostgreSQL Connected Successfully!');
// //     client.release();
// //   })
// //   .catch(err => console.error('❌ PostgreSQL Connection Error:', err));

// if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
//   console.log('⚡ Supabase Client Initialized!');
// }

// // --- Routes Management ---
// // public
// app.use('/api/buildings', buildingsRoutes);
// app.use('/api/devices', devicesRoutes);
// app.use('/api/readings', readingsRoutes);
// app.use('/api/alerts', alertsRoutes);

// // admin
// app.use('/api/admin', adminRoutes); 
// app.use('/api/admin/buildings', adminBuildingsRoutes);
// app.use('/api/admin/devices', adminDevicesRoutes);
// app.use('/api/admin/alerts', adminAlertsRoutes);
// app.use('/api/admin/upload', adminUploadRoute); 

// // ingest (จาก IoT / โมเดล ML)
// app.use('/api/ingest', ingestRoutes);

// // --- Energy API — ดึงค่าไฟฟ้าล่าสุดของอุปกรณ์จาก Supabase ---
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
//     const { data, error } = await supabase
//       .from('energy_readings')
//       .select('*')
//       .eq('device_id', device_id)
//       .order('reading_time', { ascending: false })
//       .limit(1)
//       .single();

//     if (error && error.code !== 'PGRST116') { // PGRST116 คือกรณีไม่พบข้อมูล
//       throw error;
//     }

//     res.json({
//       status: 'success',
//       message: 'Smart Energy Backend is Running!',
//       data: data || null,
//     });
//   } catch (err) {
//     console.error('Error fetching energy data from Supabase:', err);
//     res.status(500).json({ status: 'error', message: 'เกิดข้อผิดพลาดในระบบ' });
//   }
// });

// app.get('/', (req, res) => {
//   res.json({ status: 'ok', message: 'API is running' });
// });

// // --- Server Start ---
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server is running on port ${PORT}`);
// });


require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const supabase = require('./supabase'); // เรียกใช้ Supabase Client กลางจาก ./supabase.js

// Routes ฝั่ง public (ไม่ต้อง login)
const buildingsRoutes = require('./routes/buildings');
const devicesRoutes = require('./routes/devices');
const readingsRoutes = require('./routes/readings');
const alertsRoutes = require('./routes/alerts');

// Routes ฝั่ง admin (ต้อง login)
const adminRoutes = require('./routes/admin'); 
const adminBuildingsRoutes = require('./routes/adminBuildings');
const adminDevicesRoutes = require('./routes/adminDevices');
const adminAlertsRoutes = require('./routes/adminAlerts');
const adminUploadRoute = require('./routes/adminUpload');

// Routes สำหรับ IoT pipeline / โมเดล ML
const ingestRoutes = require('./routes/ingest');

const app = express();

app.use(cors());
app.use(express.json());

// ให้บริการ Static Files สำหรับรูปภาพที่อัปโหลดไว้ในโฟลเดอร์ uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Routes Management ---
// Public APIs
app.use('/api/buildings', buildingsRoutes);
app.use('/api/devices', devicesRoutes);
app.use('/api/readings', readingsRoutes);
app.use('/api/alerts', alertsRoutes);

// Admin APIs
app.use('/api/admin', adminRoutes); 
app.use('/api/admin/buildings', adminBuildingsRoutes);
app.use('/api/admin/devices', adminDevicesRoutes);
app.use('/api/admin/alerts', adminAlertsRoutes);
app.use('/api/admin/upload', adminUploadRoute); 

// Ingest APIs
app.use('/api/ingest', ingestRoutes);

// --- Energy API — ดึงค่าไฟฟ้าล่าสุดของอุปกรณ์จาก Supabase ---
// GET /api/energy?device_id=1
app.get('/api/energy', async (req, res) => {
  const { device_id } = req.query;

  if (!device_id) {
    return res.status(400).json({
      status: 'error',
      message: 'กรุณาระบุ device_id เช่น /api/energy?device_id=1',
    });
  }
  
  try {
    const { data, error } = await supabase
      .from('energy_readings')
      .select('*')
      .eq('device_id', device_id)
      .order('reading_time', { ascending: false })
      .limit(1)
      .maybeSingle(); // ใช้ maybeSingle() เพื่อคืน null เมื่อไม่พบข้อมูล โดยไม่โยน Error PGRST116

    if (error) throw error;

    res.json({
      status: 'success',
      message: 'Smart Energy Backend is Running!',
      data: data || null,
    });
  } catch (err) {
    console.error('Error fetching energy data from Supabase:', err);
    res.status(500).json({ status: 'error', message: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// --- Server Start ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
    console.log('⚡ Supabase Client Ready!');
  }
});