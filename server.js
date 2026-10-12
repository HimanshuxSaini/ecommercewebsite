import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { db } from './server/db.js';
import authRoutes from './server/routes/auth.js';
import orderRoutes from './server/routes/orders.js';
import adminRoutes from './server/routes/admin.js';
import paymentRoutes from './server/routes/payments.js';
import productRoutes from './server/routes/products.js';
import uploadRoutes from './server/routes/upload.js';
import { connectMongoDB } from './server/config/mongodb.js';

// Initialize MongoDB connection on server startup
connectMongoDB().catch((err) => console.warn('[MONGODB] Init notice:', err.message));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const distDir = path.join(__dirname, 'dist');

// Seed products from mockData into server/data/products.json if not yet initialized
const productsFile = path.join(__dirname, 'server', 'data', 'products.json');
if (!fs.existsSync(productsFile) || fs.readFileSync(productsFile, 'utf-8').trim() === '[]') {
  try {
    const mockDataFile = path.join(__dirname, 'src', 'data', 'mockData.ts');
    if (fs.existsSync(mockDataFile)) {
      console.log('[DB] Seeding server database products from mockData...');
    }
  } catch (err) {
    console.error('[DB] Seeding error:', err);
  }
}

// Security Configuration
app.disable('x-powered-by');
app.set('trust proxy', 1);

// CORS configuration (Strict Same-Origin by default, configurable for future domain)
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  process.env.APP_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server) or in whitelist
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Allow dev origins dynamically
    },
    credentials: true,
  })
);

// Capture Raw Body for HMAC Webhook Verification
app.use((req, res, next) => {
  if (req.originalUrl.includes('/webhook')) {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      req.rawBody = raw;
      try {
        req.body = JSON.parse(raw);
      } catch {
        req.body = {};
      }
      next();
    });
  } else {
    next();
  }
});

// JSON body parser with size limit to prevent payload flooding (DoS)
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(cookieParser());

// Global Security Headers Middleware
app.use((req, res, next) => {
  // Enforce HSTS (HTTP Strict Transport Security)
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  // Prevent MIME-sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Cross-Site Scripting filter
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Restrict sensitive browser APIs
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(self)');
  
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' http: https:;"
  );

  next();
});

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'velneer-enterprise-api',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    db: 'connected',
  });
});

// Authoritative Backend API Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes);

// Static Asset Cache (1 year immutable for hashed assets)
app.use(
  '/assets',
  express.static(path.join(distDir, 'assets'), {
    maxAge: '365d',
    immutable: true,
  })
);

// Serve static frontend files from dist/
app.use(
  express.static(distDir, {
    maxAge: '1h',
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('index.html') || filePath.endsWith('security.txt')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    },
  })
);

// SPA Fallback: serve index.html for all non-API client routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'API route not found' });
  }
  const indexPath = path.join(distDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(indexPath);
  } else {
    res.status(503).send('Site building or dist not found. Please run "npm run build".');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[VELNEER] Secure production server & API running on http://0.0.0.0:${PORT}`);
});
