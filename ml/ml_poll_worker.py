# -*- coding: utf-8 -*-
"""
ml_poll_worker.py — วนอ่านแถวใหม่ใน energy_readings จาก Supabase -> ให้โมเดลวิเคราะห์ -> insert ลง anomalies

ใช้เมื่ออุปกรณ์ IoT เขียนค่าเข้า Supabase ตรงๆ (ไม่ผ่าน Node) หรือผ่าน Node ก็ได้
เพราะทุกทางลงที่ตาราง energy_readings เหมือนกัน

รัน:  python ml_poll_worker.py
env ที่ต้องมี: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (หรือ SUPABASE_KEY), (ไม่บังคับ) POLL_SEC, MODEL_DIR
ต้องมีโฟลเดอร์ models/ ที่มีไฟล์ .joblib ทั้ง 3 ไฟล์ (ใช้โมเดลชุดเดียวกับ ml_worker.py)
"""

# #ml_poll_worker.py
# import logging
# import os
# import time
# from datetime import datetime, timedelta, timezone


# from dotenv import load_dotenv
# load_dotenv()

# from supabase import create_client

# logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
# log = logging.getLogger("ml_poll")

# POLL_SEC = float(os.getenv("POLL_SEC", "5"))
# OFFLINE_SEC = float(os.getenv("OFFLINE_SEC", "900"))   # เกินกี่วินาทีถือว่า Offline
# OFFLINE_TYPE = "device_offline"
# OFFLINE_CHECK_SEC = 10                                  # ตรวจ Offline ทุกๆ 10 วินาที
# BACKFILL_MAX_HOURS = float(os.getenv("BACKFILL_MAX_HOURS", "24"))
# CURSOR_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".cursor")
# DEVICE_IDS = [int(x) for x in os.getenv("DEVICE_IDS", "").split(",") if x.strip()]

# COLS = (
#     "device_id,reading_time,voltage_a,voltage_b,voltage_c,voltage_system,"
#     "current_a,current_b,current_c,current_system,pf_a,pf_b,pf_c,power_factor"
# )

# sb = create_client(
#     os.environ["SUPABASE_URL"],
#     os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ["SUPABASE_KEY"],
# )

# BUILDING_RANK = {"warning": 1, "high": 2, "critical": 3}
# BUILDING_STATUS = {0: "normal", 1: "warning", 2: "warning", 3: "critical"}
# ACTIVE_STATUSES = ["open", "investigating"]

# # ✅ คำคีย์เวิร์ดประเภท Alert ที่ห้ามโดน Auto-Resolve โดยฟังก์ชันอ่านค่าไฟ
# IGNORE_AUTO_RESOLVE_KEYWORDS = [
#     OFFLINE_TYPE,
#     "ตรวจพบไฟดับหรือสัญญาณขาดหาย",
# ]

# VOLTAGE_OUTAGE_TH = 22.0
# VOLTAGE_OVER_TH = 240.0
# VOLTAGE_SAG_TH = 200.0
# SAG_DURATION_SEC = 60

# DAY_START_HOUR = 6    # 06:00
# DAY_END_HOUR   = 18   # 18:00
# NIGHT_CURRENT_TH = 0.5 # เกณฑ์กระแสไฟฟ้า (A) ที่ถือว่ามีการใช้ไฟกลางคืน

# low_since = {}

# MONTHS_TH = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."]


# def parse_to_utc(dt_str: str) -> datetime:
#     """แปลง ISO datetime string ให้เป็น UTC datetime โดยระบุ Timezone ไทย (+07:00) ให้ถูกต้อง"""
#     clean_str = dt_str.replace("Z", "+00:00")
#     dt = datetime.fromisoformat(clean_str)
    
#     if dt.tzinfo is None:
#         local_tz = timezone(timedelta(hours=7))
#         dt = dt.replace(tzinfo=local_tz)
        
#     return dt.astimezone(timezone.utc)


# def format_thai_dt(dt: datetime) -> str:
#     """แปลง datetime เป็นรูปแบบ 'D ม.ค. HH:MM'"""
#     dt_local = dt.astimezone()
#     month_name = MONTHS_TH[dt_local.month - 1]
#     return f"{dt_local.day} {month_name} {dt_local:%H:%M}"


# def format_duration_thai(seconds: float) -> str:
#     """แปลงจำนวนวินาทีเป็น 'X ชม. Y นาที' หรือ 'X นาที'"""
#     total_minutes = int(seconds // 60)
#     hours = total_minutes // 60
#     minutes = total_minutes % 60
    
