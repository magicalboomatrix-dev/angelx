const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const bankController = require('../controllers/bank.controller');

router.get('/', authMiddleware, bankController.getBankCards);
router.post('/', authMiddleware, bankController.addBankCard);
router.delete('/', authMiddleware, bankController.deleteBankCard);

module.exports = router;
