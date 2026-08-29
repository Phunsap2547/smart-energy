# Admin Backend (Node.js + Express + PostgreSQL + Docker)

โครงสร้างระบบ login สำหรับ admin เท่านั้น (user ทั่วไปเข้าถึง route สาธารณะได้โดยไม่ต้อง login)

## โครงสร้างไฟล์

```
admin-backend/
├── docker-compose.yml
├── init.sql                  # สร้างตาราง admins อัตโนมัติตอน postgres เริ่มครั้งแรก
├── .env.example               # ตัวแปรสำหรับ docker-compose (DB_USER, DB_PASSWORD, DB_NAME)
└── backend/
    ├── Dockerfile
    ├── package.json
    ├── .env.example            # ตัวแปรที่โค้ด backend ใช้ (DB connection, JWT_SECRET)
    └── src/
        ├── index.js            # entry point, รวม route
        ├── db.js               # เชื่อมต่อ PostgreSQL
        ├── middleware/auth.js  # ตรวจสอบ JWT token
        ├── routes/admin.js     # POST /api/admin/login, GET /api/admin/me
        └── scripts/seedAdmin.js # สคริปต์สร้าง admin คนแรก
```

## ขั้นตอนการติดตั้งและรัน

### 1. ตั้งค่าตัวแปรแวดล้อม

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

แก้ค่าในทั้งสองไฟล์ให้ตรงกัน (DB_USER, DB_PASSWORD, DB_NAME ต้องเหมือนกันทั้ง 2 ไฟล์)
และตั้ง `JWT_SECRET` ใน `backend/.env` เป็นข้อความสุ่มยาวๆ (ห้ามใช้ค่า default ตอน deploy จริง)

### 2. รัน Docker

```bash
docker compose up -d --build
```

คำสั่งนี้จะ:
- รัน PostgreSQL container และสร้างตาราง `admins` อัตโนมัติจาก `init.sql`
- build และรัน backend container ที่ port `4000`

ตรวจสอบว่ารันสำเร็จ:
```bash
docker compose ps
curl http://localhost:4000
```

### 3. สร้าง admin คนแรก

เนื่องจากเราไม่เปิด route สมัคร admin แบบสาธารณะ (เพื่อความปลอดภัย) ให้สร้าง admin ผ่านสคริปต์แทน:

```bash
docker compose exec backend npm run seed:admin -- myadmin mypassword123
```

(เปลี่ยน `myadmin` และ `mypassword123` เป็นค่าที่ต้องการ)

### 4. ทดสอบ login

```bash
curl -X POST http://localhost:4000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"myadmin","password":"mypassword123"}'
```

จะได้ token กลับมา เอา token นี้ไปแนบใน header ตอนเรียก route ที่ต้อง login:

```bash
curl http://localhost:4000/api/admin/me \
  -H "Authorization: Bearer <token ที่ได้จากขั้นตอนก่อนหน้า>"
```

## เชื่อมกับ Frontend

หลัง login สำเร็จ ให้เก็บ `token` ไว้ (เช่น localStorage หรือ state) แล้วแนบไปกับทุก request ที่ต้องใช้สิทธิ์ admin:

```js
fetch('http://localhost:4000/api/admin/me', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

## เพิ่ม route ใหม่ที่ต้องป้องกันด้วย admin

ใน `backend/src/routes/admin.js` (หรือสร้างไฟล์ route ใหม่) ใส่ `authenticateAdmin` เป็น middleware ก่อน handler ได้เลย:

```js
router.post('/products', authenticateAdmin, createProductHandler);
```

## API ทั้งหมดในระบบ

### ฝั่ง public (ไม่ต้อง login — ดู + ค้นหา/กรอง)

| Method | Endpoint | คำอธิบาย |
|---|---|---|
| GET | `/api/buildings?search=` | รายชื่ออาคารทั้งหมด |
| GET | `/api/buildings/:id` | ข้อมูลอาคารเดียว |
| GET | `/api/devices?building_id=&search=` | รายการอุปกรณ์ |
| GET | `/api/devices/:id` | ข้อมูลอุปกรณ์เดียว |
| GET | `/api/readings?device_id=&from=&to=&limit=&page=` | ค่าไฟฟ้าตามช่วงเวลา (สำหรับกราฟ) |
| GET | `/api/readings/latest?device_id=` | ค่าไฟฟ้าล่าสุดของอุปกรณ์ (real-time) |
| GET | `/api/alerts?device_id=&type=&status=&from=&to=` | รายการ anomaly ที่ตรวจพบ |

### ฝั่ง admin (ต้อง login ด้วย Bearer token)

| Method | Endpoint | คำอธิบาย |
|---|---|---|
| POST | `/api/admin/login` | login |
| GET | `/api/admin/me` | ตรวจสอบ token |
| POST/PUT/DELETE | `/api/admin/buildings` | จัดการอาคาร |
| POST/PUT/DELETE | `/api/admin/devices` | จัดการอุปกรณ์ |
| PATCH | `/api/admin/alerts/:id` | เปลี่ยนสถานะ alert (open/acknowledged/resolved) |

### ฝั่ง ingest (ใช้ API key แทน login — สำหรับ IoT pipeline / โมเดล ML ยิงข้อมูลเข้ามา)

แนบ header `x-api-key: <ค่าจาก INGEST_API_KEY ใน .env>` ทุก request

| Method | Endpoint | คำอธิบาย |
|---|---|---|
| POST | `/api/ingest/readings` | บันทึกค่าไฟฟ้า 3 เฟสที่อ่านได้ |
| POST | `/api/ingest/anomalies` | บันทึกผลตรวจจับ anomaly จากโมเดล |

ตัวอย่าง body ของ `/api/ingest/readings`:
```json
{
  "device_id": 1,
  "voltage_a": 220.5, "voltage_b": 219.8, "voltage_c": 221.1,
  "current_a": 12.3, "current_b": 11.9, "current_c": 12.1,
  "power_kw": 8.2, "energy_kwh": 145.67
}
```

ตัวอย่าง body ของ `/api/ingest/anomalies` (type ต้องเป็นหนึ่งใน power_outage, short_circuit, overload, voltage_drop, voltage_surge):
```json
{
  "device_id": 1,
  "type": "overload",
  "severity": "high",
  "description": "Current exceeded threshold on phase A"
}
```

## ข้อควรระวังก่อนใช้งานจริง (production)

- เปลี่ยน `JWT_SECRET` เป็นค่าสุ่มยาวๆ ไม่ใช้ค่า default
- ห้าม commit ไฟล์ `.env` ขึ้น git (มี `.gitignore` กันไว้ให้แล้ว)
- พิจารณาเก็บ token ใน httpOnly cookie แทน localStorage เพื่อป้องกัน XSS
- เปิด HTTPS เมื่อ deploy จริง
- จำกัดจำนวนครั้งที่ลอง login ผิด (rate limiting) เพื่อป้องกัน brute-force
