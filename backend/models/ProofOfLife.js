const mongoose = require('mongoose');

const proofOfLifeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['alive', 'fake', 'error'],
    required: true,
  },
  method: {
    type: String,
    enum: ['face-scan', 'voice-scan', 'blink-detection', 'general-ai'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('ProofOfLife', proofOfLifeSchema);
