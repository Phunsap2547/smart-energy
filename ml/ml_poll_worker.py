
#ml_poll_worker.py
# import logging
# import math
# import os
# import time
# import pandas as pd
# from datetime import datetime, timedelta, timezone
# from collections import defaultdict, deque

# import joblib
# from dotenv import load_dotenv

# load_dotenv()

# from supabase import create_client

# logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
# log = logging.getLogger("ml_poll")

# POLL_SEC = float(os.getenv("POLL_SEC", "5"))
# OFFLINE_SEC = float(os.getenv("OFFLINE_SEC", "180"))   # เกินกี่วินาทีถือว่า Offline
# OFFLINE_TYPE = "device_offline"
# OFFLINE_CHECK_SEC = 10                                  # ตรวจ Offline ทุกๆ 10 วินาที
# BACKFILL_MAX_HOURS = float(os.getenv("BACKFILL_MAX_HOURS", "0.1"))  # ย้อนหลังสูงสุด ~6 นาที
# CURSOR_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".cursor")
# DEVICE_IDS = [int(x) for x in os.getenv("DEVICE_IDS", "").split(",") if x.strip()]

# RESOLVE_AFTER = int(os.getenv("RESOLVE_AFTER", "3"))   # ต้องปกติติดกันกี่รอบถึงจะปิด alert
# MAX_LAG_SEC = float(os.getenv("MAX_LAG_SEC", "300"))   # ข้อมูลเก่ากว่านี้ไม่สร้าง/แก้ alert
# OVER_LABEL = "🔺 ไฟเกิน (Over Voltage)"
# UNDER_LABEL = "🔻 ไฟต่ำ (Undervoltage)"

# # ---- เกณฑ์แรงดันแยกต่ออุปกรณ์ (อ่านจากตาราง devices) ----
# DEFAULT_NOMINAL_VOLT = 230.0   # ใช้เมื่ออุปกรณ์ไม่ได้ตั้ง nominal_voltage
# VOLT_TOLERANCE = 0.10          # ±10% ใช้คำนวณช่วงปกติเมื่อไม่ได้ตั้ง voltage_min/max
# OUTAGE_VOLT = float(os.getenv("OUTAGE_VOLT", "50"))    # ต่ำกว่านี้ถือว่าไฟดับ ไม่นับเป็นไฟต่ำ
# DEVICE_CFG_TTL = 60        # รีโหลดค่าจากตาราง devices ทุกกี่วินาที
# SQRT3 = math.sqrt(3)
# VOLTAGE_ALERT_TYPES = {"over_voltage", "under_voltage"}

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

# IGNORE_AUTO_RESOLVE_KEYWORDS = [
#     OFFLINE_TYPE,
#     "ตรวจพบไฟดับหรือสัญญาณขาดหาย",
# ]

# # เหตุผลที่ปิด alert (เก็บในคอลัมน์ anomalies.resolution_reason)
# REASON_RECOVERED = "recovered"    # แรงดันกลับเข้าช่วงปกติจริง (เห็นค่าปกติติดกัน RESOLVE_AFTER ค่า)
# REASON_SUPERSEDED = "superseded"  # ข้ามจากไฟต่ำ <-> ไฟเกิน โดยไม่ผ่านช่วงปกติ
# REASON_OFFLINE = "offline"        # อุปกรณ์เงียบ ปิดเพราะไม่มีข้อมูล (ไม่ใช่ "กลับมาปกติ")

# # ไฟเกินกับไฟต่ำเกิดพร้อมกันไม่ได้ ถ้าตรวจพบอย่างหนึ่ง ให้ปิดอีกอย่างที่ค้างอยู่ทันที
# OPPOSITE_TYPE = {
#     "over_voltage": "under_voltage",
#     "under_voltage": "over_voltage",
# }

# MONTHS_TH = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."]

# # ==========================================
# # 🧠 State ในหน่วยความจำ
# # ==========================================
# volt_hist = defaultdict(lambda: deque(maxlen=2))   # key = (device_id, phase) เก็บแรงดันย้อนหลัง 2 ค่า (สเกลเดียวกับที่ป้อนโมเดล)
# normal_count = defaultdict(int)                    # key = (device_id, alert_type) นับรอบที่กลับเป็นปกติ

# _device_cfg = {}                # device_id -> แถวจากตาราง devices
# _device_cfg_loaded_at = 0.0

# # ==========================================
# # 🤖 โหลดโมเดล AI (.joblib) แยกรายเฟส
# # ==========================================
# MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
# models = {}

