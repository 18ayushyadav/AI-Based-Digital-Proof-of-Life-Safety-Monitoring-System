const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const rateLimit = require('express-rate-limit');

// Rate limiting for login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per `window` (here, per 15 minutes)
  message: { msg: 'Too many login attempts from this IP, please try again after 15 minutes' }
});

router.post('/signup', authController.signup);
router.post('/login', loginLimiter, authController.login);
router.post('/verify-otp', authController.verifyOtp);

module.exports = router;