#     if hours > 0:
#         return f"{hours} ชม. {minutes} นาที"
#     return f"{minutes} นาที"


# def low_duration_sec(key, v: float, reading_time: str) -> float:
#     if v >= VOLTAGE_SAG_TH:
#         low_since.pop(key, None)
#         return 0.0
#     t = parse_to_utc(reading_time)
#     start = low_since.setdefault(key, t)
#     return (t - start).total_seconds()


# def check_power_status(v: float, duration_sec: float = 0) -> str:
#     if v < VOLTAGE_OUTAGE_TH:
#         return "✅ ไฟปกติ (Normal)" #"⚫ ไฟดับ (Power Outage)"
#     elif v > VOLTAGE_OVER_TH:
#         return "🔺 ไฟเกิน (Over Voltage)"
#     elif v < VOLTAGE_SAG_TH:
#         if duration_sec > SAG_DURATION_SEC:
#             return "🔻 ไฟต่ำ (Undervoltage)"
#         return "📉 ไฟตก (Voltage Sag)"
#     return "✅ ไฟปกติ (Normal)"


# STATUS_MAP = {
#     #"⚫": ("power_outage", "critical", "ไฟดับ"),
#     "🔺": ("over_voltage", "high", "ไฟเกิน"),
#     "🔻": ("under_voltage", "high", "ไฟต่ำ"),
#     "📉": ("voltage_sag", "warning", "ไฟตก"),
# }

# PHASES = [("L1", "voltage_a"), ("L2", "voltage_b"), ("L3", "voltage_c")]


# def check_voltage(row: dict) -> list:
#     device_id = int(row["device_id"])
#     groups = {}
#     for name, col in PHASES:
#         v = row.get(col)
#         if v is None:
#             continue
#         v = float(v)
#         dur = low_duration_sec((device_id, name), v, row["reading_time"])
#         info = STATUS_MAP.get(check_power_status(v, dur)[0])
#         if info is None:
#             continue
#         t, sev, th = info
#         groups.setdefault(t, (sev, th, []))[2].append((name, v))

#     out = []
#     for t, (sev, th, items) in groups.items():
#         names = ", ".join(n for n, _ in items)
#         vals = ", ".join(f"{n}={v:.1f}V" for n, v in items)
#         out.append({"type": t, "severity": sev, "description": f"{th} เฟส {names} ({vals})"})
#     return out


# def check_night_usage(row: dict) -> list:
#     """ตรวจสอบการใช้ไฟฟ้าในเวลากลางคืน"""
#     reading_dt = parse_to_utc(row["reading_time"]).astimezone()
#     hour = reading_dt.hour
    
#     is_night = hour >= DAY_END_HOUR or hour < DAY_START_HOUR
#     if not is_night:
#         return []

#     i_sys = float(row.get("current_system") or 0.0)
#     if i_sys > NIGHT_CURRENT_TH:
#         return [{
#             "type": "night_usage",
#             "severity": "warning",
#             "description": f"มีการใช้ไฟฟ้ากลางคืน (กระแสไฟ {i_sys:.2f}A เวลา {reading_dt:%H:%M})"
#         }]
#     return []


# def update_building_status(device_id: int) -> None:
#     try:
#         dev_res = sb.table("devices").select("building_id").eq("id", device_id).limit(1).execute().data
#         if not dev_res or not dev_res[0].get("building_id"):
#             return
#         building_id = dev_res[0]["building_id"]

#         b_devs = sb.table("devices").select("id").eq("building_id", building_id).execute().data
#         dev_ids = [d["id"] for d in b_devs]
#         if not dev_ids:
#             return

#         active = (
#             sb.table("anomalies").select("severity")
#             .in_("device_id", dev_ids).in_("status", ACTIVE_STATUSES)
#             .execute().data
#         )
#         rank = max((BUILDING_RANK.get(a["severity"], 0) for a in active), default=0)
#         sb.table("buildings").update({"status": BUILDING_STATUS[rank]}).eq("id", building_id).execute()
#     except Exception as e:
#         log.error("อัปเดตสถานะอาคารล้มเหลว: %s", e)


# def is_ignored_type(alert_type: str) -> bool:
#     """เช็กว่าประเภท Alert ตรงกับคีย์เวิร์ดที่ต้องข้าม Auto-Resolve หรือไม่"""
#     if not alert_type:
#         return False
#     return any(kw in alert_type for kw in IGNORE_AUTO_RESOLVE_KEYWORDS)


# def auto_resolve_voltage(device_id: int, current_voltage_types: set) -> bool:
#     open_rows = (
#         sb.table("anomalies").select("id, type")
#         .eq("device_id", device_id).in_("status", ACTIVE_STATUSES)
#         .execute().data
#     )
    
