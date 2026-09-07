import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { db } from '../database/db.js';

export function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Missing or malformed token.',
      code: 'AUTH_REQUIRED',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Session expired or invalid token. Please sign in again.',
      code: 'INVALID_TOKEN',
    });
  }
}

export function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required before role check.',
        code: 'UNAUTHENTICATED',
      });
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(req.user.role)) {
      // Log unauthorized access attempt in audit logs
      try {
        const insertAudit = db.prepare(`
          INSERT INTO audit_logs (id, userId, actor, role, action, module, status, ip, duration, details, overrideReason, timestamp)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        insertAudit.run(
          `EVT-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
          req.user.id || null,
          `${req.user.name || 'User'} (${req.user.role})`,
          req.user.role,
          'UNAUTHORIZED_API_ACCESS',
          req.baseUrl || req.path,
          'Denied (403)',
          req.ip || '127.0.0.1',
          '5ms',
          `403 Forbidden: Attempted to access ${req.method} ${req.originalUrl}. Required roles: [${roles.join(', ')}]`,
          null,
          new Date().toISOString().replace('T', ' ').substring(0, 19)
        );
      } catch (logErr) {
        console.warn('[Audit] Failed to log 403 attempt:', logErr.message);
      }

      return res.status(403).json({
        success: false,
        error: `Access restricted. Your active persona (${req.user.role.toUpperCase()}) lacks sufficient institutional privileges. Required: [${roles.map((r) => r.toUpperCase()).join(', ')}].`,
        code: 'ROLE_FORBIDDEN',
        requiredRoles: roles,
        activeRole: req.user.role,
      });
    }

    next();
  };
}
