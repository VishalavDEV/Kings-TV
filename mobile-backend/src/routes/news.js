import express from 'express';

const router = express.Router();

// Get Mobile News Feed
router.get('/feed', (req, res) => {
  res.json({
    success: true,
    page: 1,
    items: [
      {
        id: 101,
        titleTa: "தமிழக பட்ஜெட் 2026: புதிய திட்டங்கள் மற்றும் முக்கிய அறிவிப்புகள் வெளியீடு!",
        titleEn: "TN Budget 2026 Announcements",
        category: "அரசியல்",
        views: 12450,
        publishedAt: new Date().toISOString()
      },
      {
        id: 102,
        titleTa: "சென்னை வானிலை மையம் எச்சரிக்கை: 5 மாவட்டங்களில் கனமழைக்கு வாய்ப்பு!",
        titleEn: "Heavy Rainfall Alert in 5 Districts",
        category: "வானிலை",
        views: 8120,
        publishedAt: new Date().toISOString()
      }
    ]
  });
});

// Get Mobile Live TV Stream Config
router.get('/stream', (req, res) => {
  res.json({
    success: true,
    streamUrl: "https://live.kingstv.com/hls/stream.m3u8",
    title: "Kings TV 24x7 Live Stream",
    isLive: true
  });
});

export default router;
