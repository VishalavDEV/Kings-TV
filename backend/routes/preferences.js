const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, async (req, res) => {
  const userId = req.user.userId;

  try {
    const [preferences] = await db.query('SELECT * FROM user_preferences WHERE user_id = ?', [userId]);
    const [visibility] = await db.query('SELECT section_id, is_visible FROM user_section_visibility WHERE user_id = ?', [userId]);

    const sections = {};
    visibility.forEach(v => {
      sections[v.section_id] = !!v.is_visible;
    });

    if (preferences.length === 0) {
      return res.status(200).json({
        theme: 'light',
        primaryColor: '#0057FF',
        fontSize: 'medium',
        widgetWidth: 640,
        slideSpeed: 8,
        language: 'ta',
        defaultDistrictId: null,
        sections: sections
      });
    }

    const pref = preferences[0];
    res.status(200).json({
      theme: pref.theme,
      primaryColor: pref.primary_color,
      fontSize: pref.font_size,
      widgetWidth: pref.widget_width,
      slideSpeed: pref.slide_speed,
      language: pref.language,
      defaultDistrictId: pref.default_district_id,
      sections: sections
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const { theme, primaryColor, fontSize, widgetWidth, slideSpeed, language, defaultDistrictId, sections } = req.body;

  try {
    const [existing] = await db.query('SELECT * FROM user_preferences WHERE user_id = ?', [userId]);
    if (existing.length === 0) {
      await db.query(
        'INSERT INTO user_preferences (user_id, theme, primary_color, font_size, widget_width, slide_speed, language, default_district_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, theme || 'light', primaryColor || '#0057FF', fontSize || 'medium', widgetWidth || 640, slideSpeed || 8, language || 'ta', defaultDistrictId || null]
      );
    } else {
      await db.query(
        'UPDATE user_preferences SET theme = ?, primary_color = ?, font_size = ?, widget_width = ?, slide_speed = ?, language = ?, default_district_id = ? WHERE user_id = ?',
        [theme || 'light', primaryColor || '#0057FF', fontSize || 'medium', widgetWidth || 640, slideSpeed || 8, language || 'ta', defaultDistrictId || null, userId]
      );
    }

    if (sections) {
      for (const sectionId in sections) {
        if (sections.hasOwnProperty(sectionId)) {
          const isVisible = sections[sectionId] ? 1 : 0;
          const [exists] = await db.query('SELECT * FROM user_section_visibility WHERE user_id = ? AND section_id = ?', [userId, sectionId]);
          if (exists.length === 0) {
            await db.query(
              'INSERT INTO user_section_visibility (user_id, section_id, is_visible) VALUES (?, ?, ?)',
              [userId, sectionId, isVisible]
            );
          } else {
            await db.query(
              'UPDATE user_section_visibility SET is_visible = ? WHERE user_id = ? AND section_id = ?',
              [isVisible, userId, sectionId]
            );
          }
        }
      }
    }

    res.status(200).json({ message: 'Preferences updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
