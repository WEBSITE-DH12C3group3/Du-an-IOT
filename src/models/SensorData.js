const { pool } = require('../config/db');

async function insertSensorData(temperature, humidity) {
  const [res] = await pool.execute(
    'INSERT INTO sensor_data (temperature, humidity) VALUES (?, ?)',
    [temperature, humidity]
  );
  return res.insertId;
}

async function fetchRecent(limit = 50) {
  const [rows] = await pool.execute(
    'SELECT * FROM sensor_data ORDER BY id DESC LIMIT ?',
    [Number(limit)]
  );
  return rows.reverse(); // hiển thị tăng dần theo thời gian
}

async function fetchLatest() {
  const [rows] = await pool.execute('SELECT * FROM sensor_data ORDER BY id DESC LIMIT 1');
  return rows[0] || null;
}

module.exports = { insertSensorData, fetchRecent, fetchLatest };
