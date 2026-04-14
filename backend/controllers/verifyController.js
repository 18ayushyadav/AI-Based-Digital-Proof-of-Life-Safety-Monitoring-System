const ProofOfLife = require('../models/ProofOfLife');
const SuspiciousLog = require('../models/SuspiciousLog');
const User = require('../models/User');

exports.processVerification = async (req, res) => {
  try {
    const { method, payload } = req.body; 
    // payload would contain base64 image/audio, but we simulate it for now.
    
    // Validate method
    const validMethods = ['face-scan', 'voice-scan', 'blink-detection', 'general-ai'];
    if (!validMethods.includes(method)) {
      return res.status(400).json({ msg: 'Invalid verification method' });
    }

    // ---------------------------------------------------------
    // SIMULATED AI VERIFICATION
    // ---------------------------------------------------------
    // In a real scenario, we'd send 'payload' to a Python microservice, OpenCV, or external API.
    // For simulation, we randomly determine if it's "alive" or "fake" (with high probability of alive).
    const randomChance = Math.random();
    let aiResultStatus = randomChance > 0.1 ? 'alive' : 'fake'; 
    // ---------------------------------------------------------

    // Save the ProofOfLife record
    const record = new ProofOfLife({
      userId: req.user.id,
      status: aiResultStatus,
      method: method
    });
    await record.save();

    // If deemed fake, log to suspicious logs
    if (aiResultStatus === 'fake') {
      await SuspiciousLog.create({
        ipAddress: req.ip,
        endpoint: '/api/verify',
        reason: `Fake detection during ${method}`,
        userId: req.user.id
      });
      return res.status(403).json({ 
        msg: 'Verification Failed. Suspicious activity detected.',
        result: 'fake'
      });
    }

    // Update user's last check timestamp
    await User.findByIdAndUpdate(req.user.id, { lastCheck: new Date() });

    res.json({
      msg: 'Verification Successful',
      result: 'real human',
      recordId: record._id
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