#     ids = [
#         r["id"] for r in open_rows 
#         if r["type"] not in current_voltage_types 
#         and not is_ignored_type(r["type"])
#     ]
    
#     if not ids:
#         return False
        
#     sb.table("anomalies").update({"status": "resolved"}).in_("id", ids).execute()
#     log.info("✅ device %s: ปิด Alert ที่กลับเป็นปกติแล้ว %d รายการ", device_id, len(ids))
#     return True


# def handle(row: dict) -> None:
#     try:
#         device_id = int(row["device_id"])
#     except (TypeError, ValueError):
#         return

#     found = check_voltage(row)
#     found.extend(check_night_usage(row))

#     current_types = {a["type"] for a in found}

#     changed = auto_resolve_voltage(device_id, current_types)
#     created = False

#     for a in found:
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

#     if created or changed:
#         update_building_status(device_id)


# def check_offline() -> None:
#     """ไม่บันทึก alert ไฟดับ (frontend/RPC เป็นเจ้าของ)
#     ทำแค่เคลียร์ alert แรงดันค้างเมื่ออุปกรณ์เงียบเกิน OFFLINE_SEC"""
#     now_utc = datetime.now(timezone.utc)

#     devices_q = sb.table("devices").select("id")
#     if DEVICE_IDS:
#         devices_q = devices_q.in_("id", DEVICE_IDS)

#     for d in devices_q.execute().data:
#         did = d["id"]
#         r = (
#             sb.table("energy_readings").select("reading_time")
#             .eq("device_id", did).order("reading_time", desc=True).limit(1).execute().data
#         )
#         if not r:
#             continue

#         age = (now_utc - parse_to_utc(r[0]["reading_time"])).total_seconds()
#         if age <= OFFLINE_SEC:
#             continue

#         open_rows = (
#             sb.table("anomalies").select("id")
#             .eq("device_id", did).in_("status", ACTIVE_STATUSES)
#             .execute().data
#         )
#         if not open_rows:
#             continue

#         sb.table("anomalies").update({"status": "resolved"}) \
#             .in_("id", [x["id"] for x in open_rows]).execute()

#         for k in [k for k in low_since if k[0] == did]:
#             low_since.pop(k, None)

#         log.info("⚫ device %s: เงียบ %.0f วินาที ปิด alert แรงดันที่ค้าง %d รายการ",
#                  did, age, len(open_rows))
#         update_building_status(did)

# def latest_time():
#     r = (
#         sb.table("energy_readings").select("reading_time")
#         .order("reading_time", desc=True).limit(1).execute().data
#     )
#     return r[0]["reading_time"] if r else None


# def load_cursor():
#     try:
#         with open(CURSOR_FILE, encoding="utf-8") as f:
#             saved = f.read().strip()
#     except FileNotFoundError:
#         return latest_time()
#     if not saved:
#         return latest_time()
#     limit = datetime.now(timezone.utc) - timedelta(hours=BACKFILL_MAX_HOURS)
#     t = parse_to_utc(saved)
#     return limit.isoformat() if t < limit else saved


# def save_cursor(value) -> None:
#     try:
#         with open(CURSOR_FILE, "w", encoding="utf-8") as f:
#             f.write(str(value))
#     except OSError as e:
#         log.error("บันทึก cursor ไม่สำเร็จ: %s", e)


# def main() -> None:
#     cursor = load_cursor()
#     seen = set()
#     last_offline_check = 0.0
#     log.info("เริ่มรันสคริปต์... POLL_SEC=%.0f, OFFLINE_SEC=%.0f", POLL_SEC, OFFLINE_SEC)

#     while True:
#         batch = 0
#         try:
#             q = sb.table("energy_readings").select(COLS).order("reading_time").limit(500)
#             if cursor:
#                 q = q.gte("reading_time", cursor)
#             if DEVICE_IDS:
#                 q = q.in_("device_id", DEVICE_IDS)
#             rows = q.execute().data
#             batch = len(rows)
#             for row in rows:
#                 key = (row["device_id"], row["reading_time"])
#                 if key in seen:
#                     continue
#                 handle(row)
#                 seen.add(key)
#                 cursor = row["reading_time"]
#             seen = {k for k in seen if k[1] == cursor}
#             if cursor:
#                 save_cursor(cursor)
#         except Exception as e:
#             log.error("poll error: %s", e)

#         if time.time() - last_offline_check >= OFFLINE_CHECK_SEC:
#             last_offline_check = time.time()
#             try:
#                 check_offline()
#             except Exception as e:
#                 log.error("check_offline error: %s", e)