# # for phase in ["L1", "L2", "L3"]:
# #     model_path = os.path.join(MODELS_DIR, f"power_ai_brain_3phase_{phase}.joblib")
# #     if os.path.exists(model_path):
# #         try:
# #             models[phase] = joblib.load(model_path)
# #             log.info("✅ โหลดโมเดล ML เฟส %s สำเร็จ", phase)
# #         except Exception as e:
# #             log.error("❌ ไม่สามารถโหลดโมเดล %s ได้: %s", phase, e)
# #     else:
# #         log.warning("⚠️ ไม่พบไฟล์โมเดล %s ที่ path: %s", phase, model_path)
# single_model_path = os.path.join(MODELS_DIR, "rf_voltage_model.joblib")
# if os.path.exists(single_model_path):
#     try:
#         shared_model = joblib.load(single_model_path)
#         for phase in ["L1", "L2", "L3"]:
#             models[phase] = shared_model
#         log.info("✅ โหลดโมเดล ML (rf_voltage_model.joblib) สำหรับทุกเฟสสำเร็จ")
#     except Exception as e:
#         log.error("❌ ไม่สามารถโหลดโมเดลได้: %s", e)
# else:
#     log.warning("⚠️ ไม่พบไฟล์โมเดลที่ path: %s", single_model_path)
# # ==========================================
# # 📌 Label & Mapping
# # ==========================================
# ML_STATUS_MAP = {
#     OVER_LABEL: ("over_voltage", "high"),
#     UNDER_LABEL: ("under_voltage", "high"),
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
#     dt_local = dt.astimezone()
#     month_name = MONTHS_TH[dt_local.month - 1]
#     return f"{dt_local.day} {month_name} {dt_local:%H:%M}"


# def format_duration_thai(seconds: float) -> str:
#     total_minutes = int(seconds // 60)
#     hours = total_minutes // 60
#     minutes = total_minutes % 60

#     if hours > 0:
#         return f"{hours} ชม. {minutes} นาที"
#     return f"{minutes} นาที"


# # ==========================================
# # ⚙️ เกณฑ์แรงดันต่ออุปกรณ์ (จากตาราง devices)
# # ==========================================
# def get_device_cfg(device_id: int) -> dict:
#     """คืนค่า {'vmin','vmax','basis'} ของอุปกรณ์ (cache 60 วินาที)
#     basis: 'LN' = วัดเฟส-นิวทรัล (เช่น 230V), 'LL' = วัดเฟส-เฟส (เช่น 400V)
#     ลำดับ: voltage_min/max ที่ตั้งไว้ > คำนวณจาก nominal_voltage ±10%"""
#     global _device_cfg, _device_cfg_loaded_at

#     now = time.time()
#     if now - _device_cfg_loaded_at >= DEVICE_CFG_TTL:
#         try:
#             rows = (
#                 sb.table("devices")
#                 .select("id,voltage_min,voltage_max,voltage_basis,nominal_voltage")
#                 .execute().data
#             )
#             _device_cfg = {int(r["id"]): r for r in rows}
#             _device_cfg_loaded_at = now
#             log.info("⚙️ โหลดเกณฑ์แรงดันของอุปกรณ์ %d ตัว", len(_device_cfg))
#         except Exception as e:
#             log.error("โหลดเกณฑ์แรงดันจากตาราง devices ล้มเหลว (ใช้ค่าเดิม/ค่า fallback): %s", e)
#             _device_cfg_loaded_at = now - DEVICE_CFG_TTL + 10   # ลองใหม่ใน 10 วินาที

#     cfg = _device_cfg.get(device_id) or {}
#     nominal = float(cfg.get("nominal_voltage") or DEFAULT_NOMINAL_VOLT)
#     vmin = cfg.get("voltage_min")
#     vmax = cfg.get("voltage_max")
#     return {
#         "vmin": float(vmin) if vmin is not None else nominal * (1 - VOLT_TOLERANCE),
#         "vmax": float(vmax) if vmax is not None else nominal * (1 + VOLT_TOLERANCE),
#         "basis": str(cfg.get("voltage_basis") or "LN").upper(),
#     }


# # ==========================================
# # 🤖 ฟังก์ชันตรวจความผิดปกติ (แรงดัน = กฎตามอุปกรณ์, อื่นๆ = ML)
# # ==========================================
# # def check_anomalies_with_ml(row: dict) -> list:
# #     out = []
# #     ts = parse_to_utc(row["reading_time"])
# #     hour = ts.astimezone().hour
# #     device_id = int(row["device_id"])

