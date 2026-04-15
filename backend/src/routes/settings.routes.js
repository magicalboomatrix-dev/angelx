const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');

// GET /api/limits — public
router.get('/limits', settingsController.getLimits);

module.exports = router;
