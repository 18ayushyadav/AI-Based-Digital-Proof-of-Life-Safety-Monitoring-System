const express = require('express');
const router = express.Router();
const verifyController = require('../controllers/verifyController');
const auth = require('../middleware/authMiddleware');

// Protect this route with JWT auth middleware
router.post('/', auth, verifyController.processVerification);

module.exports = router;
