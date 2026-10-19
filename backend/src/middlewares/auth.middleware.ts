import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthPayload {
  userId: number;
  role: 'owner' | 'walker';
}

export const authMiddleware = (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  const authorization = _req.headers.authorization;
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return res.status(500).json({
      message: 'Authentication is not configured.',
    });
  }

  if (!authorization?.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Authentication token is required.',
    });
  }

  const token = authorization.slice(7).trim();

  try {
    const decoded = jwt.verify(token, secret);

    if (
      typeof decoded === 'string' ||
      !Number.isInteger(decoded.userId) ||
      !['owner', 'walker'].includes(decoded.role)
    ) {
      return res.status(401).json({ message: 'Invalid token.' });
    }

    res.locals.user = {
      userId: decoded.userId,
      role: decoded.role,
    } satisfies AuthPayload;

    return next();
  } catch {
    return res.status(401).json({
      message: 'Invalid or expired token.',
    });
  }
};

export const requireRole = (...roles: Array<'owner' | 'walker'>) => {
  return (_req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user as AuthPayload | undefined;

    if (!user) {
      return res.status(401).json({
        message: 'Authentication required.',
      });
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({
        message: 'You do not have permission to perform this action.',
      });
    }

    return next();
  };
};