# #     cfg = get_device_cfg(device_id)
# #     # โมเดลเรียนรู้จากไฟ ~230V (L-N) ถ้าอุปกรณ์วัดแบบ L-L ให้แปลงเป็น L-N ก่อนป้อนโมเดล
# #     model_scale = 1.0 / SQRT3 if cfg["basis"] == "LL" else 1.0

# #     groups = {}
# #     for phase, v_col, i_col, pf_col in ML_PHASE_CONFIG:
# #         # เฟสนี้ไม่มีข้อมูล (อุปกรณ์เฟสเดียว) -> ข้าม
# #         if row.get(v_col) is None:
# #             continue

# #         v_val = float(row.get(v_col) or 0.0)   # ค่าจริงจากมิเตอร์

# #         # --- กฎแรงดัน: ใช้ช่วงของอุปกรณ์นี้ (ไม่ใช้ผลทำนายแรงดันของ ML) ---
# #         if v_val >= OUTAGE_VOLT:               # ต่ำกว่านี้ถือว่าไฟดับ ให้ ML ตัดสินเอง
# #             if v_val > cfg["vmax"]:
# #                 groups.setdefault("over_voltage", ("high", OVER_LABEL, []))[2].append((phase, v_val))
# #             elif v_val < cfg["vmin"]:
# #                 groups.setdefault("under_voltage", ("high", UNDER_LABEL, []))[2].append((phase, v_val))

# #         # --- ML: ไฟดับ / ใช้ไฟกลางคืน ---
# #         # ถ้ายังไม่มีโมเดลของเฟสนี้ ใช้โมเดล L1 แทน (ชื่อฟีเจอร์ต้องเป็นของ L1)
# #         m_phase = phase if phase in models else "L1"
# #         model = models.get(m_phase)
# #         if not model:
# #             continue

# #         i_val = float(row.get(i_col) or 0.0)
# #         pf_val = float(row.get(pf_col) or 0.0)
# #         v_model = v_val * model_scale          # แรงดันสเกลเดียวกับที่โมเดลเคยเรียนรู้

# #         hist = volt_hist[(device_id, phase)]
# #         lag1 = hist[-1] if len(hist) >= 1 else v_model
# #         lag2 = hist[-2] if len(hist) >= 2 else lag1

# #         features = pd.DataFrame([{
# #             f"Voltage_{m_phase}": v_model,
# #             f"Current_{m_phase}": i_val,
# #             f"PowerFactor_{m_phase}": pf_val,
# #             "Hour": hour,
# #             f"Voltage_{m_phase}_lag1": lag1,
# #             f"Voltage_{m_phase}_lag2": lag2,
# #         }])
# #         hist.append(v_model)

# #         pred = model.predict(features)[0]
# #         info = ML_STATUS_MAP.get(pred)
# #         if info:
# #             alert_type, sev = info
# #             if alert_type in VOLTAGE_ALERT_TYPES:
# #                 continue                       # แรงดันตัดสินด้วยกฎด้านบนแล้ว
# #             groups.setdefault(alert_type, (sev, pred, []))[2].append((phase, v_val))

# #     for alert_type, (sev, label, items) in groups.items():
# #         names = ", ".join(n for n, _ in items)
# #         vals = ", ".join(f"{n}={v:.1f}V" for n, v in items)
# #         out.append({
# #             "type": alert_type,
# #             "severity": sev,
# #             "description": f"{label} เฟส {names} ({vals})",
# #         })
# #     return out
# def check_anomalies_with_ml(row: dict) -> list:
#     out = []
#     ts = parse_to_utc(row["reading_time"])
#     hour = ts.astimezone().hour
#     device_id = int(row["device_id"])

#     cfg = get_device_cfg(device_id)
#     # โมเดลเรียนรู้จากไฟ ~230V (L-N) ถ้าอุปกรณ์วัดแบบ L-L ให้แปลงเป็น L-N ก่อนป้อนโมเดล
#     model_scale = 1.0 / SQRT3 if cfg["basis"] == "LL" else 1.0

#     groups = {}
#     for phase, v_col, i_col, pf_col in ML_PHASE_CONFIG:
#         # เฟสนี้ไม่มีข้อมูล (อุปกรณ์เฟสเดียว) -> ข้าม
#         if row.get(v_col) is None:
#             continue

#         v_val = float(row.get(v_col) or 0.0)   # ค่าจริงจากมิเตอร์

