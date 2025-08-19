const { sendEmail } = require('../utils/mailer');
const { sendTelegram } = require('../utils/telegram');

async function pushAlert(type, value, threshold) {
  const text =
    type === 'TEMP_HIGH'
      ? `⚠️ Nhiệt độ cao: ${value}°C (ngưỡng ${threshold}°C)`
      : `⚠️ Độ ẩm thấp: ${value}% (ngưỡng ${threshold}%)`;

  await Promise.allSettled([sendEmail(`[IoT] Cảnh báo ${type}`, text), sendTelegram(text)]);
}

module.exports = { pushAlert };
