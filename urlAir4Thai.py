import requests
import psycopg2
from datetime import datetime

# ฟังก์ชันดึงชื่อจังหวัดจาก area_th
def extract_province(area_th):
    if ',' in area_th:
        return area_th.split(',')[-1].strip()
    else:
        # ถ้ามีคำว่า เขต หรือ แขวง ให้ถือว่าเป็นกรุงเทพฯ
        if 'เขต' in area_th or 'แขวง' in area_th:
            return 'กรุงเทพฯ'
        return None

# 1. ดึงข้อมูลจาก API
url = "http://air4thai.com/forweb/getAQI_JSON.php"
data = requests.get(url).json()

# 2. Connect DB
conn = psycopg2.connect(
    dbname="air4thai",
    user="postgres",
    password="P@$$w0rd",
    host="localhost",
    port="5432"
)
cur = conn.cursor()

# 3. Loop เก็บข้อมูล
for station in data['stations']:
    station_id = station['stationID']
    name_th = station['nameTH']
    name_en = station['nameEN']
    area_th = station['areaTH']
    area_en = station['areaEN']
    station_type = station['stationType']
    lat = float(station['lat'])
    lon = float(station['long'])
    province = extract_province(area_th)

    # ดึงค่าล่าสุดจาก AQILast
    aqi_last = station['AQILast']
    aqi = int(aqi_last['AQI']['aqi']) if aqi_last['AQI']['aqi'].isdigit() else None
    aqi_param = aqi_last['AQI']['param']
    pm25_value = float(aqi_last['PM25']['value']) if aqi_last['PM25']['value'] != "-1" else None
    pm25_aqi = int(aqi_last['PM25']['aqi']) if aqi_last['PM25']['aqi'].isdigit() else None
    pm10_value = float(aqi_last['PM10']['value']) if aqi_last['PM10']['value'] != "-1" else None
    pm10_aqi = int(aqi_last['PM10']['aqi']) if aqi_last['PM10']['aqi'].isdigit() else None

    # ใช้วันที่และเวลาจาก JSON
    record_date = aqi_last['date']
    record_time = aqi_last['time']
    record_datetime = datetime.strptime(f"{record_date} {record_time}", "%Y-%m-%d %H:%M")

    # Insert ข้อมูล
    cur.execute("""
        INSERT INTO air_stations (
            station_id, station_name_th, station_name_en, area_th, area_en,
            station_type, aqi, aqi_param, pm25_value, pm25_aqi, pm10_value, pm10_aqi,
            lat, lon, geom, record_datetime, province
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                ST_SetSRID(ST_MakePoint(%s, %s), 4326), %s, %s)
    """, (
        station_id, name_th, name_en, area_th, area_en,
        station_type, aqi, aqi_param, pm25_value, pm25_aqi, pm10_value, pm10_aqi,
        lat, lon, lon, lat, record_datetime, province
    ))

# 4. Save & Close
conn.commit()
cur.close()
conn.close()
print("complete")
