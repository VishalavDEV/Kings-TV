const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  const { category, district, status } = req.query;
  let query = 'SELECT a.*, c.slug as category_slug, c.name_ta as category_name_ta, d.name_ta as district_name_ta FROM articles a JOIN news_categories c ON a.category_id = c.category_id LEFT JOIN districts d ON a.district_id = d.district_id WHERE a.status = ?';
  const params = [status || 'published'];

  if (category) {
    query += ' AND c.slug = ?';
    params.push(category);
  }
  if (district) {
    query += ' AND (d.name_ta = ? OR d.name_en = ?)';
    params.push(district, district);
  }

  query += ' ORDER BY a.published_at DESC';

  try {
    const [rows] = await db.query(query, params);
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  const articleId = req.params.id;

  try {
    const [rows] = await db.query(
      'SELECT a.*, c.slug as category_slug, c.name_ta as category_name_ta, d.name_ta as district_name_ta FROM articles a JOIN news_categories c ON a.category_id = c.category_id LEFT JOIN districts d ON a.district_id = d.district_id WHERE a.article_id = ?',
      [articleId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Article not found' });
    }

    db.query('UPDATE articles SET views_count = views_count + 1 WHERE article_id = ?', [articleId]).catch(console.error);

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id/comments', async (req, res) => {
  const articleId = req.params.id;

  try {
    const [comments] = await db.query(
      'SELECT comment_id, commentor_name, comment_text, created_at FROM comments WHERE article_id = ? AND status = "approved" ORDER BY created_at DESC',
      [articleId]
    );
    res.status(200).json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/:id/comments', async (req, res) => {
  const articleId = req.params.id;
  const { commentorName, commentorEmail, commentText } = req.body;

  if (!commentorName || !commentorEmail || !commentText) {
    return res.status(400).json({ message: 'Name, email and comment content are required' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO comments (article_id, commentor_name, commentor_email, comment_text, status) VALUES (?, ?, ?, ?, "approved")',
      [articleId, commentorName, commentorEmail, commentText]
    );

    res.status(201).json({
      message: 'Comment added successfully',
      commentId: result.insertId,
      status: 'approved'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
