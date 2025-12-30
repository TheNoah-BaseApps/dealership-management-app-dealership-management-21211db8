import { verifyToken, extractToken } from './jwt';
import { query } from './db';

export async function authenticateRequest(request) {
  try {
    const token = extractToken(request);
    
    if (!token) {
      return { authenticated: false, error: 'No token provided' };
    }
    
    const payload = await verifyToken(token);
    
    if (!payload) {
      return { authenticated: false, error: 'Invalid token' };
    }
    
    const result = await query(
      'SELECT id, email, name, role, phone FROM users WHERE id = $1',
      [payload.userId]
    );
    
    if (result.rows.length === 0) {
      return { authenticated: false, error: 'User not found' };
    }
    
    return {
      authenticated: true,
      user: result.rows[0]
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return { authenticated: false, error: 'Authentication failed' };
  }
}

export function requireAuth(handler) {
  return async (request, context) => {
    const auth = await authenticateRequest(request);
    
    if (!auth.authenticated) {
      return Response.json(
        { success: false, error: auth.error || 'Unauthorized' },
        { status: 401 }
      );
    }
    
    request.user = auth.user;
    return handler(request, context);
  };
}

export function requireRole(roles) {
  return (handler) => {
    return async (request, context) => {
      const auth = await authenticateRequest(request);
      
      if (!auth.authenticated) {
        return Response.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
      
      const userRoles = Array.isArray(roles) ? roles : [roles];
      
      if (!userRoles.includes(auth.user.role)) {
        return Response.json(
          { success: false, error: 'Forbidden: Insufficient permissions' },
          { status: 403 }
        );
      }
      
      request.user = auth.user;
      return handler(request, context);
    };
  };
}

export async function hashPassword(password) {
  const bcrypt = await import('bcryptjs');
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password, hash) {
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(password, hash);
}