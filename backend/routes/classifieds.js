const express = require('express');
const router = express.Router();
const db = require('../db');

// List classified advertisements and discount offers
router.get('/', async (req, res) => {
  const { category, location } = req.query;
  let query = 'SELECT * FROM classified_advertisements WHERE 1=1';
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

// Create classified advertisement or offer
router.post('/', async (req, res) => {
  const { title, category, priceDetail, location, contactInfo, description, userId } = req.body;

  if (!title || !category || !priceDetail || !location || !contactInfo || !description) {
    return res.status(400).json({ message: 'Required fields are missing' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO classified_advertisements (title, category, price_detail, location, contact_info, description, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, category, priceDetail, location, contactInfo, description, userId || null]
    );

    res.status(201).json({
      message: 'Classified ad created successfully',
      adId: result.insertId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
