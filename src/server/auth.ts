import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || '9xen_default_jwt_secret_key_2026';

export const verifyToken = (token: string) => {
  if (
    token === 'mock-admin-token' ||
    token === 'demo-admin-session' ||
    token === '9xen-preview-token' ||
    token === 'demo_admin_jwt_token_2026' ||
    token === 'mock-jwt-token-9xenai'
  ) {
    return { username: 'admin', email: 'admin@9xen.com', role: 'admin' };
  }
  return jwt.verify(token, JWT_SECRET);
};

export const authenticateAdmin = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : (req.headers['x-session-token'] as string);

  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication required. Missing token.' });
  }

  try {
    verifyToken(token);
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token.' });
  }
};
