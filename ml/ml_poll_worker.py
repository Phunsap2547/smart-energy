# -*- coding: utf-8 -*-
"""
ml_poll_worker.py — วนอ่านแถวใหม่ใน energy_readings จาก Supabase -> ให้โมเดลวิเคราะห์ -> insert ลง anomalies

ใช้เมื่ออุปกรณ์ IoT เขียนค่าเข้า Supabase ตรงๆ (ไม่ผ่าน Node) หรือผ่าน Node ก็ได้
เพราะทุกทางลงที่ตาราง energy_readings เหมือนกัน

รัน:  python ml_poll_worker.py
env ที่ต้องมี: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (หรือ SUPABASE_KEY), (ไม่บังคับ) POLL_SEC, MODEL_DIR
ต้องมีโฟลเดอร์ models/ ที่มีไฟล์ .joblib ทั้ง 3 ไฟล์ (ใช้โมเดลชุดเดียวกับ ml_worker.py)
"""
import logging
import os
import time

from supabase import create_client

from ml_worker import Reading, predict  # ใช้ตรรกะทำนายชุดเดียวกับ API

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("ml_poll")

POLL_SEC = float(os.getenv("POLL_SEC", "5"))
COLS = (
    "device_id,reading_time,voltage_a,voltage_b,voltage_c,"
    "current_a,current_b,current_c,pf_a,pf_b,pf_c"
)

sb = create_client(
    os.environ["SUPABASE_URL"],
    os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ["SUPABASE_KEY"],
)


BUILDING_RANK = {"warning": 1, "high": 2, "critical": 3}
BUILDING_STATUS = {0: "normal", 1: "warning",  2: "critical"}
ACTIVE_STATUSES = ["open", "investigating"]  # ยังไม่ปิดเรื่อง -> ไม่สร้างซ้ำ


def update_building_status(device_id: int) -> None:
    """คำนวณสถานะอาคารใหม่ ใช้ตรรกะเดียวกับ PATCH /api/admin/alerts/:id ใน adminAlerts.js"""
    rows = sb.table("devices").select("building_id").eq("id", device_id).limit(1).execute().data
    building_id = rows[0]["building_id"] if rows else None
    if not building_id:
        return
    active = (
        sb.table("anomalies").select("severity, devices!inner(building_id)")
        .eq("devices.building_id", building_id).eq("status", "open")
        .execute().data
    )
    rank = max((BUILDING_RANK.get(a["severity"], 0) for a in active), default=0)
    sb.table("buildings").update({"status": BUILDING_STATUS[rank]}).eq("id", building_id).execute()


def handle(row: dict) -> None:
    try:
        device_id = int(row["device_id"])  # anomalies.device_id เป็น integer
    except (TypeError, ValueError):
        log.warning("ข้าม: device_id ไม่ใช่ตัวเลข %r", row.get("device_id"))
        return

    result = predict(Reading(**row))
    if not result["is_anomaly"]:
        return

    created = False
    for a in result["anomalies"]:
        # กันแจ้งเตือนรัว: ถ้ามีชนิดเดียวกันที่ยังไม่ปิด (open/investigating) ไม่สร้างซ้ำ
        exists = (
            sb.table("anomalies").select("id")
            .eq("device_id", device_id).eq("type", a["type"]).in_("status", ACTIVE_STATUSES)
            .limit(1).execute().data
        )
        if exists:
            continue
        sb.table("anomalies").insert({
            "device_id": device_id,
            "type": a["type"],
            "severity": a["severity"],
            "description": a["description"],
        }).execute()
        created = True
        log.info("🚨 device %s: %s", device_id, a["description"])

    if created:  # backend อัปเดตสถานะอาคารตอน PATCH เท่านั้น จึงต้องทำตอนสร้างด้วย
        try:
            update_building_status(device_id)
        except Exception as e:
            log.error("อัปเดตสถานะอาคารไม่สำเร็จ: %s", e)


def latest_time():
    r = (
        sb.table("energy_readings").select("reading_time")
        .order("reading_time", desc=True).limit(1).execute().data
    )
    return r[0]["reading_time"] if r else None


def main() -> None:
    cursor = latest_time()  # เริ่มจากล่าสุด ไม่ย้อนประมวลผลข้อมูลเก่า
    seen = set()  # (device_id, reading_time) ที่ประมวลผลแล้วที่ตำแหน่ง cursor
    log.info("เริ่ม poll ทุก %.0f วินาที cursor=%s", POLL_SEC, cursor)

    while True:
        try:
            q = sb.table("energy_readings").select(COLS).order("reading_time").limit(500)
            if cursor:
                q = q.gte("reading_time", cursor)  # gte + seen กันพลาดแถวที่เวลาเท่ากัน
            for row in q.execute().data:
                key = (row["device_id"], row["reading_time"])
                if key in seen:
                    continue
                handle(row)
                seen.add(key)
                cursor = row["reading_time"]  # เรียงจากเก่าไปใหม่
            seen = {k for k in seen if k[1] == cursor}
        except Exception as e:  # เน็ต/DB สะดุดแล้ววนต่อ ไม่ให้ worker ตาย
            log.error("poll error: %s", e)
        time.sleep(POLL_SEC)


if __name__ == "__main__":
    main()