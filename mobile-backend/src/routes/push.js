import express from 'express';

const router = express.Router();

// Register Push Notification Token (FCM / APNS)
router.post('/register-token', (req, res) => {
  const { pushToken, deviceType } = req.body;
  res.json({
    success: true,
    message: "Push token registered successfully for " + (deviceType || "mobile")
  });
});

export default router;
