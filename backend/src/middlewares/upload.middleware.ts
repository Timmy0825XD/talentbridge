import multer from 'multer';

// Guardamos el archivo en memoria como Buffer
// para luego procesarlo o enviarlo a un storage en la nube
const storage = multer.memoryStorage();

export const uploadCv = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB máximo
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('INVALID_FILE_TYPE'));
    }
  },
});