#         if batch < 500:
#             time.sleep(POLL_SEC)


# if __name__ == "__main__":
#     main()



# import logging
# import os
# import time
# import pandas as pd
# from datetime import datetime, timedelta, timezone

# import joblib  # ✅ เพิ่มการนำเข้า joblib เพื่อใช้เปิดไฟล์โมเดล .joblib
# from dotenv import load_dotenv

# load_dotenv()

# from supabase import create_client

# logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
# log = logging.getLogger("ml_poll")

# POLL_SEC = float(os.getenv("POLL_SEC", "5"))
# OFFLINE_SEC = float(os.getenv("OFFLINE_SEC", "900"))   # เกินกี่วินาทีถือว่า Offline
# OFFLINE_TYPE = "device_offline"
# OFFLINE_CHECK_SEC = 10                                  # ตรวจ Offline ทุกๆ 10 วินาที
# BACKFILL_MAX_HOURS = float(os.getenv("BACKFILL_MAX_HOURS", "24"))
# CURSOR_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".cursor")
# DEVICE_IDS = [int(x) for x in os.getenv("DEVICE_IDS", "").split(",") if x.strip()]

# COLS = (
#     "device_id,reading_time,voltage_a,voltage_b,voltage_c,voltage_system,"
#     "current_a,current_b,current_c,current_system,pf_a,pf_b,pf_c,power_factor"
# )

# sb = create_client(
#     os.environ["SUPABASE_URL"],
#     os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ["SUPABASE_KEY"],
# )

# BUILDING_RANK = {"warning": 1, "high": 2, "critical": 3}
# BUILDING_STATUS = {0: "normal", 1: "warning", 2: "warning", 3: "critical"}
# ACTIVE_STATUSES = ["open", "investigating"]

# # ✅ คำคีย์เวิร์ดประเภท Alert ที่ห้ามโดน Auto-Resolve โดยฟังก์ชันอ่านค่าไฟ
# IGNORE_AUTO_RESOLVE_KEYWORDS = [
#     OFFLINE_TYPE,
#     "ตรวจพบไฟดับหรือสัญญาณขาดหาย",
# ]

# MONTHS_TH = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."]

# # ==========================================
# # 🤖 โหลดโมเดล AI (.joblib) ของเพื่อนเตรียมไว้
# # ==========================================
# MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
# models = {}

# for phase in ["L1", "L2", "L3"]:
#     model_path = os.path.join(MODELS_DIR, f"power_ai_brain_3phase_{phase}.joblib")
#     if os.path.exists(model_path):
#         try:
#             models[phase] = joblib.load(model_path)
#             log.info("✅ โหลดโมเดล ML เฟส %s สำเร็จ", phase)
#         except Exception as e:
#             log.error("❌ ไม่สามารถโหลดโมเดล %s ได้: %s", phase, e)
#     else:
#         log.warning("⚠️ ไม่พบไฟล์โมเดล %s ที่ path: %s", phase, model_path)

# # Map ค่าผลทำนายจาก ML ไปยังประเภท Alert และ Severity สำหรับ Supabase
# ML_STATUS_MAP = {
#     "🔺 ไฟเกิน (Over Voltage)": ("over_voltage", "high"),
#     "🔻 ไฟต่ำ (Undervoltage)": ("under_voltage", "high"),
#     "📉 ไฟตก (Voltage Sag)": ("voltage_sag", "warning"),
#     "⚫ ไฟดับ (Power Outage)": ("power_outage", "critical"),
#     "🌙 มีการใช้ไฟฟ้า (Night Usage)": ("night_usage", "warning"),
# }

# ML_PHASE_CONFIG = [
#     ("L1", "voltage_a", "current_a", "pf_a"),
#     ("L2", "voltage_b", "current_b", "pf_b"),
#     ("L3", "voltage_c", "current_c", "pf_c"),
# ]


# def parse_to_utc(dt_str: str) -> datetime:
#     """แปลง ISO datetime string ให้เป็น UTC datetime โดยระบุ Timezone ไทย (+07:00) ให้ถูกต้อง"""
#     clean_str = dt_str.replace("Z", "+00:00")
#     dt = datetime.fromisoformat(clean_str)
    
#     if dt.tzinfo is None:
#         local_tz = timezone(timedelta(hours=7))
#         dt = dt.replace(tzinfo=local_tz)
        
#     return dt.astimezone(timezone.utc)


