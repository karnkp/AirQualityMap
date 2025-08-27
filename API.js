/*
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'air4thai', // ชื่อ DB ของคุณ
  password: 'P@$$w0rd', // รหัสผ่านจริงของคุณ
  port: 5432,
});

// API: ข้อมูลล่าสุดของแต่ละสถานีในจังหวัด
app.get('/api/stations', async (req, res) => {
  try {
    const province = req.query.province || '';

    const query = `
      SELECT DISTINCT ON (station_id)
        station_id,
        station_name_th,
        aqi,
        lat,
        lon,
        record_datetime
      FROM air_stations
      WHERE area_th LIKE $1
      ORDER BY station_id, record_datetime DESC
    `;

    const path = require('path');

// เสิร์ฟไฟล์ index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


    const result = await pool.query(query, [`%${province}%`]);
    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
*/