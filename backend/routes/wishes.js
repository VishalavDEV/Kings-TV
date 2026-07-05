const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  const { category } = req.query;
  let query = 'SELECT * FROM local_wishes WHERE 1=1';
  const params = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
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

router.post('/', async (req, res) => {
  const { recipientName, category, message, senderName, userId } = req.body;

  if (!recipientName || !category || !message || !senderName) {
    return res.status(400).json({ message: 'Required fields are missing' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO local_wishes (recipient_name, category, message, sender_name, created_by) VALUES (?, ?, ?, ?, ?)',
      [recipientName, category, message, senderName, userId || null]
    );

    res.status(201).json({
      message: 'Greeting wish card created successfully',
      wishId: result.insertId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