# def format_thai_dt(dt: datetime) -> str:
#     """แปลง datetime เป็นรูปแบบ 'D ม.ค. HH:MM'"""
#     dt_local = dt.astimezone()
#     month_name = MONTHS_TH[dt_local.month - 1]
#     return f"{dt_local.day} {month_name} {dt_local:%H:%M}"


# def format_duration_thai(seconds: float) -> str:
#     """แปลงจำนวนวินาทีเป็น 'X ชม. Y นาที' หรือ 'X นาที'"""
#     total_minutes = int(seconds // 60)
#     hours = total_minutes // 60
#     minutes = total_minutes % 60
    
#     if hours > 0:
#         return f"{hours} ชม. {minutes} นาที"
#     return f"{minutes} นาที"


# # ==========================================
# # 🤖 ฟังก์ชันทำนายความผิดปกติด้วย ML
# # ==========================================
# def check_anomalies_with_ml(row: dict) -> list:
#     """ใช้โมเดล Random Forest ทำนายความผิดปกติแยกรายเฟส"""
#     if not models:
#         return []

#     reading_dt = parse_to_utc(row["reading_time"]).astimezone()
#     hour = reading_dt.hour
    
#     groups = {}
    
#     for phase, v_col, i_col, pf_col in ML_PHASE_CONFIG:
#         model = models.get(phase)
#         if not model:
#             continue
            
#         v_val = float(row.get(v_col) or 0.0)
#         i_val = float(row.get(i_col) or 0.0)
#         pf_val = float(row.get(pf_col) or 0.0)
        
#         # ฟีเจอร์ที่โมเดลของเพื่อนใช้เทรน: [Voltage, Current, PowerFactor, Hour]
#         features = pd.DataFrame([{
#             'Voltage': v_val,
#             'Current': i_val,
#             'PowerFactor': pf_val,
#             'Hour': hour
# }])
        
#         # ส่งให้ ML ทำนาย
#         pred = model.predict(features)[0]
        
#         # หากทำนายได้สถานะที่มีความผิดปกติ
#         info = ML_STATUS_MAP.get(pred)
#         if info:
#             alert_type, sev = info
#             groups.setdefault(alert_type, (sev, pred, []))[2].append((phase, v_val))

#     out = []
#     for alert_type, (sev, label, items) in groups.items():
#         names = ", ".join(n for n, _ in items)
#         vals = ", ".join(f"{n}={v:.1f}V" for n, v in items)
#         out.append({
#             "type": alert_type,
#             "severity": sev,
#             "description": f"{label} เฟส {names} ({vals})"
#         })
#     return out


# def update_building_status(device_id: int) -> None:
#     try:
#         dev_res = sb.table("devices").select("building_id").eq("id", device_id).limit(1).execute().data
#         if not dev_res or not dev_res[0].get("building_id"):
#             return
#         building_id = dev_res[0]["building_id"]

#         b_devs = sb.table("devices").select("id").eq("building_id", building_id).execute().data
#         dev_ids = [d["id"] for d in b_devs]
#         if not dev_ids:
#             return

#         active = (
#             sb.table("anomalies").select("severity")
#             .in_("device_id", dev_ids).in_("status", ACTIVE_STATUSES)
#             .execute().data
#         )
#         rank = max((BUILDING_RANK.get(a["severity"], 0) for a in active), default=0)
#         sb.table("buildings").update({"status": BUILDING_STATUS[rank]}).eq("id", building_id).execute()
#     except Exception as e:
#         log.error("อัปเดตสถานะอาคารล้มเหลว: %s", e)


# def is_ignored_type(alert_type: str) -> bool:
#     """เช็กว่าประเภท Alert ตรงกับคีย์เวิร์ดที่ต้องข้าม Auto-Resolve หรือไม่"""
#     if not alert_type:
#         return False
#     return any(kw in alert_type for kw in IGNORE_AUTO_RESOLVE_KEYWORDS)


# def auto_resolve_voltage(device_id: int, current_voltage_types: set) -> bool:
#     open_rows = (
#         sb.table("anomalies").select("id, type")
#         .eq("device_id", device_id).in_("status", ACTIVE_STATUSES)
#         .execute().data
#     )
    
#     ids = [
#         r["id"] for r in open_rows 
#         if r["type"] not in current_voltage_types 
#         and not is_ignored_type(r["type"])
#     ]
    
#     if not ids:
#         return False
        
#     sb.table("anomalies").update({"status": "resolved"}).in_("id", ids).execute()
#     log.info("✅ device %s: ปิด Alert ที่กลับเป็นปกติแล้ว %d รายการ", device_id, len(ids))
#     return True


