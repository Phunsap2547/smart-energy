# -*- coding: utf-8 -*-
"""
ml_poll_worker.py — วนอ่านแถวใหม่ใน energy_readings จาก Supabase -> ให้โมเดลวิเคราะห์ -> insert ลง anomalies

ใช้เมื่ออุปกรณ์ IoT เขียนค่าเข้า Supabase ตรงๆ (ไม่ผ่าน Node) หรือผ่าน Node ก็ได้
เพราะทุกทางลงที่ตาราง energy_readings เหมือนกัน

รัน:  python ml_poll_worker.py
env ที่ต้องมี: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (หรือ SUPABASE_KEY), (ไม่บังคับ) POLL_SEC, MODEL_DIR
ต้องมีโฟลเดอร์ models/ ที่มีไฟล์ .joblib ทั้ง 3 ไฟล์ (ใช้โมเดลชุดเดียวกับ ml_worker.py)
"""
# import logging
# import os
# import time

# from dotenv import load_dotenv
# load_dotenv()

# from supabase import create_client

# from ml_worker import Reading, predict  # ใช้ตรรกะทำนายชุดเดียวกับ API

# logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
# log = logging.getLogger("ml_poll")

# POLL_SEC = float(os.getenv("POLL_SEC", "5"))
# COLS = (
#     "device_id,reading_time,voltage_a,voltage_b,voltage_c,voltage_system,"
#     "current_a,current_b,current_c,current_system,pf_a,pf_b,pf_c,power_factor"
# )

# sb = create_client(
#     os.environ["SUPABASE_URL"],
#     os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ["SUPABASE_KEY"],
# )


# BUILDING_RANK = {"warning": 1, "high": 2, "critical": 3}
# BUILDING_STATUS = {0: "normal", 1: "warning",  2: "critical"}
# ACTIVE_STATUSES = ["open", "investigating"]  # ยังไม่ปิดเรื่อง -> ไม่สร้างซ้ำ


# def update_building_status(device_id: int) -> None:
#     """คำนวณสถานะอาคารใหม่ ใช้ตรรกะเดียวกับ PATCH /api/admin/alerts/:id ใน adminAlerts.js"""
#     rows = sb.table("devices").select("building_id").eq("id", device_id).limit(1).execute().data
#     building_id = rows[0]["building_id"] if rows else None
#     if not building_id:
#         return
#     active = (
#         sb.table("anomalies").select("severity, devices!inner(building_id)")
#         .eq("devices.building_id", building_id).eq("status", "open")
#         .execute().data
#     )
#     rank = max((BUILDING_RANK.get(a["severity"], 0) for a in active), default=0)
#     sb.table("buildings").update({"status": BUILDING_STATUS[rank]}).eq("id", building_id).execute()


# def handle(row: dict) -> None:
#     try:
#         device_id = int(row["device_id"])  # anomalies.device_id เป็น integer
#     except (TypeError, ValueError):
#         log.warning("ข้าม: device_id ไม่ใช่ตัวเลข %r", row.get("device_id"))
#         return

#     result = predict(Reading(**row))
#     if not result["is_anomaly"]:
#         return

#     created = False
#     for a in result["anomalies"]:
#         # กันแจ้งเตือนรัว: ถ้ามีชนิดเดียวกันที่ยังไม่ปิด (open/investigating) ไม่สร้างซ้ำ
#         exists = (
#             sb.table("anomalies").select("id")
#             .eq("device_id", device_id).eq("type", a["type"]).in_("status", ACTIVE_STATUSES)
#             .limit(1).execute().data
#         )
#         if exists:
#             continue
#         sb.table("anomalies").insert({
#             "device_id": device_id,
#             "type": a["type"],
#             "severity": a["severity"],
#             "description": a["description"],
#         }).execute()
#         created = True
#         log.info("🚨 device %s: %s", device_id, a["description"])

#     if created:  # backend อัปเดตสถานะอาคารตอน PATCH เท่านั้น จึงต้องทำตอนสร้างด้วย
#         try:
#             update_building_status(device_id)
#         except Exception as e:
#             log.error("อัปเดตสถานะอาคารไม่สำเร็จ: %s", e)


