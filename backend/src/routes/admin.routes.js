const express = require('express');
const router = express.Router();
const { adminMiddleware } = require('../middleware/auth');
const adminController = require('../controllers/admin.controller');

// Dashboard stats & charts
router.get('/stats', adminMiddleware, adminController.getStats);
router.get('/chart-data', adminMiddleware, adminController.getChartData);

// Users management
router.get('/users', adminMiddleware, adminController.getUsers);
router.get('/users/:id', adminMiddleware, adminController.getUserById);
router.post('/users/:id/wallet-adjustments', adminMiddleware, adminController.adjustUserWallet);

// Deposits management
router.get('/deposits', adminMiddleware, adminController.getDeposits);
router.get('/deposits/:id', adminMiddleware, adminController.getDepositById);
router.put('/deposits/:id/approve', adminMiddleware, adminController.approveDeposit);
router.put('/deposits/:id/reject', adminMiddleware, adminController.rejectDeposit);

// Sells management
router.get('/sells', adminMiddleware, adminController.getSells);
router.get('/sells/:id', adminMiddleware, adminController.getSellById);
router.put('/sells/:id/approve', adminMiddleware, adminController.approveSell);
router.put('/sells/:id/reject', adminMiddleware, adminController.rejectSell);

// Withdrawals management
router.get('/withdrawals', adminMiddleware, adminController.getWithdrawals);
router.get('/withdrawals/:id', adminMiddleware, adminController.getWithdrawalById);
router.put('/withdrawals/:id/approve', adminMiddleware, adminController.approveWithdrawal);
router.put('/withdrawals/:id/reject', adminMiddleware, adminController.rejectWithdrawal);

// Referrals
router.get('/referrals', adminMiddleware, adminController.getReferrals);

// System settings
router.get('/settings', adminMiddleware, adminController.getSettings);
router.put('/settings', adminMiddleware, adminController.updateSettings);

// Audit logs
router.get('/audit-logs', adminMiddleware, adminController.getAuditLogs);

module.exports = router;
