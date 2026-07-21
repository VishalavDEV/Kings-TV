import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import newsRoutes from './src/routes/news.js';
import authRoutes from './src/routes/auth.js';
import pushRoutes from './src/routes/push.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8081;

app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    service: 'Kings TV Mobile Backend Microservice API',
    timestamp: new Date().toISOString()
  });
});

// Mobile API Routes
app.use('/api/mobile/news', newsRoutes);
app.use('/api/mobile/auth', authRoutes);
app.use('/api/mobile/push', pushRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Kings TV Mobile Backend API server running on http://localhost:${PORT}`);
});
