const { pool } = require('../config/db');

async function getState() {
  const [rows] = await pool.execute('SELECT * FROM device_state WHERE id=1');
  return rows[0];
}

async function setState(partial) {
  const current = await getState();
  const merged = { ...current, ...partial };
  await pool.execute(
    'UPDATE device_state SET fan=?, humidifier=?, led=?, buzzer=? WHERE id=1',
    [merged.fan ? 1 : 0, merged.humidifier ? 1 : 0, merged.led ? 1 : 0, merged.buzzer ? 1 : 0]
  );
  return getState();
}

module.exports = { getState, setState };
