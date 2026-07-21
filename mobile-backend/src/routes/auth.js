import express from 'express';

const router = express.Router();

// Mobile Device Quick Login / Register
router.post('/login', (req, res) => {
  const { email, deviceId } = req.body;
  res.json({
    success: true,
    token: "mobile_jwt_token_demo_12345",
    user: {
      email: email || "mobile_user@kingstv.com",
      role: "MOBILE_USER",
      deviceId: deviceId || "device_abc"
    }
  });
});

export default router;