# def latest_time():
#     r = (
#         sb.table("energy_readings").select("reading_time")
#         .order("reading_time", desc=True).limit(1).execute().data
#     )
#     return r[0]["reading_time"] if r else None


# def main() -> None:
#     cursor = latest_time()  # เริ่มจากล่าสุด ไม่ย้อนประมวลผลข้อมูลเก่า
#     seen = set()  # (device_id, reading_time) ที่ประมวลผลแล้วที่ตำแหน่ง cursor
#     log.info("เริ่ม poll ทุก %.0f วินาที cursor=%s", POLL_SEC, cursor)

#     while True:
#         try:
#             q = sb.table("energy_readings").select(COLS).order("reading_time").limit(500)
#             if cursor:
#                 q = q.gte("reading_time", cursor)  # gte + seen กันพลาดแถวที่เวลาเท่ากัน
#             for row in q.execute().data:
#                 key = (row["device_id"], row["reading_time"])
#                 if key in seen:
#                     continue
#                 handle(row)
#                 seen.add(key)
#                 cursor = row["reading_time"]  # เรียงจากเก่าไปใหม่
#             seen = {k for k in seen if k[1] == cursor}
#         except Exception as e:  # เน็ต/DB สะดุดแล้ววนต่อ ไม่ให้ worker ตาย
#             log.error("poll error: %s", e)
#         time.sleep(POLL_SEC)


# if __name__ == "__main__":
#     main()

# import logging
# import os
# import time

# from dotenv import load_dotenv
# load_dotenv()

# from supabase import create_client

# from ml_worker import Reading, predict  # ใช้ตรรกะทำนายชุดเดียวกับ API

# logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
# log = logging.getLogger("ml_poll")

# POLL_SEC = float(os.getenv("POLL_SEC", "5"))
# COLS = (
#     "device_id,reading_time,voltage_a,voltage_b,voltage_c,voltage_system,"
#     "current_a,current_b,current_c,current_system,pf_a,pf_b,pf_c,power_factor"
# )

# sb = create_client(
#     os.environ["SUPABASE_URL"],
#     os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ["SUPABASE_KEY"],
# )


# BUILDING_RANK = {"warning": 1, "high": 2, "critical": 3}
# # แก้ให้ตรงกับ backend (adminAlerts.js): high -> warning, critical -> critical
# BUILDING_STATUS = {0: "normal", 1: "warning", 2: "warning", 3: "critical"}
# ACTIVE_STATUSES = ["open", "investigating"]  # ยังไม่ปิดเรื่อง -> ไม่สร้างซ้ำ


# def update_building_status(device_id: int) -> None:
#     """คำนวณสถานะอาคารใหม่ ใช้ตรรกะเดียวกับ PATCH /api/admin/alerts/:id ใน adminAlerts.js"""
#     rows = sb.table("devices").select("building_id").eq("id", device_id).limit(1).execute().data
#     building_id = rows[0]["building_id"] if rows else None
#     if not building_id:
#         return
#     active = (
#         sb.table("anomalies").select("severity, devices!inner(building_id)")
#         .eq("devices.building_id", building_id).eq("status", "open")
#         .execute().data
#     )
#     rank = max((BUILDING_RANK.get(a["severity"], 0) for a in active), default=0)
#     sb.table("buildings").update({"status": BUILDING_STATUS[rank]}).eq("id", building_id).execute()


# def auto_resolve(device_id: int, current_types: set) -> bool:
#     """ปิด anomaly ที่ยัง open แต่รอบนี้โมเดลไม่เจอแล้ว (ค่ากลับมาปกติ)"""
#     open_rows = (
#         sb.table("anomalies").select("id,type")
#         .eq("device_id", device_id).in_("status", ACTIVE_STATUSES)
#         .execute().data
#     )
#     ids = [r["id"] for r in open_rows if r["type"] not in current_types]
#     if not ids:
#         return False
#     sb.table("anomalies").update({"status": "resolved"}).in_("id", ids).execute()
#     log.info("✅ device %s: ปิดอัตโนมัติ %d รายการ (ค่ากลับมาปกติ)", device_id, len(ids))
#     return True


