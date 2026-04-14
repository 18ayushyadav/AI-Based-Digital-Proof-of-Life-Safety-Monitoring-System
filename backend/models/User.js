const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  lastCheck: {
    type: Date,
  },
  otp: {
    code: String,
    expiresAt: Date,
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
