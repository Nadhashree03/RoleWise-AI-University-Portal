import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const config = {
  port: process.env.PORT || 3001,
  jwtSecret: process.env.JWT_SECRET || 'rolewise-academic-portal-jwt-secret-key-2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5174',
  dbPath: process.env.DB_PATH || path.join(__dirname, 'data', 'rolewise.db'),
  uploadDir: process.env.UPLOAD_DIR || path.join(__dirname, 'uploads'),
};
