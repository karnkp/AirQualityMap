const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'air4thai',
  password: 'P@$$w0rd',
  port: 5432,
});

// API ดึงรายชื่อจังหวัดไม่ซ้ำ (เพื่อเติม dropdown)
app.get('/api/provinces', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT province
      FROM air_stations
      WHERE province IS NOT NULL AND province <> ''
      ORDER BY province
    `);
    res.json(result.rows.map(r => r.province));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API ดึงสถานีล่าสุดในจังหวัดที่เลือก
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
      WHERE province = $1
      ORDER BY station_id, record_datetime DESC
    `;
    const result = await pool.query(query, [province]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/allstations', async (req, res) => {
  try {
    const all20 = await pool.query(`
      SELECT DISTINCT ON (station_id)
        station_id,
        station_name_th,
        aqi,
        lat,
        lon,
        record_datetime
      FROM air_stations
      where aqi > 20
      ORDER BY station_id, record_datetime DESC
    `);
    
    res.json(all20.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API aqi
app.get('/api/aqi', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT province
      FROM air_stations
      WHERE aqi IS NOT NULL AND aqi <> ''
      ORDER BY aqi
    `);
    res.json(result.rows.map(r => r.aqi));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API ดึงสถานีล่าสุดaqiที่เลือก
app.get('/api/aqistations', async (req, res) => {
  try {
    const aqi = req.query.aqi || '';
    const aqi2 = req.query.aqi2 || '';

    const query = `
      SELECT DISTINCT ON (station_id)
        station_id,
        station_name_th,
        aqi,
        lat,
        lon,
        record_datetime
      FROM air_stations
      WHERE aqi > $1 and aqi <$2
      ORDER BY station_id, record_datetime DESC
    `;
    const result1 = await pool.query(query, [aqi, aqi2]);
    res.json(result1.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// เสิร์ฟหน้า HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
