import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../database/db.js';
import { config } from '../config.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !identifier.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Please provide your University Email or User ID.',
      code: 'MISSING_IDENTIFIER',
    });
  }

  if (!password) {
    return res.status(400).json({
      success: false,
      error: 'Please provide your password.',
      code: 'MISSING_PASSWORD',
    });
  }

  const cleanId = identifier.trim().toLowerCase();

  // Find user by email, secondary email (.demo alias), or userId
  const user = db.prepare(`
    SELECT * FROM users
    WHERE LOWER(email) = ? OR LOWER(secondaryEmail) = ? OR LOWER(userId) = ?
  `).get(cleanId, cleanId, cleanId);

  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

  if (!user) {
    // Log failed login attempt
    try {
      db.prepare(`
        INSERT INTO audit_logs (id, userId, actor, role, action, module, status, ip, duration, details, overrideReason, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        `EVT-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`,
        null,
        `Unrecognized (${identifier.trim()})`,
        'unknown',
        'USER_LOGIN_FAILED',
        'auth/login',
        'Denied (401)',
        req.ip || '127.0.0.1',
        '35ms',
        `Failed authentication attempt for unrecognized credential: "${identifier.trim()}"`,
        null,
        timestamp
      );
    } catch (e) {
      console.warn('Audit logging error:', e);
    }

    return res.status(401).json({
      success: false,
      error: 'Unrecognized University Email or User ID. Please verify your credentials.',
      code: 'INVALID_CREDENTIALS',
    });
  }

  const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);

  if (!isPasswordValid) {
    // Log failed login attempt
    try {
      db.prepare(`
        INSERT INTO audit_logs (id, userId, actor, role, action, module, status, ip, duration, details, overrideReason, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        `EVT-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`,
        user.id,
        `${user.name} (${user.role})`,
        user.role,
        'USER_LOGIN_FAILED',
        'auth/login',
        'Denied (401)',
        req.ip || '127.0.0.1',
        '42ms',
        `Failed authentication attempt for ${user.name} (${user.userId}): Incorrect password.`,
        null,
        timestamp
      );
    } catch (e) {
      console.warn('Audit logging error:', e);
    }

    return res.status(401).json({
      success: false,
      error: 'Incorrect password. Please verify your password and try again.',
      code: 'INVALID_CREDENTIALS',
    });
  }

  // Issue JWT Token
  const tokenPayload = {
    id: user.id,
    userId: user.userId,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    avatar: user.avatar,
  };

  const token = jwt.sign(tokenPayload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

  // Log successful login
  try {
    db.prepare(`
      INSERT INTO audit_logs (id, userId, actor, role, action, module, status, ip, duration, details, overrideReason, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `EVT-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`,
      user.id,
      `${user.name} (${user.role})`,
      user.role,
      'USER_LOGIN_SUCCESS',
      'auth/login',
      'Authorized (200)',
      req.ip || '127.0.0.1',
      '52ms',
      `User ${user.name} (${user.userId}) authenticated successfully. Granted ${user.role.toUpperCase()} session.`,
      null,
      timestamp
    );
  } catch (e) {
    console.warn('Audit logging error:', e);
  }

  res.json({
    success: true,
    token,
    user: tokenPayload,
  });
});

// GET /api/auth/me
router.get('/me', authenticateJWT, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

// POST /api/auth/logout
router.post('/logout', authenticateJWT, (req, res) => {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

  try {
    db.prepare(`
      INSERT INTO audit_logs (id, userId, actor, role, action, module, status, ip, duration, details, overrideReason, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `EVT-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`,
      req.user.id,
      `${req.user.name} (${req.user.role})`,
      req.user.role,
      'USER_LOGOUT',
      'auth/logout',
      'Terminated',
      req.ip || '127.0.0.1',
      '15ms',
      `User ${req.user.name} (${req.user.userId}) voluntarily ended session.`,
      null,
      timestamp
    );
  } catch (e) {
    console.warn('Audit logging error:', e);
  }

  res.json({
    success: true,
    message: 'Logged out successfully.',
  });
});

export default router;
