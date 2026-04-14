const User = require('../models/User');
const SuspiciousLog = require('../models/SuspiciousLog');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Configure your SMTP transporter for nodemailer
// Replace with your real credentials or use App Passwords for Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    res.status(201).json({ msg: 'User registered successfully. Please login.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Log suspicious activity if wrong password multiple times (optional enhancement)
      await SuspiciousLog.create({
        ipAddress: req.ip,
        endpoint: '/api/auth/login',
        reason: 'Failed login attempt',
        userId: user._id
      });
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Generate OTP
    const otpCode = crypto.randomInt(100000, 999999).toString();
    user.otp = {
      code: otpCode,
      expiresAt: new Date(Date.now() + 10 * 60000) // 10 minutes
    };
    await user.save();

    // Send OTP via Email
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: user.email,
      subject: 'Your Safety Monitoring System OTP',
      text: `Your OTP is ${otpCode}. It is valid for 10 minutes.`
    };

    // In a real environment, uncomment to actually send:
    /*
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
    */
    console.log(`[SIMULATION] Sending OTP ${otpCode} to ${user.email}`);

    // In simulation mode, we return the OTP in the response for easy testing.
    // In production, remove the 'otp' field from this response!
    res.json({ msg: 'OTP sent to your email. Please verify.', email: user.email, otp: otpCode });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    let user = await User.findOne({ email });
    if (!user || !user.otp || !user.otp.code) {
      return res.status(400).json({ msg: 'Invalid request' });
    }

    if (user.otp.expiresAt < new Date()) {
       return res.status(400).json({ msg: 'OTP expired' });
    }

    if (user.otp.code !== otp) {
       await SuspiciousLog.create({
         ipAddress: req.ip,
         endpoint: '/api/auth/verify-otp',
         reason: 'Failed OTP attempt',
         userId: user._id
       });
       return res.status(400).json({ msg: 'Invalid OTP' });
    }

    // Clear OTP and set verified
    user.otp = undefined;
    user.verified = true;
    user.lastCheck = new Date();
    await user.save();

    // Generate JWT
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, verified: user.verified, lastCheck: user.lastCheck } });
      }
    );

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
