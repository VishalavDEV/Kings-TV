const express = require('express');
const router = express.Router();
const db = require('../db');

// List job openings
router.get('/', async (req, res) => {
  const { category, location } = req.query;
  let query = 'SELECT * FROM jobs_board WHERE 1=1';
  const params = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  if (location) {
    query += ' AND location = ?';
    params.push(location);
  }

  query += ' ORDER BY created_at DESC';

  try {
    const [rows] = await db.query(query, params);
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create job vacancy listing
router.post('/', async (req, res) => {
  const { title, companyName, category, location, salaryRange, employmentType, description, userId } = req.body;

  if (!title || !companyName || !category || !location || !salaryRange || !description) {
    return res.status(400).json({ message: 'Required fields are missing' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO jobs_board (title, company_name, category, location, salary_range, employment_type, description, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, companyName, category, location, salaryRange, employmentType || 'Full Time', description, userId || null]
    );

    res.status(201).json({
      message: 'Job posting created successfully',
      jobId: result.insertId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Submit job application for a listing
router.post('/:id/apply', async (req, res) => {
  const jobId = req.params.id;
  const { applicantName, applicantPhone, experience, summary } = req.body;

  if (!applicantName || !applicantPhone || !experience) {
    return res.status(400).json({ message: 'Required application fields are missing' });
  }

  try {
    // Check if job exists
    const [job] = await db.query('SELECT * FROM jobs_board WHERE job_id = ?', [jobId]);
    if (job.length === 0) {
      return res.status(404).json({ message: 'Job vacancy not found' });
    }

    const [result] = await db.query(
      'INSERT INTO job_applications (job_id, applicant_name, applicant_phone, experience, summary) VALUES (?, ?, ?, ?, ?)',
      [jobId, applicantName, applicantPhone, experience, summary || null]
    );

    res.status(201).json({
      message: 'Job application submitted successfully',
      applicationId: result.insertId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
