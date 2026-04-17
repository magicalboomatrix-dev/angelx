require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const { walletRouter, cryptoWalletsRouter } = require('./routes/wallet.routes');
const bankRoutes = require('./routes/bank.routes');
const depositRoutes = require('./routes/deposit.routes');
const sellRoutes = require('./routes/sell.routes');
const withdrawRoutes = require('./routes/withdraw.routes');
const historyRoutes = require('./routes/history.routes');
const settingsRoutes = require('./routes/settings.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();
const PORT = process.env.PORT || 4000;

// Security middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use(limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many authentication attempts, please try again later.' },
});

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/wallet', walletRouter);
app.use('/api/crypto-wallets', cryptoWalletsRouter);
app.use('/api/bank-card', bankRoutes);
app.use('/api/select-bank', require('./routes/selectbank.routes'));
app.use('/api', depositRoutes);
app.use('/api', sellRoutes);
app.use('/api', withdrawRoutes);
app.use('/api', historyRoutes);
app.use('/api', settingsRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`AngelX Backend running on port ${PORT}`);
});

module.exports = app;
