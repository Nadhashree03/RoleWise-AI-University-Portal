import multer from 'multer';
import path from 'node:path';

// Use memory storage so we can parse buffer directly with csv-parse or xlsx
const storage = multer.memoryStorage();

const allowedExtensions = ['.csv', '.xlsx', '.xls'];

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return cb(new Error(`Invalid file format "${ext}". Only CSV (.csv) and Excel (.xlsx, .xls) files are supported.`));
    }
    cb(null, true);
  },
});
