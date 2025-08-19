const { pool } = require('../config/db');

async function getThresholds() {
  const [rows] = await pool.execute('SELECT * FROM thresholds WHERE id=1');
  if (!rows[0]) {
    return {
      temp_high: Number(process.env.THRESHOLD_TEMP_HIGH || 35),
      hum_low: Number(process.env.THRESHOLD_HUM_LOW || 40),
    };
  }
  return rows[0];
}

async function setThresholds({ temp_high, hum_low }) {
  await pool.execute('UPDATE thresholds SET temp_high=?, hum_low=? WHERE id=1', [
    temp_high,
    hum_low,
  ]);
  return getThresholds();
}

module.exports = { getThresholds, setThresholds };
