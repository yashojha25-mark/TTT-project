
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import chatRoutes from './routes/chatRoutes.js';

const PORT = process.env.PORT || 5000;
const DEFAULT_ALLOWED_ORIGINS = ['http://localhost:5173', 'http://localhost:4173'];
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    const originAllowed =
      allowedOrigins.length === 0
        ? DEFAULT_ALLOWED_ORIGINS.includes(origin)
        : allowedOrigins.includes(origin);

    if (originAllowed) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
};

const requestCounts = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX || 30);

function rateLimit(req, res, next) {
  const now = Date.now();
  const key = req.ip || req.socket.remoteAddress || 'unknown';
  const current = requestCounts.get(key);

  if (!current || now > current.resetAt) {
    requestCounts.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  current.count += 1;

  if (current.count > RATE_LIMIT_MAX) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please wait a minute and try again.',
    });
  }

  return next();
}

if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_api_key_here') {
  console.warn(
    '⚠️  GEMINI_API_KEY is not set.\n' +
      '    Create backend/.env (copy backend/.env.example) and paste a real key.\n' +
      '    Get one at https://aistudio.google.com/app/apikey\n' +
      '    The server will still run, but /api/chat will fail in STEP 5.'
  );
}

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

app.use(cors(corsOptions));
app.use(express.json({ limit: '32kb' }));

app.use('/api/chat', rateLimit, chatRoutes);

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
  console.error('[server error]', {
    message: err.message,
    path: req.originalUrl,
    method: req.method,
  });

  if (err.message?.startsWith('CORS blocked origin:')) {
    return res.status(403).json({
      success: false,
      message: 'This origin is not allowed to access the API.',
    });
  }

  if (err.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON in request body.',
    });
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Request body is too large.',
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