#         # --- กฎแรงดัน: ใช้ช่วงของอุปกรณ์นี้ (ไม่ใช้ผลทำนายแรงดันของ ML) ---
#         if v_val >= OUTAGE_VOLT:               # ต่ำกว่านี้ถือว่าไฟดับ ให้ ML ตัดสินเอง
#             if v_val > cfg["vmax"]:
#                 groups.setdefault("over_voltage", ("high", OVER_LABEL, []))[2].append((phase, v_val))
#             elif v_val < cfg["vmin"]:
#                 groups.setdefault("under_voltage", ("high", UNDER_LABEL, []))[2].append((phase, v_val))

#         # --- ML: ตรวจสอบความผิดปกติอื่นๆ (เช่น ไฟดับ / ใช้ไฟกลางคืน) ---
#         model = models.get(phase)
#         if not model:
#             continue

#         i_val = float(row.get(i_col) or 0.0)
#         pf_val = float(row.get(pf_col) or 0.0)
#         v_model = v_val * model_scale          # แรงดันสเกลเดียวกับที่โมเดลเคยเรียนรู้

#         hist = volt_hist[(device_id, phase)]
#         lag1 = hist[-1] if len(hist) >= 1 else v_model
#         lag2 = hist[-2] if len(hist) >= 2 else lag1

#         # กำหนดชื่อคอลัมน์ฟีเจอร์เป็น L1 เพื่อให้ตรงตามที่ rf_voltage_model.joblib ถูกเทรนมา
#         features = pd.DataFrame([{
#             "Voltage_L1": v_model,
#             "Current_L1": i_val,
#             "PowerFactor_L1": pf_val,
#             "Hour": hour,
#             "Voltage_L1_lag1": lag1,
#             "Voltage_L1_lag2": lag2,
#         }])
#         hist.append(v_model)

#         pred = model.predict(features)[0]
#         info = ML_STATUS_MAP.get(pred)
#         if info:
#             alert_type, sev = info
#             if alert_type in VOLTAGE_ALERT_TYPES:
#                 continue                       # แรงดันตัดสินด้วยกฎด้านบนแล้ว
#             groups.setdefault(alert_type, (sev, pred, []))[2].append((phase, v_val))

#     for alert_type, (sev, label, items) in groups.items():
#         names = ", ".join(n for n, _ in items)
#         vals = ", ".join(f"{n}={v:.1f}V" for n, v in items)
#         out.append({
#             "type": alert_type,
#             "severity": sev,
#             "description": f"{label} เฟส {names} ({vals})",
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
#     if not alert_type:
#         return False
#     return any(kw in alert_type for kw in IGNORE_AUTO_RESOLVE_KEYWORDS)


# def auto_resolve_voltage(device_id: int, current_voltage_types: set, reading_iso: str) -> bool:
#     """ปิด alert พร้อมบันทึกเหตุผล ณ เวลาที่ worker เห็นค่าจริง (reading_iso = เวลา reading ปัจจุบัน)

#     - สลับขั้ว (ไฟต่ำ <-> ไฟเกิน): ปิดทันที reason='superseded'
#     - ปกติติดกัน RESOLVE_AFTER ค่า: ปิด reason='recovered' เวลา = reading ที่ยืนยันว่าปกติ
#     """
#     open_rows = (
#         sb.table("anomalies").select("id, type")
#         .eq("device_id", device_id).in_("status", ACTIVE_STATUSES)
#         .execute().data
#     )

#     swapped_ids = []
#     normal_ids = []

#     for r in open_rows:
#         t = r["type"]
#         if is_ignored_type(t):
#             continue

#         key = (device_id, t)

#         # ยังผิดปกติอยู่ -> รีเซ็ตตัวนับ
#         if t in current_voltage_types:
#             normal_count[key] = 0
#             continue

#         # สลับขั้ว: ไม่ผ่านช่วงปกติ ห้ามนับเป็น "ไฟกลับมาปกติ"
#         opposite = OPPOSITE_TYPE.get(t)
#         if opposite and opposite in current_voltage_types:
#             swapped_ids.append(r["id"])
#             normal_count.pop(key, None)
#             continue

#         normal_count[key] += 1
#         if normal_count[key] >= RESOLVE_AFTER:
#             normal_ids.append(r["id"])
#             normal_count.pop(key, None)

#     if not swapped_ids and not normal_ids:
#         return False

#     if swapped_ids:
#         sb.table("anomalies").update({
#             "status": "resolved",
#             "resolved_at": reading_iso,
#             "resolution_reason": REASON_SUPERSEDED,
#         }).in_("id", swapped_ids).execute()

