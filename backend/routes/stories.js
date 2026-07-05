const express = require('express');
const router = express.Router();
const db = require('../db');

// List curated case studies and submitted success stories
router.get('/', async (req, res) => {
  const { isCaseStudy } = req.query;
  let query = 'SELECT * FROM success_stories WHERE 1=1';
  const params = [];

  if (isCaseStudy !== undefined) {
    query += ' AND is_case_study = ?';
    params.push(isCaseStudy === 'true' ? 1 : 0);
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

// Create/Submit entrepreneur success story
router.post('/', async (req, res) => {
  const { authorName, businessName, title, details, isCaseStudy, pdfUrl, userId } = req.body;

  if (!authorName || !businessName || !title || !details) {
    return res.status(400).json({ message: 'Required fields are missing' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO success_stories (author_name, business_name, title, details, is_case_study, pdf_url, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [authorName, businessName, title, details, isCaseStudy ? 1 : 0, pdfUrl || null, userId || null]
    );

    res.status(201).json({
      message: 'Success story submitted successfully',
      storyId: result.insertId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