# def handle(row: dict) -> None:
#     try:
#         device_id = int(row["device_id"])  # anomalies.device_id เป็น integer
#     except (TypeError, ValueError):
#         log.warning("ข้าม: device_id ไม่ใช่ตัวเลข %r", row.get("device_id"))
#         return

#     result = predict(Reading(**row))
#     found = result["anomalies"] if result["is_anomaly"] else []
#     current_types = {a["type"] for a in found}

#     changed = auto_resolve(device_id, current_types)  # ปิดอันที่หายแล้ว
#     created = False

#     for a in found:
#         # กันแจ้งเตือนรัว: ถ้ามีชนิดเดียวกันที่ยังไม่ปิด (open/investigating) ไม่สร้างซ้ำ
#         exists = (
#             sb.table("anomalies").select("id")
#             .eq("device_id", device_id).eq("type", a["type"]).in_("status", ACTIVE_STATUSES)
#             .limit(1).execute().data
#         )
#         if exists:
#             continue
#         sb.table("anomalies").insert({
#             "device_id": device_id,
#             "type": a["type"],
#             "severity": a["severity"],
#             "description": a["description"],
#         }).execute()
#         created = True
#         log.info("🚨 device %s: %s", device_id, a["description"])

#     if created or changed:  # อัปเดตสถานะอาคารเมื่อมีการสร้างหรือปิด
#         try:
#             update_building_status(device_id)
#         except Exception as e:
#             log.error("อัปเดตสถานะอาคารไม่สำเร็จ: %s", e)


# def latest_time():
#     r = (
#         sb.table("energy_readings").select("reading_time")
#         .order("reading_time", desc=True).limit(1).execute().data
#     )
#     return r[0]["reading_time"] if r else None


# def main() -> None:
#     cursor = latest_time()  # เริ่มจากล่าสุด ไม่ย้อนประมวลผลข้อมูลเก่า
#     seen = set()  # (device_id, reading_time) ที่ประมวลผลแล้วที่ตำแหน่ง cursor
#     log.info("เริ่ม poll ทุก %.0f วินาที cursor=%s", POLL_SEC, cursor)

#     while True:
#         try:
#             q = sb.table("energy_readings").select(COLS).order("reading_time").limit(500)
#             if cursor:
#                 q = q.gte("reading_time", cursor)  # gte + seen กันพลาดแถวที่เวลาเท่ากัน
#             for row in q.execute().data:
#                 key = (row["device_id"], row["reading_time"])
#                 if key in seen:
#                     continue
#                 handle(row)
#                 seen.add(key)
#                 cursor = row["reading_time"]  # เรียงจากเก่าไปใหม่
#             seen = {k for k in seen if k[1] == cursor}
#         except Exception as e:  # เน็ต/DB สะดุดแล้ววนต่อ ไม่ให้ worker ตาย
#             log.error("poll error: %s", e)
#         time.sleep(POLL_SEC)


# if __name__ == "__main__":
#     main()

# from datetime import datetime

# # --- เกณฑ์ไฟ 1 เฟส (220V) ---
# VOLTAGE_OUTAGE_TH = 22.0     # < 22V  = ไฟดับ
# VOLTAGE_OVER_TH = 240.0      # > 240V = ไฟเกิน
# VOLTAGE_SAG_TH = 200.0       # < 200V = ไฟตก/ไฟต่ำ
# SAG_DURATION_SEC = 60        # ต่ำต่อเนื่อง > 60 วินาที = ไฟต่ำ, ไม่เกิน = ไฟตก

# low_since = {}               # device_id -> เวลา (datetime) ที่เริ่มต่ำกว่า 200V


# def low_duration_sec(device_id: int, v: float, reading_time: str) -> float:
#     """ระยะเวลา (วินาที) ที่แรงดันต่ำกว่า VOLTAGE_SAG_TH ต่อเนื่อง"""
#     if v >= VOLTAGE_SAG_TH:
#         low_since.pop(device_id, None)
#         return 0.0
#     t = datetime.fromisoformat(reading_time.replace("Z", "+00:00")).replace(tzinfo=None)
#     start = low_since.setdefault(device_id, t)
#     return (t - start).total_seconds()


