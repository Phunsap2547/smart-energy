CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- -- อาคารที่ติดตั้งระบบ
CREATE TABLE IF NOT EXISTS buildings (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  location VARCHAR(255),
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  status VARCHAR(20) DEFAULT 'Normal', -- Normal | Warning | Critical
  image_url VARCHAR(500),              -- URL/พาธของรูปภาพอาคาร (nullable)
  created_at TIMESTAMP DEFAULT NOW()
);


-- มิเตอร์/เซนเซอร์แต่ละตัว ติดอยู่ในอาคารไหน
CREATE TABLE IF NOT EXISTS devices (
  id SERIAL PRIMARY KEY,
  building_id INTEGER NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  install_point VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_devices_building ON devices(building_id);

-- ค่าไฟฟ้า 3 เฟส ที่อ่านได้แบบ real-time จาก IoT pipeline
CREATE TABLE IF NOT EXISTS energy_readings (
  id BIGSERIAL PRIMARY KEY,
  device_id INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  reading_time TIMESTAMP NOT NULL DEFAULT NOW(),
  voltage_a NUMERIC(10,2),
  voltage_b NUMERIC(10,2),
  voltage_c NUMERIC(10,2),
  current_a NUMERIC(10,2),
  current_b NUMERIC(10,2),
  current_c NUMERIC(10,2),
  power_kw NUMERIC(10,2),
  energy_kwh NUMERIC(12,3),
  created_at TIMESTAMP DEFAULT NOW()
);
-- index ตัวนี้สำคัญมาก เพราะข้อมูลจะเข้ามาถี่และ query บ่อยตามช่วงเวลา
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
