import time
import joblib
import pandas as pd
from supabase import create_client

# 1. เชื่อมต่อ Supabase
SUPABASE_URL = "YOUR_SUPABASE_URL"
SUPABASE_KEY = "YOUR_SUPABASE_ANON_KEY"
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# 2. โหลดโมเดล ML
model = joblib.load('model.pkl')

def detect_and_alert():
    # ดึงข้อมูลการใช้ไฟล่าสุดจาก Supabase
    res = supabase.table('energy_readings').select('*').order('reading_time', desc=True).limit(50).execute()
    readings = res.data

    if not readings:
        return

    # แปลงข้อมูลเตรียมเข้าโมเดล
    df = pd.DataFrame(readings)
    
    # ทำนายผล (สมมติว่าถ้าค่าเป็น -1 หรือ 1 คือมีความผิดปกติ)
    predictions = model.predict(df[['energy_kwh']]) 

    for idx, pred in enumerate(predictions):
        if pred == -1: # เจอ Anomaly!
            device_id = readings[idx]['device_id']
            
            # บันทึกลงตาราง anomalies ตรงๆ
            supabase.table('anomalies').insert({
                'device_id': device_id,
                'type': 'ML_ANOMALY',
                'severity': 'danger',
                'description': 'ตรวจพบการใช้ไฟฟ้าผิดปกติโดย ML Model',
                'status': 'open' # ตรงตาม schema anomalies
            }).execute()
            print(f"Alert saved for device {device_id}")

# สั่งให้ทำงานทุกๆ 5 นาที
if __name__ == '__main__':
    print("ML Service Started...")
    while True:
        try:
            detect_and_alert()
        except Exception as e:
            print(f"Error: {e}")
        time.sleep(300) # 300 วินาที = 5 นาที