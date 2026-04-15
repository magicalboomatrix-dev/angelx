const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const depositController = require('../controllers/deposit.controller');

// POST /api/admin/deposit — user submits deposit
router.post('/admin/deposit', authMiddleware, depositController.createDeposit);

// GET /api/deposit-history
router.get('/deposit-history', authMiddleware, depositController.getDepositHistory);

// GET /api/deposit-info — public
router.get('/deposit-info', depositController.getDepositInfo);

module.exports = router;
