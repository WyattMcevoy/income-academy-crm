import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';
import leadsRouter from './routes/leads.js';
import clientsRouter from './routes/clients.js';
import expensesRouter from './routes/expenses.js';
import webhooksRouter from './routes/webhooks.js';
import intakeRouter from './routes/intake.js';
import creditBuilderRouter from './routes/credit-builder.js';
import adminRouter from './routes/admin.js';
import { requireAuth, requireAdmin } from './middleware/auth.js';
import { startPeriodicChecks } from './link-checker.js';

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('FATAL: JWT_SECRET must be set and at least 32 chars.');
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error('FATAL: DATABASE_URL must be set.');
  process.exit(1);
}

const app = express();
const isProd = process.env.NODE_ENV === 'production';

// Trust proxy (Render/Heroku/etc) so req.protocol reflects the X-Forwarded-Proto header.
app.set('trust proxy', 1);

// HTTPS enforcement in production: reject any request whose forwarded protocol is not https.
app.use((req, res, next) => {
  if (isProd && req.protocol !== 'https') {
    return res.status(403).json({ error: 'HTTPS required' });
  }
  next();
});

// CORS: production allows all live brand surfaces. dev allows configured client origin.
// EXTRA_ORIGIN is an optional extra allowed origin (Vercel preview URL, partner host, etc.)
const allowedOrigins = isProd
  ? [
      'https://dashboard.incomeacademy.biz',
      'https://thecreditworkshop.biz',
      'https://www.thecreditworkshop.biz',
      'https://thecreditworkshop.com',
      'https://www.thecreditworkshop.com',
      ...(process.env.EXTRA_ORIGIN ? [process.env.EXTRA_ORIGIN] : []),
    ]
  : [process.env.CLIENT_ORIGIN || 'http://localhost:5173'];

app.use(cors({
  origin: (origin, cb) => {
    // Allow same-origin / curl / Stripe webhooks (no Origin header).
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// IMPORTANT: webhooks MUST be mounted BEFORE express.json() because Stripe
// signature verification requires the raw request body.
app.use('/api/webhooks', webhooksRouter);

app.use(express.json({ limit: '100kb' }));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRouter);
app.use('/api/leads', requireAuth, leadsRouter);
app.use('/api/clients', requireAuth, clientsRouter);
app.use('/api/expenses', requireAuth, expensesRouter);
app.use('/api/credit-builder', requireAuth, creditBuilderRouter);
app.use('/api/admin', requireAuth, requireAdmin, adminRouter);

// Public lead intake (no JWT — uses header token instead).
app.use('/api/intake', intakeRouter);

app.use((err, _req, res, _next) => {
  // Log generic error code only — never the full error body or request contents.
  console.error('unhandled error:', err.code || err.name || 'unknown');
  res.status(500).json({ error: 'Server error' });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`API listening on :${port}`);
  startPeriodicChecks();
});
