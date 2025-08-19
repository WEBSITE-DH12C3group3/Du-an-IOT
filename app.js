const path = require('path');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const apiRoutes = require('./src/routes/api');
const webRoutes = require('./src/routes/web');

const app = express();

// Security & parsers
app.use(helmet());
app.use(rateLimit({ windowMs: 30 * 1000, max: 200 }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static + Views
app.use('/public', express.static(path.join(__dirname, 'src', 'public')));
app.set('views', path.join(__dirname, 'src', 'views'));
app.set('view engine', 'ejs');

// Routes
app.use('/api', apiRoutes);
app.use('/', webRoutes);

module.exports = app;
