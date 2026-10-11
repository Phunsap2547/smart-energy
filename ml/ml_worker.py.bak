# -*- coding: utf-8 -*-
"""
ml_worker.py — FastAPI ห่อโมเดล RandomForest 3 เฟส (L1/L2/L3) จาก ai.py

หน้าที่: รับค่าวัดจาก Node -> ให้โมเดลแต่ละเฟสทำนายสถานะ -> ส่งผลกลับเป็น JSON
(ไม่ยุ่งกับ Supabase เลย Node เป็นคน insert ลงตาราง anomalies เอง)

รัน:  uvicorn ml_worker:app --host 0.0.0.0 --port 8000
ไฟล์โมเดล: วาง power_ai_brain_3phase_L1/L2/L3.joblib ไว้ที่ ml/models/ (หรือตั้ง env MODEL_DIR)
"""
# import os
# from datetime import datetime, timedelta, timezone
# from typing import Optional, Union

# import joblib
# import pandas as pd
# from fastapi import FastAPI
# from pydantic import BaseModel

# MODEL_DIR = os.getenv(
#     "MODEL_DIR",
#     os.path.join(os.path.dirname(os.path.abspath(__file__)), "models"),
# )

# # เฟสในโมเดล -> ต่อท้ายชื่อคอลัมน์ที่ Node ส่งมา (L1=a, L2=b, L3=c)
# PHASES = {"L1": "a", "L2": "b", "L3": "c"}

# # โหลดครั้งเดียวตอนสตาร์ท ถ้าไฟล์หายจะ error ทันที (ดีกว่าเงียบแล้วทำนายไม่ได้)
# models = {
#     phase: joblib.load(os.path.join(MODEL_DIR, f"power_ai_brain_3phase_{phase}.joblib"))
#     for phase in PHASES
# }

# # (ข้อความที่อยู่ใน label ของโมเดล, type, severity, ชื่อไทย)
# # type <= 50 ตัวอักษร, severity ใช้ได้เฉพาะ critical/high/warning ให้ตรงกับ adminAlerts.js
# LABEL_RULES = [
#     ("Power Outage", "power_outage", "critical", "ไฟดับ"),
#     ("Over Voltage", "over_voltage", "high", "ไฟเกิน"),
#     ("Undervoltage", "under_voltage", "high", "ไฟต่ำ"),
#     ("Voltage Sag", "voltage_sag", "warning", "ไฟตก"),
#     ("Night Usage", "night_usage", "warning", "มีการใช้ไฟฟ้ากลางคืน"),
# ]
# SEVERITY_RANK = {"critical": 0, "high": 1, "warning": 2}


# def classify(label: str):
#     """คืน (type, severity, ชื่อไทย) หรือ None ถ้าเป็นไฟปกติ"""
#     for key, anomaly_type, severity, th_name in LABEL_RULES:
#         if key in label:
#             return anomaly_type, severity, th_name
#     return None


# class Reading(BaseModel):
#     device_id: Optional[Union[int, str]] = None
#     reading_time: Optional[str] = None
#     voltage_a: Optional[float] = None
#     voltage_b: Optional[float] = None
#     voltage_c: Optional[float] = None
#     current_a: Optional[float] = None
#     current_b: Optional[float] = None
#     current_c: Optional[float] = None
#     pf_a: Optional[float] = None
#     pf_b: Optional[float] = None
#     pf_c: Optional[float] = None


# # def hour_of(reading_time: Optional[str]) -> int:
# #     """ชั่วโมง (เวลาไทย) ที่ใช้เป็น feature 'Hour'
# #     getThaiTime() ใน Node บวก 7 ชม. ไว้แล้ว จึงอ่านชั่วโมงตามที่เขียนมาโดยไม่แปลง timezone"""
# #     if reading_time:
# #         try:
# #             return datetime.fromisoformat(reading_time.replace("Z", "+00:00")).hour
# #         except ValueError:
# #             pass
# #     return (datetime.now(timezone.utc) + timedelta(hours=7)).hour


# app = FastAPI(title="Smart Energy ML")


# @app.get("/health")
# def health():
#     return {"status": "ok", "phases": list(models.keys())}


# @app.post("/predict")
# def predict(r: Reading):
#     hour = hour_of(r.reading_time)
#     phases_out = {}
#     grouped = {}

#     for phase, s in PHASES.items():
#         v = getattr(r, f"voltage_{s}")
#         i = getattr(r, f"current_{s}")
#         pf = getattr(r, f"pf_{s}")
#         # เฟสที่ไม่มีข้อมูล (เช่นอุปกรณ์เฟสเดียว) ข้ามไป ไม่ส่งให้โมเดล
#         if v is None or i is None or pf is None:
#             continue

#         # ชื่อคอลัมน์ต้องตรงกับตอนเทรนใน ai.py เป๊ะๆ (ลำดับ: V, I, PF, Hour)
#         X = pd.DataFrame(
#             [[v, i, pf, hour]],
#             columns=[f"Voltage_{phase}", f"Current_{phase}", f"PowerFactor_{phase}", "Hour"],
#         )
#         label = str(models[phase].predict(X)[0])
#         phases_out[phase] = label

#         info = classify(label)
#         if info is None:
#             continue
#         anomaly_type, severity, th_name = info
#         g = grouped.setdefault(
#             anomaly_type,
#             {"type": anomaly_type, "severity": severity, "th": th_name, "phases": [], "values": []},
#         )
#         g["phases"].append(phase)
#         g["values"].append(f"{phase}={i:.1f}A" if anomaly_type == "night_usage" else f"{phase}={v:.1f}V")

#     # รวมเฟสที่ผิดปกติแบบเดียวกันเป็น 1 รายการ (กันแจ้งเตือนซ้ำ 3 แถว)
#     anomalies = [
#         {
#             "type": g["type"],
#             "severity": g["severity"],
#             "phases": g["phases"],
#             "description": f"{g['th']} เฟส {', '.join(g['phases'])} ({', '.join(g['values'])})",
#         }
#         for g in sorted(grouped.values(), key=lambda g: SEVERITY_RANK[g["severity"]])
#     ]

#     return {"is_anomaly": bool(anomalies), "anomalies": anomalies, "phases": phases_out}