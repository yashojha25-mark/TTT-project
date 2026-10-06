
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import chatRoutes from './routes/chatRoutes.js';

const PORT = process.env.PORT || 5000;

if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_api_key_here') {
  console.warn(
    '⚠️  GEMINI_API_KEY is not set.\n' +
      '    Create backend/.env (copy backend/.env.example) and paste a real key.\n' +
      '    Get one at https://aistudio.google.com/app/apikey\n' +
      '    The server will still run, but /api/chat will fail in STEP 5.'
  );
}

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Omega AI backend is running 🚀',
    endpoints: {
      health: 'GET /api/health',
      chat: 'POST /api/chat',
    },
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((err, req, res, next) => {
  console.error('[server error]', err);

  if (err.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON in request body.',
    });
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});