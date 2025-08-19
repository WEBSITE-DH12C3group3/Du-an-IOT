const { getState, setState } = require('../models/controlModel');
const { getThresholds, setThresholds } = require('../models/thresholdModel');

async function getControl(req, res) {
  const state = await getState();
  res.json({ ok: true, state });
}

async function postControl(req, res) {
  const { fan, humidifier, led, buzzer } = req.body;
  const state = await setState({ fan, humidifier, led, buzzer });
  req.app.get('io').emit('control:update', state);
  res.json({ ok: true, state });
}

async function getThreshold(req, res) {
  const thr = await getThresholds();
  res.json({ ok: true, thresholds: thr });
}

async function postThreshold(req, res) {
  const { temp_high, hum_low } = req.body;
  const thr = await setThresholds({ temp_high, hum_low });
  req.app.get('io').emit('threshold:update', thr);
  res.json({ ok: true, thresholds: thr });
}

module.exports = { getControl, postControl, getThreshold, postThreshold };
