const ProofOfLife = require('../models/ProofOfLife');
const SuspiciousLog = require('../models/SuspiciousLog');
const User = require('../models/User');
const Alert = require('../models/Alert');

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
    // HYBRID VERIFICATION
    // ---------------------------------------------------------
    let aiResultStatus;
    
    // If the frontend AI specifically declared no face was found:
    if (payload === 'NO_FACE_DETECTED' || payload === 'NO_BLINK_DETECTED' || payload === 'NO_VOICE_DETECTED') {
        aiResultStatus = 'fake';
    } else if ((method === 'face-scan' || method === 'blink-detection') && payload.startsWith('data:image')) {
        // If it sends actual image data and didn't fail frontend detection, it passed!
        aiResultStatus = 'alive';
    } else if (method === 'voice-scan' && payload === 'VOICE_VERIFIED') {
        aiResultStatus = 'alive';
    } else {
        // For other methods, fallback to simulation
        const randomChance = Math.random();
        aiResultStatus = randomChance > 0.1 ? 'alive' : 'fake'; 
    }
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
      
      await Alert.create({
        userId: req.user.id,
        type: 'Suspicious Activity',
        message: `Failed AI Verification (${method}).`
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
