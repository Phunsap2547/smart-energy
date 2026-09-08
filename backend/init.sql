CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 1. อาคารที่ติดตั้งระบบ (ถูกต้องแล้ว ไม่ต้องแก้)
CREATE TABLE IF NOT EXISTS buildings (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  location VARCHAR(255),
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  status VARCHAR(20) DEFAULT 'Normal', -- Normal | Warning | Critical
  image_url VARCHAR(500),              -- URL/พาธรูปภาพอาคาร
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. มิเตอร์/เซนเซอร์แต่ละตัว (ผูก building_id สมบูรณ์แล้ว ไม่ต้องแก้)
CREATE TABLE IF NOT EXISTS devices (
  id SERIAL PRIMARY KEY,
  building_id INTEGER NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  install_point VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_devices_building ON devices(building_id);

-- 3. สร้างตาราง energy_readings (โครงสร้างเดิมที่รองรับ voltage_a, current_a)
CREATE TABLE IF NOT EXISTS public.energy_readings (
    id BIGSERIAL PRIMARY KEY,
    device_id BIGINT REFERENCES public.devices(id) ON DELETE CASCADE,
    reading_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- แรงดันไฟฟ้า (Voltage)
    voltage_a NUMERIC(10,2),
    voltage_b NUMERIC(10,2),
    voltage_c NUMERIC(10,2),
    voltage_system NUMERIC(10,2),

    -- กระแสไฟฟ้า (Current)
    current_a NUMERIC(10,2),
    current_b NUMERIC(10,2),
    current_c NUMERIC(10,2),
    current_system NUMERIC(10,2),

    -- กำลังไฟฟ้า และ พลังงาน (Power & Energy)
    power_a NUMERIC(10,2),
    power_b NUMERIC(10,2),
    power_c NUMERIC(10,2),
    power_kw NUMERIC(10,4),
    energy_kwh NUMERIC(12,4),

    -- ค่าทางไฟฟ้าอื่นๆ
    power_factor NUMERIC(5,3),
    frequency_hz NUMERIC(5,2),
    voltage_unbalance_pct NUMERIC(5,2),
    current_unbalance_pct NUMERIC(5,2),
    thd_voltage_l1_pct NUMERIC(5,2),
    thd_current_l1_pct NUMERIC(5,2)
);
CREATE INDEX IF NOT EXISTS idx_readings_device_time ON energy_readings(device_id, reading_time DESC);
-- เหตุการณ์ผิดปกติที่ตรวจจับได้ (จากโมเดล Random Forest / rule-based)
CREATE TABLE IF NOT EXISTS anomalies (
  id SERIAL PRIMARY KEY,
  device_id INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  detected_at TIMESTAMP NOT NULL DEFAULT NOW(),
  type VARCHAR(50) NOT NULL CHECK (type IN ('power_outage','short_circuit','overload','voltage_drop','voltage_surge')),
  severity VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open','acknowledged','resolved')),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_anomalies_device_time ON anomalies(device_id, detected_at DESC);
