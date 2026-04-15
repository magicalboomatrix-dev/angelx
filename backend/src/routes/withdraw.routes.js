const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const withdrawController = require('../controllers/withdraw.controller');

// Withdraw handled via /api/sell-usdt in sell routes (crypto withdrawal)
// This is for future direct withdrawal endpoints if needed

module.exports = router;
