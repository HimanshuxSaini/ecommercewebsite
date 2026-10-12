import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const distDir = path.join(__dirname, 'dist');

// Disable X-Powered-By to prevent server footprint discovery
app.disable('x-powered-by');

// Trust reverse proxy if running behind Nginx / Cloudflare / ALB
app.set('trust proxy', 1);

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
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https:;"
  );

  next();
});

// JSON body parser with size limit to prevent payload flooding (DoS)
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Health Check Endpoint (used by Kubernetes / AWS ECS / Render / Railway)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'velneer-storefront',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Cache-control for static assets in /assets/ (immutable 1 year)
app.use(
  '/assets',
  express.static(path.join(distDir, 'assets'), {
    maxAge: '365d',
    immutable: true,
  })
);

// Serve other static files in dist/
app.use(
  express.static(distDir, {
    maxAge: '1h',
    setHeaders: (res, filePath) => {
      // Ensure index.html and security.txt are always revalidated
      if (filePath.endsWith('index.html') || filePath.endsWith('security.txt')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    },
  })
);

// SPA Fallback: send index.html for any client-side routes
app.get('*', (req, res) => {
  const indexPath = path.join(distDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(indexPath);
  } else {
    res.status(503).send('Site building or dist not found. Please run "npm run build".');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[VELNEER] Secure production server running on http://0.0.0.0:${PORT}`);
});
