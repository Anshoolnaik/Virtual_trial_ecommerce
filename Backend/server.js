require('dotenv').config();
const http    = require('http');
const express = require('express');
const cors    = require('cors');

const authRoutes            = require('./src/routes/authRoutes');
const addressRoutes         = require('./src/routes/addressRoutes');
const sellerAuthRoutes      = require('./src/routes/sellerAuthRoutes');
const sellerProductRoutes   = require('./src/routes/sellerProductRoutes');
const publicProductRoutes   = require('./src/routes/publicProductRoutes');
const wishlistRoutes        = require('./src/routes/wishlistRoutes');
const orderRoutes           = require('./src/routes/orderRoutes');
const sellerOrderRoutes     = require('./src/routes/sellerOrderRoutes');
const publicFlashSaleRoutes = require('./src/routes/publicFlashSaleRoutes');
const sellerFlashSaleRoutes = require('./src/routes/sellerFlashSaleRoutes');
const notificationRoutes    = require('./src/routes/notificationRoutes');
const errorHandler          = require('./src/middleware/errorHandler');
const { initSocket }        = require('./src/socket');

const app        = express();
const httpServer = http.createServer(app);

// ─── Socket.io ────────────────────────────────────────────────────────────────
initSocket(httpServer);

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Vogue API', timestamp: new Date() });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/seller/auth', sellerAuthRoutes);
app.use('/api/seller/products', sellerProductRoutes);
app.use('/api/products', publicProductRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/seller/orders', sellerOrderRoutes);
app.use('/api/flash-sales', publicFlashSaleRoutes);
app.use('/api/seller/flash-sales', sellerFlashSaleRoutes);
app.use('/api/notifications', notificationRoutes);

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`\n🚀 Vogue API running on http://localhost:${PORT}`);
  console.log(`   Health:           http://localhost:${PORT}/health`);
  console.log(`   Buyer Auth:       http://localhost:${PORT}/api/auth`);
  console.log(`   Seller Auth:      http://localhost:${PORT}/api/seller/auth`);
  console.log(`   Seller Products:  http://localhost:${PORT}/api/seller/products`);
  console.log(`   Public Products:  http://localhost:${PORT}/api/products`);
  console.log(`   Socket.io:        ws://localhost:${PORT}\n`);
});
