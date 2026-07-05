const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*'
}));

app.use(express.json());

const authRouter = require('./routes/auth');
const preferencesRouter = require('./routes/preferences');
const articlesRouter = require('./routes/articles');
const videosRouter = require('./routes/videos');
const directoryRouter = require('./routes/directory');
const wishesRouter = require('./routes/wishes');
const obituariesRouter = require('./routes/obituaries');

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users/preferences', preferencesRouter);
app.use('/api/v1/articles', articlesRouter);
app.use('/api/v1/videos', videosRouter);
app.use('/api/v1/directory', directoryRouter);
app.use('/api/v1/wishes', wishesRouter);
app.use('/api/v1/obituaries', obituariesRouter);

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server!' });
});

app.listen(PORT, () => {
  console.log(`[Kings TV Backend] Server is running on port ${PORT}`);
});
