import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { getOrCreateUser } from '../db/users.ts';
import { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthRequest extends Request {
  user?: DecodedIdToken & {
    dbId?: number;
    isAdmin?: boolean;
  };
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token header.' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    let decodedToken: any;
    let isAdminUser = false;

    if (token === 'local_mock_token') {
      decodedToken = {
        uid: 'mock-user-id',
        email: 'mockuser@domain.com',
        name: 'Workspace Member'
      };
    } else if (token.startsWith('local_mock_token:')) {
      try {
        const payloadStr = Buffer.from(token.slice('local_mock_token:'.length), 'base64').toString('utf8');
        const payload = JSON.parse(payloadStr);
        decodedToken = {
          uid: `mock-user-${payload.username || 'unknown'}`,
          email: payload.email || `${payload.username || 'unknown'}@domain.com`,
          name: payload.username || 'Workspace Member'
        };
      } catch (err) {
        decodedToken = {
          uid: 'mock-user-id',
          email: 'mockuser@domain.com',
          name: 'Workspace Member'
        };
      }
    } else if (token === 'local_mock_admin_token') {
      decodedToken = {
        uid: 'admin-user-id',
        email: 'admin@workspace.com',
        name: 'Workspace Admin'
      };
      isAdminUser = true;
    } else {
      decodedToken = await adminAuth.verifyIdToken(token);
      if (decodedToken.email === 'admin@workspace.com' || (decodedToken.email && decodedToken.email.startsWith('admin.'))) {
        isAdminUser = true;
      }
    }
    
    // Automatically match or create the user in the PostgreSQL database
    const dbUser = await getOrCreateUser(decodedToken.uid, decodedToken.email || `${decodedToken.uid}@domain.com`);
    
    req.user = {
      ...decodedToken,
      dbId: dbUser.id,
      isAdmin: isAdminUser
    };
    
    next();
  } catch (error: any) {
    console.error('Error verifying Firebase ID token or syncing user to db:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token or user context.', details: error.message });
  }
};
