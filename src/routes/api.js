const express = require('express');
const router = express.Router();
const { postData, getRecent, getLatest } = require('../controllers/dataController');
const {
  getControl,
  postControl,
  getThreshold,
  postThreshold
} = require('../controllers/controlController');

// Data
router.post('/data', postData);
router.get('/data', getRecent);
router.get('/data/latest', getLatest);

// Control
router.get('/control', getControl);
router.post('/control', postControl);

// Thresholds
router.get('/thresholds', getThreshold);
router.post('/thresholds', postThreshold);

module.exports = router;