#     if normal_ids:
#         sb.table("anomalies").update({
#             "status": "resolved",
#             "resolved_at": reading_iso,
#             "resolution_reason": REASON_RECOVERED,
#         }).in_("id", normal_ids).execute()

#     log.info("✅ device %s: ปิด Alert สลับขั้ว %d / กลับปกติ %d รายการ",
#              device_id, len(swapped_ids), len(normal_ids))
#     return True


# def handle(row: dict) -> None:
#     try:
#         device_id = int(row["device_id"])
#     except (TypeError, ValueError):
#         return

#     reading_dt = parse_to_utc(row["reading_time"])
#     reading_iso = reading_dt.isoformat()
#     lag = (datetime.now(timezone.utc) - reading_dt).total_seconds()
#     log.info("⏱️ device %s lag=%.1fs", device_id, lag)

#     # 1. ตรวจความผิดปกติ (แรงดันตามเกณฑ์อุปกรณ์ + ML สำหรับไฟดับ/ใช้ไฟกลางคืน)
#     found = check_anomalies_with_ml(row)

#     # ข้อมูลเก่าเกินกำหนด ไม่สร้าง/แก้ alert
#     if lag > MAX_LAG_SEC:
#         return

#     current_types = {a["type"] for a in found}

#     # 2. เคลียร์ Alert เดิมที่ไม่ตรงกับรอบนี้ (ต้องปกติต่อเนื่องก่อนถึงจะปิด)
#     changed = auto_resolve_voltage(device_id, current_types, reading_iso)
#     if changed:
#         log.info("🔄 [device_id: %s] อัปเดตสถานะความผิดปกติเดิมเป็น resolved", device_id)

#     created = False

#     # 3. วนลูปตรวจสอบความผิดปกติที่พบ
#     for a in found:
#         alert_type = a.get("type", "unknown")
#         severity = a.get("severity", "warning")
#         description = a.get("description", "")

#         print(f"⚠️ [Detect] ตรวจพบเหตุการณ์ device_id: {device_id} | Type: {alert_type} | Description: {description}")

#         exists = (
#             sb.table("anomalies").select("id")
#             .eq("device_id", device_id).eq("type", alert_type).in_("status", ACTIVE_STATUSES)
#             .limit(1).execute().data
#         )

#         if exists:
#             # อัปเดตรายละเอียด (แรงดันและเฟสล่าสุด) ของแถวเดิมทุกชนิด โดยไม่สร้างซ้ำ
#             sb.table("anomalies").update({"description": description}).eq("id", exists[0]["id"]).execute()
#             log.info("⏭️ [device_id: %s] ข้ามการบันทึก: พบรายการ %s สถานะ Active อยู่แล้ว", device_id, alert_type)
#             continue

#         print(f"💾 [DB Insert] กำลังบันทึก anomaly สำหรับ device_id: {device_id}, result: {alert_type}")

#         sb.table("anomalies").insert({
#             "device_id": device_id,
#             "type": alert_type,
#             "severity": severity,
#             "description": description,
#         }).execute()

#         created = True
#         log.info("🚨 device %s: %s", device_id, description)

#     # 4. อัปเดตสถานะของอาคาร
#     if created or changed:
#         print(f"🏢 [Building Status] กำลังอัปเดตสถานะอาคารสำหรับ device_id: {device_id}")
#         update_building_status(device_id)


# def check_offline() -> None:
#     """ไม่บันทึก alert ไฟดับ (frontend/RPC เป็นเจ้าของ)
#     ทำแค่เคลียร์ alert แรงดันค้างเมื่ออุปกรณ์เงียบเกิน OFFLINE_SEC
#     (ปิดด้วย reason='offline' เพื่อไม่ให้หน้าเว็บแสดงเป็น "ไฟกลับมาปกติ")"""
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

#         sb.table("anomalies").update({
#             "status": "resolved",
#             "resolved_at": now_utc.isoformat(),
#             "resolution_reason": REASON_OFFLINE,
#         }).in_("id", [x["id"] for x in open_rows]).execute()

#         # อุปกรณ์เงียบ -> รีเซ็ตตัวนับและประวัติแรงดันของอุปกรณ์นี้
#         for k in [k for k in normal_count if k[0] == did]:
#             normal_count.pop(k, None)
#         for k in [k for k in volt_hist if k[0] == did]:
#             volt_hist.pop(k, None)

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
#     log.info("🚀 เริ่มรันสคริปต์... POLL_SEC=%.0f, OFFLINE_SEC=%.0f", POLL_SEC, OFFLINE_SEC)

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