# def handle(row: dict) -> None:
#     try:
#         device_id = int(row["device_id"])
#     except (TypeError, ValueError):
#         return

#     # ✅ เปลี่ยนมาใช้ผลทำนายจาก ML ของเพื่อนแทน If-Else
#     found = check_anomalies_with_ml(row)

#     current_types = {a["type"] for a in found}

#     changed = auto_resolve_voltage(device_id, current_types)
#     created = False

#     for a in found:
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

#     if created or changed:
#         update_building_status(device_id)


# def check_offline() -> None:
#     """ไม่บันทึก alert ไฟดับ (frontend/RPC เป็นเจ้าของ)
#     ทำแค่เคลียร์ alert แรงดันค้างเมื่ออุปกรณ์เงียบเกิน OFFLINE_SEC"""
#     now_utc = datetime.now(timezone.utc)

#     devices_q = sb.table("devices").select("id")
#     if DEVICE_IDS:
#         devices_q = devices_q.in_("id", DEVICE_IDS)

#     for d in devices_q.execute().data:
#         did = d["id"]
#         r = (
#             sb.table("energy_readings").select("reading_time")
#             .eq("device_id", did).order("reading_time", desc=True).limit(1).execute().data
#         )
#         if not r:
#             continue

#         age = (now_utc - parse_to_utc(r[0]["reading_time"])).total_seconds()
#         if age <= OFFLINE_SEC:
#             continue

#         open_rows = (
#             sb.table("anomalies").select("id")
#             .eq("device_id", did).in_("status", ACTIVE_STATUSES)
#             .execute().data
#         )
#         if not open_rows:
#             continue

#         sb.table("anomalies").update({"status": "resolved"}) \
#             .in_("id", [x["id"] for x in open_rows]).execute()

#         log.info("⚫ device %s: เงียบ %.0f วินาที ปิด alert แรงดันที่ค้าง %d รายการ",
#                  did, age, len(open_rows))
#         update_building_status(did)


# def latest_time():
#     r = (
#         sb.table("energy_readings").select("reading_time")
#         .order("reading_time", desc=True).limit(1).execute().data
#     )
#     return r[0]["reading_time"] if r else None


# def load_cursor():
#     try:
#         with open(CURSOR_FILE, encoding="utf-8") as f:
#             saved = f.read().strip()
#     except FileNotFoundError:
#         return latest_time()
#     if not saved:
#         return latest_time()
#     limit = datetime.now(timezone.utc) - timedelta(hours=BACKFILL_MAX_HOURS)
#     t = parse_to_utc(saved)
#     return limit.isoformat() if t < limit else saved


# def save_cursor(value) -> None:
#     try:
#         with open(CURSOR_FILE, "w", encoding="utf-8") as f:
#             f.write(str(value))
#     except OSError as e:
#         log.error("บันทึก cursor ไม่สำเร็จ: %s", e)


# def main() -> None:
#     cursor = load_cursor()
#     seen = set()
#     last_offline_check = 0.0
#     log.info("เริ่มรันสคริปต์... POLL_SEC=%.0f, OFFLINE_SEC=%.0f", POLL_SEC, OFFLINE_SEC)

#     while True:
#         batch = 0
#         try:
#             q = sb.table("energy_readings").select(COLS).order("reading_time").limit(500)
#             if cursor:
#                 q = q.gte("reading_time", cursor)
#             if DEVICE_IDS:
#                 q = q.in_("device_id", DEVICE_IDS)
#             rows = q.execute().data
#             batch = len(rows)
#             for row in rows:
#                 key = (row["device_id"], row["reading_time"])
#                 if key in seen:
#                     continue
#                 handle(row)
#                 seen.add(key)
#                 cursor = row["reading_time"]
#             seen = {k for k in seen if k[1] == cursor}
#             if cursor:
#                 save_cursor(cursor)
#         except Exception as e:
#             log.error("poll error: %s", e)

#         if time.time() - last_offline_check >= OFFLINE_CHECK_SEC:
#             last_offline_check = time.time()
#             try:
#                 check_offline()
#             except Exception as e:
#                 log.error("check_offline error: %s", e)

#         if batch < 500:
#             time.sleep(POLL_SEC)


# if __name__ == "__main__":
#     main()


import logging
import os
import time
import pandas as pd
from datetime import datetime, timedelta, timezone

import joblib
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

