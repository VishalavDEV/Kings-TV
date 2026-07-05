const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const [videos] = await db.query(
      'SELECT v.*, c.slug as category_slug FROM video_contents v JOIN news_categories c ON v.category_id = c.category_id WHERE v.is_live_tv = 0 ORDER BY v.published_at DESC'
    );
    res.status(200).json(videos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/live', async (req, res) => {
  try {
    const [live] = await db.query('SELECT * FROM video_contents WHERE is_live_tv = 1 LIMIT 1');
    if (live.length === 0) {
      return res.status(404).json({ message: 'Live TV feed not configured' });
    }
    res.status(200).json(live[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/:id/progress', authMiddleware, async (req, res) => {
  const videoId = req.params.id;
  const userId = req.user.userId;
  const { watchedSeconds, isCompleted } = req.body;

  try {
    const [existing] = await db.query(
      'SELECT * FROM user_viewing_history WHERE user_id = ? AND video_id = ?',
      [userId, videoId]
    );

    if (existing.length === 0) {
      await db.query(
        'INSERT INTO user_viewing_history (user_id, video_id, watched_duration_seconds, is_completed) VALUES (?, ?, ?, ?)',
        [userId, videoId, watchedSeconds || 0, isCompleted ? 1 : 0]
      );
    } else {
      await db.query(
        'UPDATE user_viewing_history SET watched_duration_seconds = ?, is_completed = ? WHERE user_id = ? AND video_id = ?',
        [watchedSeconds || 0, isCompleted ? 1 : 0, userId, videoId]
      );
    }

    res.status(200).json({ message: 'Progress saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
