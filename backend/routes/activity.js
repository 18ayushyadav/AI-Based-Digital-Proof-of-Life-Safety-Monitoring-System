const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const auth = require('../middleware/authMiddleware');

// Protect routes with JWT auth middleware
router.post('/ping', auth, activityController.ping);
router.get('/status', auth, activityController.getStatus);
router.get('/alerts', auth, activityController.getAlerts);
router.put('/alerts/:id/read', auth, activityController.markAlertRead);

module.exports = router;