# ✅ แยก Sag / Undervoltage ตาม IEEE 1159: ต่ำค้างเกิน 60 วินาที = Undervoltage
SAG_DURATION_SEC = float(os.getenv("SAG_DURATION_SEC", "60"))
# ✅ ถ้าโมเดลตอบ "ปกติ" คั่นสั้นๆ ไม่เกินกี่วินาที ไม่ต้องรีเซ็ตตัวนับ (กันแรงดันแกว่งรอบ 200V)
LOW_RESET_GRACE_SEC = float(os.getenv("LOW_RESET_GRACE_SEC", "0"))

SAG_LABEL = "📉 ไฟตก (Voltage Sag)"
UNDER_LABEL = "🔻 ไฟต่ำ (Undervoltage)"

# (device_id, phase) -> {"start": datetime UTC, "last_low": datetime UTC}
low_state = {}

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

IGNORE_AUTO_RESOLVE_KEYWORDS = [
    OFFLINE_TYPE,
    "ตรวจพบไฟดับหรือสัญญาณขาดหาย",
]

MONTHS_TH = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."]

# ==========================================
# 🤖 โหลดโมเดล AI (.joblib) แยกรายเฟส
# ==========================================
MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
models = {}

for phase in ["L1", "L2", "L3"]:
    model_path = os.path.join(MODELS_DIR, f"power_ai_brain_3phase_{phase}.joblib")
    if os.path.exists(model_path):
        try:
            models[phase] = joblib.load(model_path)
            log.info("✅ โหลดโมเดล ML เฟส %s สำเร็จ", phase)
        except Exception as e:
            log.error("❌ ไม่สามารถโหลดโมเดล %s ได้: %s", phase, e)
    else:
        log.warning("⚠️ ไม่พบไฟล์โมเดล %s ที่ path: %s", phase, model_path)

ML_STATUS_MAP = {
    "🔺 ไฟเกิน (Over Voltage)": ("over_voltage", "high"),
    UNDER_LABEL: ("under_voltage", "high"),
    SAG_LABEL: ("voltage_sag", "warning"),
    "⚫ ไฟดับ (Power Outage)": ("power_outage", "critical"),
    "🌙 มีการใช้ไฟฟ้า (Night Usage)": ("night_usage", "warning"),
}

ML_PHASE_CONFIG = [
    ("L1", "voltage_a", "current_a", "pf_a"),
    ("L2", "voltage_b", "current_b", "pf_b"),
    ("L3", "voltage_c", "current_c", "pf_c"),
]


def parse_to_utc(dt_str: str) -> datetime:
    """แปลง ISO datetime string ให้เป็น UTC datetime โดยระบุ Timezone ไทย (+07:00) ให้ถูกต้อง"""
    clean_str = dt_str.replace("Z", "+00:00")
    dt = datetime.fromisoformat(clean_str)

    if dt.tzinfo is None:
        local_tz = timezone(timedelta(hours=7))
        dt = dt.replace(tzinfo=local_tz)

    return dt.astimezone(timezone.utc)


def format_thai_dt(dt: datetime) -> str:
    dt_local = dt.astimezone()
    month_name = MONTHS_TH[dt_local.month - 1]
    return f"{dt_local.day} {month_name} {dt_local:%H:%M}"


