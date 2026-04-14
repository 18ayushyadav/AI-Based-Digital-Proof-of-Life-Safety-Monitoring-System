const mongoose = require('mongoose');

const suspiciousLogSchema = new mongoose.Schema({
  ipAddress: {
    type: String,
    required: true,
  },
  endpoint: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('SuspiciousLog', suspiciousLogSchema);
