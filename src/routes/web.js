const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('dashboard', { title: 'IoT DHT11 Dashboard' });
});

router.get('/login', (req, res) => {
  res.render('login', { title: 'Đăng nhập' });
});

module.exports = router;
