(async function () {
  const socket = io();

  const elTemp = document.getElementById('temp');
  const elHum = document.getElementById('hum');
  const elTs = document.getElementById('ts');

  const elFan = document.getElementById('fan');
  const elHumidifier = document.getElementById('humidifier');
  const elLed = document.getElementById('led');
  const elBuzzer = document.getElementById('buzzer');
  const btnSaveControl = document.getElementById('saveControl');

  const elThrTemp = document.getElementById('thrTemp');
  const elThrHum = document.getElementById('thrHum');
  const btnSaveThr = document.getElementById('saveThreshold');

  // Chart
  const ctx = document.getElementById('chart');
  const labels = [];
  const temps = [];
  const hums = [];
  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Nhiệt độ (°C)', data: temps, tension: 0.3 },
        { label: 'Độ ẩm (%)', data: hums, tension: 0.3 }
      ]
    },
    options: {
      animation: false,
      scales: { x: { ticks: { color: '#a9b7ff' } }, y: { ticks: { color: '#a9b7ff' } } },
      plugins: { legend: { labels: { color: '#e8eefc' } } }
    }
  });

  const fmt = (d) => new Date(d).toLocaleString();

  async function loadInitial() {
    const recent = await fetch('/api/data?limit=50').then(r => r.json());
    if (recent.ok) {
      recent.data.forEach(row => {
        labels.push(fmt(row.created_at));
        temps.push(Number(row.temperature));
        hums.push(Number(row.humidity));
      });
      chart.update();
      const last = recent.data[recent.data.length - 1];
      if (last) updateCurrent(last);
    }

    const control = await fetch('/api/control').then(r => r.json());
    if (control.ok) {
      elFan.checked = !!control.state.fan;
      elHumidifier.checked = !!control.state.humidifier;
      elLed.checked = !!control.state.led;
      elBuzzer.checked = !!control.state.buzzer;
    }

    const thr = await fetch('/api/thresholds').then(r => r.json());
    if (thr.ok) {
      elThrTemp.value = Number(thr.thresholds.temp_high);
      elThrHum.value = Number(thr.thresholds.hum_low);
    }
  }

  function updateCurrent(row) {
    elTemp.textContent = Number(row.temperature).toFixed(1);
    elHum.textContent = Number(row.humidity).toFixed(1);
    elTs.textContent = fmt(row.created_at || Date.now());
  }

  // Save control
  btnSaveControl.addEventListener('click', async () => {
    const body = {
      fan: elFan.checked,
      humidifier: elHumidifier.checked,
      led: elLed.checked,
      buzzer: elBuzzer.checked
    };
    await fetch('/api/control', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  });

  // Save thresholds
  btnSaveThr.addEventListener('click', async () => {
    const body = { temp_high: Number(elThrTemp.value), hum_low: Number(elThrHum.value) };
    await fetch('/api/thresholds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  });

  // Realtime
  socket.on('sensor:new', (row) => {
    labels.push(fmt(row.created_at));
    temps.push(Number(row.temperature));
    hums.push(Number(row.humidity));
    if (labels.length > 120) { labels.shift(); temps.shift(); hums.shift(); }
    chart.update();
    updateCurrent(row);
  });

  socket.on('control:update', (state) => {
    elFan.checked = !!state.fan;
    elHumidifier.checked = !!state.humidifier;
    elLed.checked = !!state.led;
    elBuzzer.checked = !!state.buzzer;
  });

  socket.on('threshold:update', (thr) => {
    elThrTemp.value = Number(thr.temp_high);
    elThrHum.value = Number(thr.hum_low);
  });

  await loadInitial();
})();