# def check_power_status(v: float, duration_sec: float = 0) -> str:
#     if v < VOLTAGE_OUTAGE_TH:
#         return "⚫ ไฟดับ (Power Outage)"
#     elif v > VOLTAGE_OVER_TH:
#         return "🔺 ไฟเกิน (Over Voltage)"
#     elif v < VOLTAGE_SAG_TH:
#         if duration_sec > SAG_DURATION_SEC:
#             return "🔻 ไฟต่ำ (Undervoltage)"
#         return "📉 ไฟตก (Voltage Sag)"
#     return "✅ ไฟปกติ (Normal)"


# # แปลงผลเป็น type/severity ที่ตารางและหน้าเว็บใช้
# STATUS_MAP = {
#     "⚫": ("power_outage", "critical", "ไฟดับ"),
#     "🔺": ("over_voltage", "high", "ไฟเกิน"),
#     "🔻": ("under_voltage", "high", "ไฟต่ำ"),
#     "📉": ("voltage_sag", "warning", "ไฟตก"),
# }


# def check_single_phase(row: dict) -> list:
#     v = row.get("voltage_a")
#     if v is None:
#         return []
#     v = float(v)
#     device_id = int(row["device_id"])
#     dur = low_duration_sec(device_id, v, row["reading_time"])
#     status = check_power_status(v, dur)
#     info = STATUS_MAP.get(status[0])
#     if info is None:
#         return []
#     t, sev, th = info
#     return [{"type": t, "severity": sev, "description": f"{th} เฟส L1 (L1={v:.1f}V)"}]
   
# if __name__ == "__main__":
#       run_worker()

# -*- coding: utf-8 -*-
"""
ml_poll_worker.py — วนอ่านแถวใหม่ใน energy_readings จาก Supabase
-> ตรวจแรงดันไฟ 1 เฟส -> insert / ปิดอัตโนมัติ ในตาราง anomalies

รัน:  python ml_poll_worker.py
env:  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (หรือ SUPABASE_KEY), POLL_SEC (ไม่บังคับ)
"""
# -*- coding: utf-8 -*-
"""
ml_poll_worker.py — วนอ่านแถวใหม่ใน energy_readings จาก Supabase
-> ตรวจแรงดันไฟ 1 เฟส + ตรวจอุปกรณ์ offline -> insert / ปิดอัตโนมัติ ในตาราง anomalies

รัน:  python ml_poll_worker.py
env:  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (หรือ SUPABASE_KEY)
      POLL_SEC (ไม่บังคับ, ค่าเริ่มต้น 5), OFFLINE_SEC (ไม่บังคับ, ค่าเริ่มต้น 900)
"""
# -*- coding: utf-8 -*-
"""
ml_poll_worker.py — วนอ่านแถวใหม่ใน energy_readings จาก Supabase
-> ตรวจแรงดันไฟ 1 เฟส + ตรวจอุปกรณ์ offline -> insert / ปิดอัตโนมัติ ในตาราง anomalies

รัน:  python ml_poll_worker.py
env:  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (หรือ SUPABASE_KEY)
      POLL_SEC (ไม่บังคับ, ค่าเริ่มต้น 5), OFFLINE_SEC (ไม่บังคับ, ค่าเริ่มต้น 900)
"""
# -*- coding: utf-8 -*-
"""
ml_poll_worker.py — วนอ่านแถวใหม่ใน energy_readings จาก Supabase
-> ตรวจแรงดันไฟ 1 เฟส/3 เฟส + ตรวจอุปกรณ์ offline -> insert / ปิดอัตโนมัติ ในตาราง anomalies

รัน:  python ml_poll_worker.py
env:  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (หรือ SUPABASE_KEY)
      POLL_SEC (ไม่บังคับ, ค่าเริ่มต้น 5), OFFLINE_SEC (ไม่บังคับ, ค่าเริ่มต้น 900)
"""


