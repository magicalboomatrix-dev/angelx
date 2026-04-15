const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);
router.get('/me', require('../middleware/auth').authMiddleware, authController.getMe);

// Admin login
router.post('/admin/login', authController.adminLogin);

module.exports = router;
