const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/refresh', authController.refreshAccessToken);
router.post('/logout', authController.logout);
router.get('/me', require('../middleware/auth').authMiddleware, authController.getMe);
router.get('/referral-rewards', require('../middleware/auth').authMiddleware, authController.getReferralRewards);

// Admin login
router.post('/admin/login', authController.adminLogin);

module.exports = router;
