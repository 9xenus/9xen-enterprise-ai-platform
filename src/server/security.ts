import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import path from 'path';

// ------------------------------------------------------------------------------
// 1. Security Audit Logger (OWASP A09: Security Logging & Monitoring Failures)
// ------------------------------------------------------------------------------
export const SecurityLogger = {
  info: (event: string, meta?: object) => {
    console.log(`[SECURITY-INFO] [${new Date().toISOString()}] ${event}`, meta ? JSON.stringify(meta) : '');
  },
  warn: (event: string, meta?: object) => {
    console.warn(`[SECURITY-WARN] [${new Date().toISOString()}] ${event}`, meta ? JSON.stringify(meta) : '');
  },
  alert: (event: string, meta?: object) => {
    console.error(`[SECURITY-ALERT] [${new Date().toISOString()}] 🚨 ${event}`, meta ? JSON.stringify(meta) : '');
  },
};

// ------------------------------------------------------------------------------
// 2. Security Headers Middleware (OWASP A05: Security Misconfiguration)
// ------------------------------------------------------------------------------
export function owaspSecurityHeadersMiddleware(req: Request, res: Response, next: NextFunction) {
  // Disable fingerprinting header
  res.removeHeader('X-Powered-By');

  const host = req.headers.host || '';
  const isDevOrPreviewFrame = 
    process.env.NODE_ENV !== 'production' || 
    host.includes('run.app') || 
    host.includes('localhost') || 
    host.includes('127.0.0.1');

  // Content-Security-Policy (CSP) - Allow framing in Dev/Preview environments
  if (isDevOrPreviewFrame) {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://images.unsplash.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https: wss:; frame-ancestors *;"
    );
  } else {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://images.unsplash.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https: wss:; frame-ancestors 'self';"
    );
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  }

  // Anti-MIME Sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // HTTP Strict Transport Security (HSTS)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Cross-Site Scripting (XSS) Filter
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Permissions Policy
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

  next();
}

// ------------------------------------------------------------------------------
// 3. Rate Limiting Engine (OWASP A04: Insecure Design & Anti-DDoS)
// ------------------------------------------------------------------------------
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);

export function createRateLimiter(options: { windowMs: number; max: number; message: string }) {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const key = `${req.path}:${clientIp}`;
    const now = Date.now();

    const record = rateLimitStore.get(key);
    if (!record || now > record.resetTime) {
      rateLimitStore.set(key, { count: 1, resetTime: now + options.windowMs });
      return next();
    }

    if (record.count >= options.max) {
      SecurityLogger.warn('Rate limit exceeded', { ip: clientIp, path: req.path });
      return res.status(429).json({
        error: options.message,
        retryAfterSeconds: Math.ceil((record.resetTime - now) / 1000),
      });
    }

    record.count += 1;
    next();
  };
}

export const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: 'Too many requests from this IP. Please try again later.',
});

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many login attempts. Account temporarily throttled for security.',
});

export const formRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Form submission limit reached. Please wait before submitting again.',
});

// ------------------------------------------------------------------------------
// 4. XSS Input Sanitization Middleware (OWASP A03: Injection Defenses)
// ------------------------------------------------------------------------------
function sanitizeValue(value: any): any {
  if (typeof value === 'string') {
    if (value.startsWith('data:') && value.includes(';base64,')) {
      return value;
    }
    return value
      .replace(/<script\b[^<]*>([\s\S]*?)<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<iframe\b[^<]*>([\s\S]*?)<\/iframe>/gi, '');
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value !== null && typeof value === 'object') {
    const sanitizedObj: any = {};
    for (const key of Object.keys(value)) {
      sanitizedObj[key] = sanitizeValue(value[key]);
    }
    return sanitizedObj;
  }
  return value;
}

export function xssSanitizerMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.query) req.query = sanitizeValue(req.query);
  if (req.params) req.params = sanitizeValue(req.params);
  next();
}

// ------------------------------------------------------------------------------
// 5. File Upload Security Inspector (OWASP A08: Software & Data Integrity)
// ------------------------------------------------------------------------------
const DISALLOWED_EXTENSIONS = [
  '.exe', '.sh', '.bat', '.cmd', '.php', '.pl', '.py', '.js', '.vbs', '.scr', '.jar', '.dll', '.so', '.html', '.htm',
];

export function validateFileUpload(fileName: string, buffer: Buffer): { valid: boolean; reason?: string } {
  const ext = path.extname(fileName).toLowerCase();

  if (DISALLOWED_EXTENSIONS.includes(ext)) {
    SecurityLogger.alert('Executable or dangerous file upload blocked', { fileName, ext });
    return { valid: false, reason: `File extension '${ext}' is forbidden for security reasons.` };
  }

  if (buffer.length > 25 * 1024 * 1024) {
    return { valid: false, reason: 'File exceeds maximum 25MB payload limit.' };
  }

  if (fileName.includes('\0')) {
    SecurityLogger.alert('Null-byte attack attempt detected', { fileName });
    return { valid: false, reason: 'Invalid file name format.' };
  }

  return { valid: true };
}

// ------------------------------------------------------------------------------
// 6. Timing-Safe String Comparison (OWASP A02: Cryptographic Failures)
// ------------------------------------------------------------------------------
export function safeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}
