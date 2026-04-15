const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const historyController = require('../controllers/history.controller');

// GET /api/history — all transaction history
router.get('/history', authMiddleware, historyController.getAllHistory);

// GET /api/statements — statement ledger
router.get('/statements', authMiddleware, historyController.getStatements);

module.exports = router;