#ml_poll_worker.py
import logging
import os
import time
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
load_dotenv()

from supabase import create_client

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("ml_poll")

POLL_SEC = float(os.getenv("POLL_SEC", "5"))
OFFLINE_SEC = float(os.getenv("OFFLINE_SEC", "900"))   # เกินกี่วินาทีถือว่า Offline
OFFLINE_TYPE = "device_offline"
OFFLINE_CHECK_SEC = 10                                  # ตรวจ Offline ทุกๆ 10 วินาที
BACKFILL_MAX_HOURS = float(os.getenv("BACKFILL_MAX_HOURS", "24"))
CURSOR_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".cursor")
DEVICE_IDS = [int(x) for x in os.getenv("DEVICE_IDS", "").split(",") if x.strip()]

COLS = (
    "device_id,reading_time,voltage_a,voltage_b,voltage_c,voltage_system,"
    "current_a,current_b,current_c,current_system,pf_a,pf_b,pf_c,power_factor"
)

sb = create_client(
    os.environ["SUPABASE_URL"],
    os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ["SUPABASE_KEY"],
)

BUILDING_RANK = {"warning": 1, "high": 2, "critical": 3}
BUILDING_STATUS = {0: "normal", 1: "warning", 2: "warning", 3: "critical"}
ACTIVE_STATUSES = ["open", "investigating"]

# ✅ คำคีย์เวิร์ดประเภท Alert ที่ห้ามโดน Auto-Resolve โดยฟังก์ชันอ่านค่าไฟ
IGNORE_AUTO_RESOLVE_KEYWORDS = [
    OFFLINE_TYPE,
    "ตรวจพบไฟดับหรือสัญญาณขาดหาย",
]

VOLTAGE_OUTAGE_TH = 22.0
VOLTAGE_OVER_TH = 240.0
VOLTAGE_SAG_TH = 200.0
SAG_DURATION_SEC = 60

DAY_START_HOUR = 6    # 06:00
DAY_END_HOUR   = 18   # 18:00
NIGHT_CURRENT_TH = 0.5 # เกณฑ์กระแสไฟฟ้า (A) ที่ถือว่ามีการใช้ไฟกลางคืน

low_since = {}

MONTHS_TH = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."]


def parse_to_utc(dt_str: str) -> datetime:
    """แปลง ISO datetime string ให้เป็น UTC datetime โดยระบุ Timezone ไทย (+07:00) ให้ถูกต้อง"""
    clean_str = dt_str.replace("Z", "+00:00")
    dt = datetime.fromisoformat(clean_str)
    
    if dt.tzinfo is None:
        local_tz = timezone(timedelta(hours=7))
        dt = dt.replace(tzinfo=local_tz)
        
    return dt.astimezone(timezone.utc)


def format_thai_dt(dt: datetime) -> str:
    """แปลง datetime เป็นรูปแบบ 'D ม.ค. HH:MM'"""
    dt_local = dt.astimezone()
    month_name = MONTHS_TH[dt_local.month - 1]
    return f"{dt_local.day} {month_name} {dt_local:%H:%M}"


