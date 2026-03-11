const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files allowed'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// SUBMIT APPLICATION with resume
router.post('/', auth, upload.single('resume'), async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can apply' });
    }

    const { job_id, name, email, phone, portfolio, cover_letter } = req.body;
    const resume_url = req.file ? `/uploads/${req.file.filename}` : null;

    // Check if already applied
    const [existing] = await db.query(
      'SELECT * FROM applications WHERE job_id = ? AND student_id = ?',
      [job_id, req.user.id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'You already applied for this job' });
    }

    await db.query(
      `INSERT INTO applications 
       (job_id, student_id, name, email, phone, portfolio, cover_letter, resume_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [job_id, req.user.id, name, email, phone, portfolio, cover_letter, resume_url]
    );

    res.status(201).json({ message: 'Application submitted successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// GET APPLICATIONS FOR A JOB (recruiters only)
router.get('/job/:jobId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const [apps] = await db.query(
      `SELECT applications.*, users.name as student_name 
       FROM applications 
       LEFT JOIN users ON applications.student_id = users.id 
       WHERE applications.job_id = ?`,
      [req.params.jobId]
    );

    res.json(apps);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET MY APPLICATIONS (students only)
router.get('/mine', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const [apps] = await db.query(
      `SELECT applications.*, jobs.title as job_title, jobs.company 
       FROM applications 
       LEFT JOIN jobs ON applications.job_id = jobs.id 
       WHERE applications.student_id = ?`,
      [req.user.id]
    );

    res.json(apps);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;