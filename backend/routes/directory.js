const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  const { category, location, search } = req.query;
  let query = 'SELECT * FROM local_business_directory WHERE 1=1';
  const params = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  if (location) {
    query += ' AND address_locality = ?';
    params.push(location);
  }
  if (search) {
    query += ' AND (business_name LIKE ? OR address_street LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
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
  const { businessName, category, addressLocality, addressStreet, workingHours, phoneNumber, userId } = req.body;

  if (!businessName || !category || !addressLocality || !addressStreet || !phoneNumber) {
    return res.status(400).json({ message: 'Required fields are missing' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO local_business_directory (business_name, category, address_locality, address_street, working_hours, phone_number, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [businessName, category, addressLocality, addressStreet, workingHours || null, phoneNumber, userId || null]
    );

    res.status(201).json({
      message: 'Business listing added successfully',
      listingId: result.insertId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
