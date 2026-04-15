const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const bankController = require('../controllers/bank.controller');

router.post('/', authMiddleware, bankController.selectBank);

module.exports = router;