#             if batch > 0:
#                 print(f"📥 [Poll Batch] ดึงข้อมูลมาประมวลผล {batch} แถว (Cursor: {cursor})")

#             for row in rows:
#                 key = (row["device_id"], row["reading_time"])
#                 if key in seen:
#                     continue
#                 try:
#                     handle(row)
#                 except Exception as e:
#                     # แถวที่พังต้องไม่ขวางทั้งคิว ไม่งั้น cursor ค้างแล้ววนแถวเดิมซ้ำ
#                     log.error("handle error device=%s time=%s: %s",
#                               row.get("device_id"), row.get("reading_time"), e)
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


# ml_poll_worker.py
import logging
import math
import os
import time
import pandas as pd
from datetime import datetime, timedelta, timezone
from collections import defaultdict, deque

import joblib
from dotenv import load_dotenv

load_dotenv()

from supabase import create_client

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("ml_poll")

POLL_SEC = float(os.getenv("POLL_SEC", "5"))
OFFLINE_SEC = float(os.getenv("OFFLINE_SEC", "180"))   # เกินกี่วินาทีถือว่า Offline
OFFLINE_TYPE = "device_offline"
OFFLINE_CHECK_SEC = 10                                  # ตรวจ Offline ทุกๆ 10 วินาที
BACKFILL_MAX_HOURS = float(os.getenv("BACKFILL_MAX_HOURS", "0.1"))  # ย้อนหลังสูงสุด ~6 นาที
CURSOR_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".cursor")
DEVICE_IDS = [int(x) for x in os.getenv("DEVICE_IDS", "").split(",") if x.strip()]

RESOLVE_AFTER = int(os.getenv("RESOLVE_AFTER", "3"))   # ต้องปกติติดกันกี่รอบถึงจะปิด alert
MAX_LAG_SEC = float(os.getenv("MAX_LAG_SEC", "300"))   # ข้อมูลเก่ากว่านี้ไม่สร้าง/แก้ alert
OVER_LABEL = "🔺 ไฟเกิน (Over Voltage)"
UNDER_LABEL = "🔻 ไฟต่ำ (Undervoltage)"

# ---- เกณฑ์แรงดันแยกต่ออุปกรณ์ (อ่านจากตาราง devices) ----
DEFAULT_NOMINAL_VOLT = 230.0   # ใช้เมื่ออุปกรณ์ไม่ได้ตั้ง nominal_voltage
VOLT_TOLERANCE = 0.10          # ±10% ใช้คำนวณช่วงปกติเมื่อไม่ได้ตั้ง voltage_min/max
OUTAGE_VOLT = float(os.getenv("OUTAGE_VOLT", "50"))    # ต่ำกว่านี้ถือว่าไฟดับ ไม่นับเป็นไฟต่ำ
DEVICE_CFG_TTL = 60        # รีโหลดค่าจากตาราง devices ทุกกี่วินาที
SQRT3 = math.sqrt(3)
VOLTAGE_ALERT_TYPES = {"over_voltage", "under_voltage"}

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

# เหตุผลที่ปิด alert (เก็บในคอลัมน์ anomalies.resolution_reason)
REASON_RECOVERED = "recovered"    # แรงดันกลับเข้าช่วงปกติจริง (เห็นค่าปกติติดกัน RESOLVE_AFTER ค่า)
REASON_SUPERSEDED = "superseded"  # ข้ามจากไฟต่ำ <-> ไฟเกิน โดยไม่ผ่านช่วงปกติ
REASON_OFFLINE = "offline"        # อุปกรณ์เงียบ ปิดเพราะไม่มีข้อมูล (ไม่ใช่ "กลับมาปกติ")

# ไฟเกินกับไฟต่ำเกิดพร้อมกันไม่ได้ ถ้าตรวจพบอย่างหนึ่ง ให้ปิดอีกอย่างที่ค้างอยู่ทันที
OPPOSITE_TYPE = {
    "over_voltage": "under_voltage",
    "under_voltage": "over_voltage",
}

MONTHS_TH = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."]

# ==========================================
# 🧠 State ในหน่วยความจำ
# ==========================================
volt_hist = defaultdict(lambda: deque(maxlen=2))   # key = (device_id, phase) เก็บแรงดันย้อนหลัง 2 ค่า (สเกลเดียวกับที่ป้อนโมเดล)
normal_count = defaultdict(int)                    # key = (device_id, alert_type) นับรอบที่กลับเป็นปกติ

_device_cfg = {}                # device_id -> แถวจากตาราง devices
_device_cfg_loaded_at = 0.0

