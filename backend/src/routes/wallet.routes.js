const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const walletController = require('../controllers/wallet.controller');

const walletRouter = express.Router();
const cryptoWalletsRouter = express.Router();

// GET /api/wallet
walletRouter.get('/', authMiddleware, walletController.getWallet);

// GET /api/crypto-wallets
cryptoWalletsRouter.get('/', authMiddleware, walletController.getCryptoWallets);
// POST /api/crypto-wallets
cryptoWalletsRouter.post('/', authMiddleware, walletController.addCryptoWallet);
// DELETE /api/crypto-wallets/:id
cryptoWalletsRouter.delete('/:id', authMiddleware, walletController.deleteCryptoWallet);

module.exports = { walletRouter, cryptoWalletsRouter };