def format_duration_thai(seconds: float) -> str:
    """แปลงจำนวนวินาทีเป็น 'X ชม. Y นาที' หรือ 'X นาที'"""
    total_minutes = int(seconds // 60)
    hours = total_minutes // 60
    minutes = total_minutes % 60
    
    if hours > 0:
        return f"{hours} ชม. {minutes} นาที"
    return f"{minutes} นาที"


def low_duration_sec(key, v: float, reading_time: str) -> float:
    if v >= VOLTAGE_SAG_TH:
        low_since.pop(key, None)
        return 0.0
    t = parse_to_utc(reading_time)
    start = low_since.setdefault(key, t)
    return (t - start).total_seconds()


def check_power_status(v: float, duration_sec: float = 0) -> str:
    if v < VOLTAGE_OUTAGE_TH:
        return "✅ ไฟปกติ (Normal)" #"⚫ ไฟดับ (Power Outage)"
    elif v > VOLTAGE_OVER_TH:
        return "🔺 ไฟเกิน (Over Voltage)"
    elif v < VOLTAGE_SAG_TH:
        if duration_sec > SAG_DURATION_SEC:
            return "🔻 ไฟต่ำ (Undervoltage)"
        return "📉 ไฟตก (Voltage Sag)"
    return "✅ ไฟปกติ (Normal)"


STATUS_MAP = {
    #"⚫": ("power_outage", "critical", "ไฟดับ"),
    "🔺": ("over_voltage", "high", "ไฟเกิน"),
    "🔻": ("under_voltage", "high", "ไฟต่ำ"),
    "📉": ("voltage_sag", "warning", "ไฟตก"),
}

PHASES = [("L1", "voltage_a"), ("L2", "voltage_b"), ("L3", "voltage_c")]


def check_voltage(row: dict) -> list:
    device_id = int(row["device_id"])
    groups = {}
    for name, col in PHASES:
        v = row.get(col)
        if v is None:
            continue
        v = float(v)
        dur = low_duration_sec((device_id, name), v, row["reading_time"])
        info = STATUS_MAP.get(check_power_status(v, dur)[0])
        if info is None:
            continue
        t, sev, th = info
        groups.setdefault(t, (sev, th, []))[2].append((name, v))

    out = []
    for t, (sev, th, items) in groups.items():
        names = ", ".join(n for n, _ in items)
        vals = ", ".join(f"{n}={v:.1f}V" for n, v in items)
        out.append({"type": t, "severity": sev, "description": f"{th} เฟส {names} ({vals})"})
    return out


def check_night_usage(row: dict) -> list:
    """ตรวจสอบการใช้ไฟฟ้าในเวลากลางคืน"""
    reading_dt = parse_to_utc(row["reading_time"]).astimezone()
    hour = reading_dt.hour
    
    is_night = hour >= DAY_END_HOUR or hour < DAY_START_HOUR
    if not is_night:
        return []

    i_sys = float(row.get("current_system") or 0.0)
    if i_sys > NIGHT_CURRENT_TH:
        return [{
            "type": "night_usage",
            "severity": "warning",
            "description": f"มีการใช้ไฟฟ้ากลางคืน (กระแสไฟ {i_sys:.2f}A เวลา {reading_dt:%H:%M})"
        }]
    return []


def update_building_status(device_id: int) -> None:
    try:
        dev_res = sb.table("devices").select("building_id").eq("id", device_id).limit(1).execute().data
        if not dev_res or not dev_res[0].get("building_id"):
            return
        building_id = dev_res[0]["building_id"]

        b_devs = sb.table("devices").select("id").eq("building_id", building_id).execute().data
        dev_ids = [d["id"] for d in b_devs]
        if not dev_ids:
            return

        active = (
            sb.table("anomalies").select("severity")
            .in_("device_id", dev_ids).in_("status", ACTIVE_STATUSES)
            .execute().data
        )
        rank = max((BUILDING_RANK.get(a["severity"], 0) for a in active), default=0)
        sb.table("buildings").update({"status": BUILDING_STATUS[rank]}).eq("id", building_id).execute()
    except Exception as e:
        log.error("อัปเดตสถานะอาคารล้มเหลว: %s", e)


def is_ignored_type(alert_type: str) -> bool:
    """เช็กว่าประเภท Alert ตรงกับคีย์เวิร์ดที่ต้องข้าม Auto-Resolve หรือไม่"""
    if not alert_type:
        return False
    return any(kw in alert_type for kw in IGNORE_AUTO_RESOLVE_KEYWORDS)


def auto_resolve_voltage(device_id: int, current_voltage_types: set) -> bool:
    open_rows = (
        sb.table("anomalies").select("id, type")
        .eq("device_id", device_id).in_("status", ACTIVE_STATUSES)
        .execute().data
    )
    
    ids = [
        r["id"] for r in open_rows 
        if r["type"] not in current_voltage_types 
        and not is_ignored_type(r["type"])
    ]
    
    if not ids:
        return False
        
    sb.table("anomalies").update({"status": "resolved"}).in_("id", ids).execute()
    log.info("✅ device %s: ปิด Alert ที่กลับเป็นปกติแล้ว %d รายการ", device_id, len(ids))
    return True


def handle(row: dict) -> None:
    try:
        device_id = int(row["device_id"])
    except (TypeError, ValueError):
        return

    found = check_voltage(row)
    found.extend(check_night_usage(row))

    current_types = {a["type"] for a in found}

    changed = auto_resolve_voltage(device_id, current_types)
    created = False

    for a in found:
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

    if created or changed:
        update_building_status(device_id)


def check_offline() -> None:
    """ไม่บันทึก alert ไฟดับ (frontend/RPC เป็นเจ้าของ)
    ทำแค่เคลียร์ alert แรงดันค้างเมื่ออุปกรณ์เงียบเกิน OFFLINE_SEC"""
    now_utc = datetime.now(timezone.utc)

    devices_q = sb.table("devices").select("id")
    if DEVICE_IDS:
        devices_q = devices_q.in_("id", DEVICE_IDS)

    for d in devices_q.execute().data:
        did = d["id"]
        r = (
            sb.table("energy_readings").select("reading_time")
            .eq("device_id", did).order("reading_time", desc=True).limit(1).execute().data
        )
        if not r:
            continue

        age = (now_utc - parse_to_utc(r[0]["reading_time"])).total_seconds()
        if age <= OFFLINE_SEC:
            continue

        open_rows = (
            sb.table("anomalies").select("id")
            .eq("device_id", did).in_("status", ACTIVE_STATUSES)
            .execute().data
        )
        if not open_rows:
            continue

        sb.table("anomalies").update({"status": "resolved"}) \
            .in_("id", [x["id"] for x in open_rows]).execute()

        for k in [k for k in low_since if k[0] == did]:
            low_since.pop(k, None)

        log.info("⚫ device %s: เงียบ %.0f วินาที ปิด alert แรงดันที่ค้าง %d รายการ",
                 did, age, len(open_rows))
        update_building_status(did)

def latest_time():
    r = (
        sb.table("energy_readings").select("reading_time")
        .order("reading_time", desc=True).limit(1).execute().data
    )
    return r[0]["reading_time"] if r else None


def load_cursor():
    try:
        with open(CURSOR_FILE, encoding="utf-8") as f:
            saved = f.read().strip()
    except FileNotFoundError:
        return latest_time()
    if not saved:
        return latest_time()
    limit = datetime.now(timezone.utc) - timedelta(hours=BACKFILL_MAX_HOURS)
    t = parse_to_utc(saved)
    return limit.isoformat() if t < limit else saved


def save_cursor(value) -> None:
    try:
        with open(CURSOR_FILE, "w", encoding="utf-8") as f:
            f.write(str(value))
    except OSError as e:
        log.error("บันทึก cursor ไม่สำเร็จ: %s", e)


def main() -> None:
    cursor = load_cursor()
    seen = set()
    last_offline_check = 0.0
    log.info("เริ่มรันสคริปต์... POLL_SEC=%.0f, OFFLINE_SEC=%.0f", POLL_SEC, OFFLINE_SEC)

    while True:
        batch = 0
        try:
            q = sb.table("energy_readings").select(COLS).order("reading_time").limit(500)
            if cursor:
                q = q.gte("reading_time", cursor)
            if DEVICE_IDS:
                q = q.in_("device_id", DEVICE_IDS)
            rows = q.execute().data
            batch = len(rows)
            for row in rows:
                key = (row["device_id"], row["reading_time"])
                if key in seen:
                    continue
                handle(row)
                seen.add(key)
                cursor = row["reading_time"]
            seen = {k for k in seen if k[1] == cursor}
            if cursor:
                save_cursor(cursor)
        except Exception as e:
            log.error("poll error: %s", e)

        if time.time() - last_offline_check >= OFFLINE_CHECK_SEC:
            last_offline_check = time.time()
            try:
                check_offline()
            except Exception as e:
                log.error("check_offline error: %s", e)

        if batch < 500:
            time.sleep(POLL_SEC)


if __name__ == "__main__":
    main()



    # def check_offline() -> None:
#     now_utc = datetime.now(timezone.utc)
    
#     devices_q = sb.table("devices").select("id")
#     if DEVICE_IDS:
#         devices_q = devices_q.in_("id", DEVICE_IDS)
    
#     devices = devices_q.execute().data

#     for d in devices:
#         did = d["id"]
#         r = (
#             sb.table("energy_readings").select("reading_time")
#             .eq("device_id", did).order("reading_time", desc=True).limit(1).execute().data
#         )
        
#         if not r:
#             age = 999999.0
#             last_desc = "ไม่เคยส่งข้อมูล"
#             last_utc = None
#         else:
#             last_utc = parse_to_utc(r[0]["reading_time"])
#             age = (now_utc - last_utc).total_seconds()
#             last_local = last_utc.astimezone()
#             last_desc = f"(ล่าสุด {last_local:%H:%M:%S})"

#         log.info(f"🔍 [CHECK] Device {did} | เงียบไปแล้ว: {age:.1f} วินาที | เกณฑ์ Offline: {OFFLINE_SEC} วินาที")

#         # ดึง Alert ที่ยังค้างอยู่ทั้งหมดของ Device
#         open_anomalies = (
#             sb.table("anomalies").select("id, type, created_at")
#             .eq("device_id", did)
#             .in_("status", ACTIVE_STATUSES)
#             .execute().data
#         )

#         active_offline = [a for a in open_anomalies if is_ignored_type(a["type"])]

#         if age > OFFLINE_SEC:
#             if not active_offline:
#                 duration_str = format_duration_thai(age)
#                 description_text = f"ขาดการติดต่อเกิน {duration_str} {last_desc}"
                
#                 # 1. บันทึก Alert การ Offline
#                 res = sb.table("anomalies").insert({
#                     "device_id": did,
#                     "type": OFFLINE_TYPE,
#                     "severity": "critical",
#                     "description": description_text,
#                 }).execute()
        
#                 # 2. เคลียร์/ปิด Alert แรงดันไฟค้างทั้งหมดทันทีเนื่องจากเข้าสู่สถานะไฟดับ/Offline แล้ว
#                 sb.table("anomalies").update({"status": "resolved"}).eq("device_id", did).in_("status", ACTIVE_STATUSES).neq("type", OFFLINE_TYPE).execute()
                
#                 # 3. ✅ ลบค่าจับเวลา low_since ของอุปกรณ์นี้ เพื่อเคลียร์สถานะความจำไฟตก/ไฟต่ำ
#                 keys_to_remove = [k for k in low_since.keys() if k[0] == did]
#                 for k in keys_to_remove:
#                     low_since.pop(k, None)

#                 log.info("⚫ [SUCCESS] device %s: บันทึก Offline และเคลียร์ Alert แรงดันไฟเรียบร้อย", did)
#                 update_building_status(did)
#             else:
#                 log.info("ℹ️ device %s: สถานะยังคง Offline อยู่แล้วในระบบ", did)
#         else:
#             if active_offline:
#                 for anomaly in active_offline:
#                     aid = anomaly["id"]
                    
#                     start_utc = parse_to_utc(anomaly.get("created_at") or r[0]["reading_time"]) if r else now_utc
#                     if last_utc:
#                         offline_duration = (last_utc - start_utc).total_seconds()
#                         if offline_duration < 0:
#                             offline_duration = age
#                     else:
#                         offline_duration = age

#                     dur_str = format_duration_thai(offline_duration)
#                     start_str = format_thai_dt(start_utc)
#                     end_str = format_thai_dt(last_utc if last_utc else now_utc)

#                     resolved_desc = f"ตรวจพบไฟดับหรือสัญญาณขาดหายเป็นเวลา {dur_str} (ตั้งแต่ {start_str} ถึง {end_str})"

#                     sb.table("anomalies").update({
#                         "status": "resolved",
#                         "description": resolved_desc
#                     }).eq("id", aid).execute()

#                 log.info("🟢 device %s: กลับมา Online แล้ว (สั่งปิดและสรุป alert offline)", did)
#                 update_building_status(did)

