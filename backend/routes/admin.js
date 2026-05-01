const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Subject = require('../models/Subject');
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// GET /api/admin/dashboard - stats
router.get('/dashboard', auth, adminAuth, async (req, res) => {
  try {
    const [totalUsers, totalSubjects, payments] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Subject.countDocuments(),
      Payment.find({ status: 'completed' })
    ]);

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    res.json({
      totalUsers,
      totalSubjects,
      totalPayments: payments.length,
      totalRevenue
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