# ==========================================
# 🤖 โหลดโมเดล AI (.joblib) แยกรายเฟส
# ==========================================
MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
models = {}

single_model_path = os.path.join(MODELS_DIR, "rf_voltage_model.joblib")
if os.path.exists(single_model_path):
    try:
        loaded_object = joblib.load(single_model_path)
        
        if isinstance(loaded_object, dict):
            shared_model = (
                loaded_object.get("model") 
                or loaded_object.get("rf_model") 
                or loaded_object.get("estimator")
                or list(loaded_object.values())[0]
            )
        else:
            shared_model = loaded_object

        for phase in ["L1", "L2", "L3"]:
            models[phase] = shared_model
        log.info("✅ โหลดโมเดล ML (rf_voltage_model.joblib) สำหรับทุกเฟสสำเร็จ")
    except Exception as e:
        log.error("❌ ไม่สามารถโหลดโมเดลได้: %s", e)
else:
    log.warning("⚠️ ไม่พบไฟล์โมเดลที่ path: %s", single_model_path)

# ==========================================
# 📌 Label & Mapping
# ==========================================
ML_STATUS_MAP = {
    OVER_LABEL: ("over_voltage", "high"),
    UNDER_LABEL: ("under_voltage", "high"),
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
# ⚙️ เกณฑ์แรงดันต่ออุปกรณ์ (จากตาราง devices)
# ==========================================
def get_device_cfg(device_id: int) -> dict:
    global _device_cfg, _device_cfg_loaded_at

    now = time.time()
    if now - _device_cfg_loaded_at >= DEVICE_CFG_TTL:
        try:
            rows = (
                sb.table("devices")
                .select("id,voltage_min,voltage_max,voltage_basis,nominal_voltage")
                .execute().data
            )
            _device_cfg = {int(r["id"]): r for r in rows}
            _device_cfg_loaded_at = now
            log.info("⚙️ โหลดเกณฑ์แรงดันของอุปกรณ์ %d ตัว", len(_device_cfg))
        except Exception as e:
            log.error("โหลดเกณฑ์แรงดันจากตาราง devices ล้มเหลว (ใช้ค่าเดิม/ค่า fallback): %s", e)
            _device_cfg_loaded_at = now - DEVICE_CFG_TTL + 10   # ลองใหม่ใน 10 วินาที

    cfg = _device_cfg.get(device_id) or {}
    nominal = float(cfg.get("nominal_voltage") or DEFAULT_NOMINAL_VOLT)
    vmin = cfg.get("voltage_min")
    vmax = cfg.get("voltage_max")
    return {
        "vmin": float(vmin) if vmin is not None else nominal * (1 - VOLT_TOLERANCE),
        "vmax": float(vmax) if vmax is not None else nominal * (1 + VOLT_TOLERANCE),
        "basis": str(cfg.get("voltage_basis") or "LN").upper(),
    }


# ==========================================
# 🤖 ฟังก์ชันตรวจความผิดปกติ
# ==========================================
def check_anomalies_with_ml(row: dict) -> list:
    out = []
    device_id = int(row["device_id"])
    cfg = get_device_cfg(device_id)

    groups = {}
    for phase, v_col, i_col, pf_col in ML_PHASE_CONFIG:
        if row.get(v_col) is None:
            continue

        v_val = float(row.get(v_col) or 0.0)   # ค่าจริงจากมิเตอร์

        # --- กฎแรงดัน: ใช้ช่วงของอุปกรณ์นี้ ---
        if v_val >= OUTAGE_VOLT:               
            if v_val > cfg["vmax"]:
                groups.setdefault("over_voltage", ("high", OVER_LABEL, []))[2].append((phase, v_val))
            elif v_val < cfg["vmin"]:
                groups.setdefault("under_voltage", ("high", UNDER_LABEL, []))[2].append((phase, v_val))

        model = models.get(phase)
        if not model:
            continue

        hist = volt_hist[(device_id, phase)]
        hist.append(v_val)

        # ดึง Feature Names ทั้งหมดที่โมเดลต้องการจาก feature_names_in_
        expected_features = getattr(model, "feature_names_in_", None)

        if expected_features is not None:
            input_dict = {}
            for col in expected_features:
                if col in ["V", "Voltage"]:
                    input_dict[col] = v_val
                elif col in ["Vavg", "Voltage_avg"]:
                    input_dict[col] = v_val
                elif col in ["Vmax", "Voltage_max"]:
                    input_dict[col] = max(hist) if hist else v_val
                elif col in ["Vmin", "Voltage_min"]:
                    input_dict[col] = min(hist) if hist else v_val
                elif col in ["I", "Current"]:
                    input_dict[col] = float(row.get(i_col) or 0.0)
                elif col in ["PF", "PowerFactor"]:
                    input_dict[col] = float(row.get(pf_col) or 0.0)
                else:
                    input_dict[col] = 0.0

            features = pd.DataFrame([input_dict], columns=expected_features)
        else:
            # Fallback หากไม่มี metadata feature_names_in_
            features = pd.DataFrame([{
                "V": v_val,
                "Vavg": v_val,
                "Vmax": max(hist) if hist else v_val,
                "Vmin": min(hist) if hist else v_val
            }])

        pred = model.predict(features)[0]
        info = ML_STATUS_MAP.get(pred)
        if info:
            alert_type, sev = info
            if alert_type in VOLTAGE_ALERT_TYPES:
                continue
            groups.setdefault(alert_type, (sev, pred, []))[2].append((phase, v_val))

    for alert_type, (sev, label, items) in groups.items():
        names = ", ".join(n for n, _ in items)
        vals = ", ".join(f"{n}={v:.1f}V" for n, v in items)
        out.append({
            "type": alert_type,
            "severity": sev,
            "description": f"{label} เฟส {names} ({vals})",
        })
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


def auto_resolve_voltage(device_id: int, current_voltage_types: set, reading_iso: str) -> bool:
    open_rows = (
        sb.table("anomalies").select("id, type")
        .eq("device_id", device_id).in_("status", ACTIVE_STATUSES)
        .execute().data
    )

    swapped_ids = []
    normal_ids = []

    for r in open_rows:
        t = r["type"]
        if is_ignored_type(t):
            continue

        key = (device_id, t)

        if t in current_voltage_types:
            normal_count[key] = 0
            continue

        opposite = OPPOSITE_TYPE.get(t)
        if opposite and opposite in current_voltage_types:
            swapped_ids.append(r["id"])
            normal_count.pop(key, None)
            continue

        normal_count[key] += 1
        if normal_count[key] >= RESOLVE_AFTER:
            normal_ids.append(r["id"])
            normal_count.pop(key, None)

    if not swapped_ids and not normal_ids:
        return False

    if swapped_ids:
        sb.table("anomalies").update({
            "status": "resolved",
            "resolved_at": reading_iso,
            "resolution_reason": REASON_SUPERSEDED,
        }).in_("id", swapped_ids).execute()

    if normal_ids:
        sb.table("anomalies").update({
            "status": "resolved",
            "resolved_at": reading_iso,
            "resolution_reason": REASON_RECOVERED,
        }).in_("id", normal_ids).execute()

    log.info("✅ device %s: ปิด Alert สลับขั้ว %d / กลับปกติ %d รายการ",
             device_id, len(swapped_ids), len(normal_ids))
    return True


def handle(row: dict) -> None:
    try:
        device_id = int(row["device_id"])
    except (TypeError, ValueError):
        return

    reading_dt = parse_to_utc(row["reading_time"])
    reading_iso = reading_dt.isoformat()
    lag = (datetime.now(timezone.utc) - reading_dt).total_seconds()
    log.info("⏱️ device %s lag=%.1fs", device_id, lag)

    found = check_anomalies_with_ml(row)

    if lag > MAX_LAG_SEC:
        return

    current_types = {a["type"] for a in found}

    changed = auto_resolve_voltage(device_id, current_types, reading_iso)
    if changed:
        log.info("🔄 [device_id: %s] อัปเดตสถานะความผิดปกติเดิมเป็น resolved", device_id)

    created = False

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

    if created or changed:
        print(f"🏢 [Building Status] กำลังอัปเดตสถานะอาคารสำหรับ device_id: {device_id}")
        update_building_status(device_id)


def check_offline() -> None:
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

        sb.table("anomalies").update({
            "status": "resolved",
            "resolved_at": now_utc.isoformat(),
            "resolution_reason": REASON_OFFLINE,
        }).in_("id", [x["id"] for x in open_rows]).execute()

        for k in [k for k in normal_count if k[0] == did]:
            normal_count.pop(k, None)
        for k in [k for k in volt_hist if k[0] == did]:
            volt_hist.pop(k, None)

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
    log.info("🚀 เริ่มรันสคริปต์... POLL_SEC=%.0f, OFFLINE_SEC=%.0f", POLL_SEC, OFFLINE_SEC)

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
                try:
                    handle(row)
                except Exception as e:
                    log.error("handle error device=%s time=%s: %s",
                              row.get("device_id"), row.get("reading_time"), e)
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