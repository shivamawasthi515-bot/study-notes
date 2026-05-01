const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const Note = require('../models/Note');
const Subject = require('../models/Subject');
const User = require('../models/User');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { message: 'Too many requests, please try again later.' }
});

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/notes');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents are allowed'));
    }
  }
});

// GET /api/notes/:id/download - download note (check access)
router.get('/:id/download', writeLimiter, auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid note ID' });
    }
    const note = await Note.findById(req.params.id).populate('subject');
    if (!note) return res.status(404).json({ message: 'Note not found' });

    const subject = note.subject;
    const user = req.user;

    const hasAccess =
      subject.accessType === 'free' ||
      user.role === 'admin' ||
      user.purchasedSubjects.map(id => id.toString()).includes(subject._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: 'Purchase this subject to access the note' });
    }

    const filePath = path.join(__dirname, '..', note.filePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    res.download(filePath, `${note.title}${path.extname(note.filePath)}`);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/notes - upload note (admin)
router.post('/', writeLimiter, auth, adminAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'File is required' });

    const { title, description, subjectId } = req.body;
    if (!subjectId || !mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({ message: 'Valid Subject ID is required' });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    const filePath = `uploads/notes/${req.file.filename}`;
    const note = await Note.create({
      title,
      description: description || '',
      filePath,
      fileType: req.file.mimetype,
      subject: subjectId
    });

    // Add note to subject
    subject.notes.push(note._id);
    await subject.save();

    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/notes/:id - delete note (admin)
router.delete('/:id', writeLimiter, auth, adminAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid note ID' });
    }
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    // Remove file from disk
    const filePath = path.join(__dirname, '..', note.filePath);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    // Remove from subject
    await Subject.findByIdAndUpdate(note.subject, { $pull: { notes: note._id } });

    await note.deleteOne();
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
