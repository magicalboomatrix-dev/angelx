const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const sellController = require('../controllers/sell.controller');

// POST /api/admin/selling-request
router.post('/admin/selling-request', authMiddleware, sellController.createSellRequest);

// POST /api/sell-usdt — withdraw to crypto wallet
router.post('/sell-usdt', authMiddleware, sellController.sellUsdt);

module.exports = router;