def format_duration_thai(seconds: float) -> str:
    total_minutes = int(seconds // 60)
    hours = total_minutes // 60
    minutes = total_minutes % 60

    if hours > 0:
        return f"{hours} ชม. {minutes} นาที"
    return f"{minutes} นาที"


# ==========================================
# ⏱️ นับระยะเวลาแรงดันต่ำ แล้วแยก Sag / Undervoltage
# ==========================================
def apply_low_voltage_duration(device_id, phase, pred, ts: datetime) -> str:
    """
    ถ้าโมเดลตอบ Sag/Undervoltage ให้ดูว่าต่ำค้างนานเท่าไหร่:
      <= SAG_DURATION_SEC -> Sag, > SAG_DURATION_SEC -> Undervoltage
    ถ้าโมเดลตอบอย่างอื่น (ปกติ/ไฟเกิน/ไฟดับ) -> รีเซ็ตตัวนับ
    """
    key = (device_id, phase)

    if pred in (SAG_LABEL, UNDER_LABEL):
        st = low_state.get(key)
        if st is None:
            st = {"start": ts, "last_low": ts}
            low_state[key] = st
        else:
            st["last_low"] = ts

        duration = (ts - st["start"]).total_seconds()
        return UNDER_LABEL if duration > SAG_DURATION_SEC else SAG_LABEL

    st = low_state.get(key)
    if st is not None:
        gap = (ts - st["last_low"]).total_seconds()
        if gap > LOW_RESET_GRACE_SEC:
            low_state.pop(key, None)
    return pred


# ==========================================
# 🤖 ฟังก์ชันทำนายความผิดปกติด้วย ML
# ==========================================
def check_anomalies_with_ml(row: dict) -> list:
    if not models:
        return []

    ts = parse_to_utc(row["reading_time"])
    hour = ts.astimezone().hour
    device_id = row["device_id"]

    groups = {}

    for phase, v_col, i_col, pf_col in ML_PHASE_CONFIG:
        model = models.get(phase)
        if not model:
            continue

        v_val = float(row.get(v_col) or 0.0)
        i_val = float(row.get(i_col) or 0.0)
        pf_val = float(row.get(pf_col) or 0.0)

        features = pd.DataFrame(
            [
                {
                    f"Voltage_{phase}": v_val,
                    f"Current_{phase}": i_val,
                    f"PowerFactor_{phase}": pf_val,
                    "Hour": hour,
                }
            ]
        )

        pred = model.predict(features)[0]

        # ✅ ปรับ Sag -> Undervoltage ตามระยะเวลาที่ต่ำค้าง
        pred = apply_low_voltage_duration(device_id, phase, pred, ts)

        info = ML_STATUS_MAP.get(pred)
        if info:
            alert_type, sev = info
            groups.setdefault(alert_type, (sev, pred, []))[2].append((phase, v_val))

    out = []
    for alert_type, (sev, label, items) in groups.items():
        names = ", ".join(n for n, _ in items)
        vals = ", ".join(f"{n}={v:.1f}V" for n, v in items)
        out.append(
            {
                "type": alert_type,
                "severity": sev,
                "description": f"{label} เฟส {names} ({vals})",
            }
        )
    return out


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

    # 1. ทำนายด้วย ML (รวมการแยก Sag/Undervoltage ตามระยะเวลาแล้ว)
    found = check_anomalies_with_ml(row)

    current_types = {a["type"] for a in found}

    # 2. เคลียร์ Alert เดิมที่ไม่ตรงกับรอบนี้
    #    (ไฟตกที่กลายเป็นไฟต่ำ จะถูกปิดเป็น resolved เก็บไว้เป็นประวัติ แล้วสร้างแถวไฟต่ำใหม่)
    changed = auto_resolve_voltage(device_id, current_types)
    if changed:
        log.info("🔄 [device_id: %s] อัปเดตสถานะความผิดปกติเดิมเป็น resolved", device_id)

    created = False

    # 3. วนลูปตรวจสอบความผิดปกติที่พบ
    for a in found:
        alert_type = a.get("type", "unknown")
        severity = a.get("severity", "warning")
        description = a.get("description", "")

        print(f"⚠️ [Detect] ตรวจพบเหตุการณ์ device_id: {device_id} | Type: {alert_type} | Description: {description}")

        exists = (
            sb.table("anomalies").select("id")
            .eq("device_id", device_id).eq("type", alert_type).in_("status", ACTIVE_STATUSES)
            .limit(1).execute().data
        )

        if exists:
            # ✅ อัปเดตรายละเอียด (แรงดันล่าสุด) ของแถวเดิมโดยไม่สร้างซ้ำ
            if alert_type == "under_voltage":
                sb.table("anomalies").update({"description": description}).eq("id", exists[0]["id"]).execute()
            log.info("⏭️ [device_id: %s] ข้ามการบันทึก: พบรายการ %s สถานะ Active อยู่แล้ว", device_id, alert_type)
            continue

        print(f"💾 [DB Insert] กำลังบันทึก anomaly สำหรับ device_id: {device_id}, result: {alert_type}")

        sb.table("anomalies").insert({
            "device_id": device_id,
            "type": alert_type,
            "severity": severity,
            "description": description,
        }).execute()

        created = True
        log.info("🚨 device %s: %s", device_id, description)

    # 4. อัปเดตสถานะของอาคาร
    if created or changed:
        print(f"🏢 [Building Status] กำลังอัปเดตสถานะอาคารสำหรับ device_id: {device_id}")
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

        # ✅ อุปกรณ์เงียบ -> รีเซ็ตตัวนับแรงดันต่ำของอุปกรณ์นี้
        for k in [k for k in low_state if k[0] == did]:
            low_state.pop(k, None)

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
    log.info("🚀 เริ่มรันสคริปต์... POLL_SEC=%.0f, OFFLINE_SEC=%.0f, SAG_DURATION_SEC=%.0f",
             POLL_SEC, OFFLINE_SEC, SAG_DURATION_SEC)

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

            if batch > 0:
                print(f"📥 [Poll Batch] ดึงข้อมูลมาประมวลผล {batch} แถว (Cursor: {cursor})")

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