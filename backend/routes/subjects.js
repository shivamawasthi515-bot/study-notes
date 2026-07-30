const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const Subject = require('../models/Subject');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { message: 'Too many requests, please try again later.' }
});

// GET /api/subjects - list all subjects
router.get('/', async (req, res) => {
  try {
    const subjects = await Subject.find().select('-notes -videos').sort({ createdAt: -1 });
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/subjects/:id - single subject
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid subject ID' });
    }
    const subject = await Subject.findById(req.params.id)
      .populate('notes')
      .populate('videos');

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Check if user has access
    let hasAccess = subject.accessType === 'free';

    if (!hasAccess) {
      // Check auth header without blocking
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const jwt = require('jsonwebtoken');
          if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured');
          const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
          const User = require('../models/User');
          const user = await User.findById(decoded.id);
          if (user && (user.role === 'admin' || user.purchasedSubjects.map(id => id.toString()).includes(subject._id.toString()))) {
            hasAccess = true;
          }
        } catch (_) {
          // invalid token, no access
        }
      }
    }

    const subjectData = subject.toObject();
    if (!hasAccess) {
      subjectData.notes = [];
      subjectData.videos = [];
      subjectData.locked = true;
    } else {
      subjectData.locked = false;
    }

    res.json(subjectData);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/subjects - create subject (admin)
router.post('/', writeLimiter, auth, adminAuth, async (req, res) => {
  try {
    const { title, description, accessType, price, thumbnail } = req.body;
    const subject = await Subject.create({
      title: String(title || ''),
      description: String(description || ''),
      accessType: ['free', 'paid'].includes(accessType) ? accessType : 'free',
      price: Number(price) || 0,
      thumbnail: String(thumbnail || '')
    });
    res.status(201).json(subject);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/subjects/:id - update subject (admin)
router.put('/:id', writeLimiter, auth, adminAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid subject ID' });
    }
    const { title, description, accessType, price, thumbnail } = req.body;
    const update = {
      title: String(title || ''),
      description: String(description || ''),
      accessType: ['free', 'paid'].includes(accessType) ? accessType : 'free',
      price: Number(price) || 0,
      thumbnail: String(thumbnail || '')
    };
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    );
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    res.json(subject);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/subjects/:id - delete subject (admin)
router.delete('/:id', writeLimiter, auth, adminAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid subject ID' });
    }
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    res.json({ message: 'Subject deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
