import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { seedDatabase } from './database/seed.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import feeRoutes from './routes/feeRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import admissionRoutes from './routes/admissionRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import overrideRoutes from './routes/overrideRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import governanceRoutes from './routes/governanceRoutes.js';

const app = express();

// Initialize and seed database
seedDatabase();

// Global Middlewares
app.use(cors({
  origin: '*', // Allow Vite development server and production origins
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (!req.path.startsWith('/api/health')) {
      console.log(`[HTTP] ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'RoleWise AI Backend API',
    database: 'SQLite (Native DatabaseSync)',
    version: '2.4.0',
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/admissions', admissionRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/change-history', historyRoutes);
app.use('/api/overrides', overrideRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/events', eventRoutes);
app.use('/api', governanceRoutes);

// Centralized error handler
app.use(errorHandler);

// Start server if run directly
const isMain = process.argv[1] && (process.argv[1].endsWith('server.js') || process.argv[1].endsWith('server'));
if (isMain && process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`========================================================`);
    console.log(`🚀 RoleWise AI Backend listening on port ${config.port}`);
    console.log(`📍 REST API: http://localhost:${config.port}/api`);
    console.log(`🔍 Health Check: http://localhost:${config.port}/api/health`);
    console.log(`========================================================`);
  });
}

export default app;
