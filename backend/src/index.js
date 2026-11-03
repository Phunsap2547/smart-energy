//backend/src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const supabase = require('./supabase'); // เรียกใช้ Supabase Client กลางจาก ./supabase.js
const authenticateAdmin = require('./middleware/auth');

if (!process.env.JWT_SECRET) {
  console.error('❌ ไม่พบ JWT_SECRET ใน .env');
  process.exit(1);
}
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

// // Admin APIs
// app.use('/api/admin', adminRoutes); 
// app.use('/api/admin/buildings', adminBuildingsRoutes);
// app.use('/api/admin/devices', adminDevicesRoutes);
// app.use('/api/admin/alerts', adminAlertsRoutes);
// app.use('/api/admin/upload', adminUploadRoute); 
// Admin APIs
app.use('/api/admin', adminRoutes); // มี /login อยู่ในนี้ ห้ามครอบ auth ทั้งก้อน
app.use('/api/admin/buildings', authenticateAdmin, adminBuildingsRoutes);
app.use('/api/admin/devices', authenticateAdmin, adminDevicesRoutes);
app.use('/api/admin/alerts', authenticateAdmin, adminAlertsRoutes);
app.use('/api/admin/upload', authenticateAdmin, adminUploadRoute);
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