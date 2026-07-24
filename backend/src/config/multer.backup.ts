import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Asegurarse de que el directorio tmp exista
const tmpDir = path.join(__dirname, '../../tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

// Guardamos temporalmente en el disco para que mongorestore pueda leerlo
const storage = multer.diskStorage({
  destination: tmpDir,
  filename: (_req, _file, cb) => {
    cb(null, `backup-${Date.now()}.gz`);
  }
});

export const uploadBackup = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB límite
  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype === 'application/gzip' || 
      file.mimetype === 'application/x-gzip' || 
      file.mimetype === 'application/zip' || 
      file.mimetype === 'application/x-zip-compressed' ||
      file.mimetype === 'application/octet-stream' ||
      file.originalname.endsWith('.gz')
    ) {
      cb(null, true);
    } else {
      cb(new Error(`Formato no válido: ${file.mimetype}. Solo se permiten archivos .gz`));
    }
  }
});
