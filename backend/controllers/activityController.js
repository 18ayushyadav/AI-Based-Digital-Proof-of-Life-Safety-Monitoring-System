const User = require('../models/User');
const Alert = require('../models/Alert');

// Ping endpoint: Update last active time
exports.ping = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { lastCheck: new Date() });
    res.json({ msg: 'Activity recorded', timestamp: new Date() });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get current status
exports.getStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -otp');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Check for any unread alerts
    const unreadAlerts = await Alert.find({ userId: req.user.id, isRead: false }).sort({ createdAt: -1 });

    let status = 'Active';
    // If not checked in in 5 minutes, consider inactive (warning state)
    const INACTIVITY_THRESHOLD = 5 * 60 * 1000; // 5 mins
    if (user.lastCheck && (Date.now() - new Date(user.lastCheck).getTime() > INACTIVITY_THRESHOLD)) {
       status = 'Inactive Warning';
    }
    if (unreadAlerts.length > 0) {
       status = 'Critical Alerts Active';
    }

    res.json({
      user,
      systemStatus: status,
      unreadAlerts
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get all alerts history
exports.getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Mark alert as read
exports.markAlertRead = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    
    if (!alert) {
      return res.status(404).json({ msg: 'Alert not found' });
    }

    if (alert.userId.toString() !== req.user.id) {
       return res.status(401).json({ msg: 'Not authorized' });
    }

    alert.isRead = true;
    await alert.save();

    res.json({ msg: 'Alert marked as read' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
