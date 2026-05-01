const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const Video = require('../models/Video');
const Subject = require('../models/Subject');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { message: 'Too many requests, please try again later.' }
});

// Extract YouTube video ID from URL (strict 11-char alphanumeric ID)
const extractYoutubeId = (url) => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// GET /api/videos/:id - get video (check access)
router.get('/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).populate('subject');
    if (!video) return res.status(404).json({ message: 'Video not found' });

    const subject = video.subject;
    let hasAccess = subject.accessType === 'free';

    if (!hasAccess) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const jwt = require('jsonwebtoken');
          const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET || 'fallback_secret');
          const User = require('../models/User');
          const user = await User.findById(decoded.id);
          if (user && (user.role === 'admin' || user.purchasedSubjects.map(id => id.toString()).includes(subject._id.toString()))) {
            hasAccess = true;
          }
        } catch (_) {}
      }
    }

    if (!hasAccess) {
      return res.status(403).json({ message: 'Purchase this subject to access this video' });
    }

    res.json(video);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/videos - add video (admin)
router.post('/', writeLimiter, auth, adminAuth, async (req, res) => {
  try {
    const { title, description, youtubeUrl, subjectId } = req.body;
    if (!youtubeUrl || !subjectId || !title) {
      return res.status(400).json({ message: 'Title, YouTube URL and Subject ID are required' });
    }
    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({ message: 'Invalid subject ID' });
    }

    const youtubeVideoId = extractYoutubeId(youtubeUrl);
    if (!youtubeVideoId) {
      return res.status(400).json({ message: 'Invalid YouTube URL' });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    const video = await Video.create({
      title,
      description: description || '',
      youtubeUrl,
      youtubeVideoId,
      subject: subjectId
    });

    subject.videos.push(video._id);
    await subject.save();

    res.status(201).json(video);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/videos/:id - delete video (admin)
router.delete('/:id', writeLimiter, auth, adminAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid video ID' });
    }
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    await Subject.findByIdAndUpdate(video.subject, { $pull: { videos: video._id } });
    await video.deleteOne();

    res.json({ message: 'Video deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
