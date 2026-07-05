const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM local_obituaries ORDER BY demise_date DESC, created_at DESC');
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  const { deceasedName, age, location, demiseDate, funeralDetails, shortDescription, userId } = req.body;

  if (!deceasedName || !age || !location || !demiseDate || !funeralDetails || !shortDescription) {
    return res.status(400).json({ message: 'Required fields are missing' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO local_obituaries (deceased_name, age, location, demise_date, funeral_details, short_description, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [deceasedName, age, location, demiseDate, funeralDetails, shortDescription, userId || null]
    );

    res.status(201).json({
      message: 'Obituary notice added successfully',
      obitId: result.insertId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
