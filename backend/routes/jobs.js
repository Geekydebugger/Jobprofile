const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const axios = require('axios');

// GET ALL JOBS (internal + external)
router.get('/', async (req, res) => {
  try {
    // Get internal jobs from MySQL
    const [internalJobs] = await db.query(
      `SELECT jobs.*, users.name as recruiter_name 
       FROM jobs 
       LEFT JOIN users ON jobs.recruiter_id = users.id 
       ORDER BY jobs.created_at DESC`
    );

    // Get external jobs from Remotive API (free, no key needed)
    let externalJobs = [];
    try {
      const response = await axios.get('https://remotive.com/api/remote-jobs?limit=20');
      externalJobs = response.data.jobs.map(job => ({
        id: 'ext_' + job.id,
        title: job.title,
        company: job.company_name,
        location: job.candidate_required_location || 'Remote',
        salary: job.salary || 'Not specified',
        type: 'remote',
        skills: job.tags ? job.tags.join(', ') : '',
        description: job.description?.replace(/<[^>]*>/g, '').slice(0, 200) + '...',
        source: 'remotive',
        url: job.url
      }));
    } catch (apiErr) {
      console.log('External API unavailable, showing internal jobs only');
    }

    res.json({ internal: internalJobs, external: externalJobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST A JOB (recruiters only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ message: 'Only recruiters can post jobs' });
    }

    const { title, company, location, salary, type, skills, description } = req.body;

    await db.query(
      `INSERT INTO jobs (title, company, location, salary, type, skills, description, recruiter_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, company, location, salary, type, skills, description, req.user.id]
    );

    res.status(201).json({ message: 'Job posted successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE A JOB (recruiter only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ message: 'Only recruiters can delete jobs' });
    }

    await db.query('DELETE FROM jobs WHERE id = ? AND recruiter_id = ?', 
      [req.params.id, req.user.id]
    );

    res.json({ message: 'Job deleted successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;