const nodemailer = require('nodemailer');

const mailer = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT || 587),
  secure: String(process.env.MAIL_SECURE) === 'true',
  auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
});

async function sendEmail(subject, text) {
  if (!process.env.MAIL_USER || !process.env.MAIL_TO) return;
  await mailer.sendMail({
    from: `IoT Monitor <${process.env.MAIL_USER}>`,
    to: process.env.MAIL_TO,
    subject,
    text,
  });
}

module.exports = { sendEmail };
