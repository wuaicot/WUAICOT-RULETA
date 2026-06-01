import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import path from 'path';
import fs from 'fs';

// Asegurar que el directorio de uploads local existe
const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'receipts');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

let storage;

// Verificar explícitamente si todas las credenciales requeridas están presentes
const hasCloudinaryCredentials = !!(process.env.CLOUD_NAME && process.env.API_KEY && process.env.API_SECRET);

if (hasCloudinaryCredentials) {
  console.log("Cloudinary credentials found. Using Cloudinary storage.");
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
  });

  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'receipts',
      allowed_formats: ['jpg', 'png', 'jpeg'],
    } as any,
  });
} else {
  console.log("Cloudinary credentials not found or incomplete. Using local storage for uploads.");
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });
}

export const upload = multer({ storage });
