const validator = require('validator');
const { insertSensorData, fetchRecent, fetchLatest } = require('../models/SensorData');
const { getThresholds } = require('../models/thresholdModel');
const { pool } = require('../config/db');
const { pushAlert } = require('./alertController');

function checkApiKey(req) {
  const needKey = !!process.env.ESP32_API_KEY;
  if (!needKey) return true;
  return req.headers['x-api-key'] === process.env.ESP32_API_KEY;
}

async function postData(req, res) {
  try {
    if (!checkApiKey(req)) return res.status(401).json({ ok: false, error: 'Unauthorized' });

    let { temperature, humidity } = req.body;
    if (typeof temperature === 'string') temperature = temperature.trim();
    if (typeof humidity === 'string') humidity = humidity.trim();

    if (!validator.isFloat(String(temperature)) || !validator.isFloat(String(humidity))) {
      return res.status(400).json({ ok: false, error: 'Invalid payload' });
    }

    temperature = Number(temperature);
    humidity = Number(humidity);

    const id = await insertSensorData(temperature, humidity);

    // Phát realtime qua socket
    const io = req.app.get('io');
    io.emit('sensor:new', { id, temperature, humidity, created_at: new Date().toISOString() });

    // Kiểm tra ngưỡng -> ghi alert & gửi thông báo
    const thr = await getThresholds();
    const alerts = [];
    if (temperature >= Number(thr.temp_high)) alerts.push(['TEMP_HIGH', temperature, thr.temp_high]);
    if (humidity <= Number(thr.hum_low)) alerts.push(['HUM_LOW', humidity, thr.hum_low]);

    if (alerts.length) {
      // ghi DB (best effort)
      try {
        for (const [type, val, thrVal] of alerts) {
          await pool.execute('INSERT INTO alerts (type, message) VALUES (?, ?)', [
            type,
            `${type} value=${val} threshold=${thrVal}`,
          ]);
        }
      } catch (_) {}
      for (const [type, val, thrVal] of alerts) {
        pushAlert(type, val, thrVal).catch(() => {});
      }
    }

    return res.json({ ok: true, id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
}

async function getRecent(req, res) {
  const limit = Number(req.query.limit || 100);
  const data = await fetchRecent(limit);
  res.json({ ok: true, data });
}

async function getLatest(req, res) {
  const data = await fetchLatest();
  res.json({ ok: true, data });
}

module.exports = { postData, getRecent, getLatest };
