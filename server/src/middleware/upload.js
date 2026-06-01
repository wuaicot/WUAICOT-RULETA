"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("cloudinary");
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Asegurar que el directorio de uploads local existe
const uploadDir = path_1.default.join(__dirname, '..', '..', 'uploads', 'receipts');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
let storage;
// Verificar explícitamente si todas las credenciales requeridas están presentes
const hasCloudinaryCredentials = !!(process.env.CLOUD_NAME && process.env.API_KEY && process.env.API_SECRET);
if (hasCloudinaryCredentials) {
    console.log("Cloudinary credentials found. Using Cloudinary storage.");
    cloudinary_1.v2.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.API_KEY,
        api_secret: process.env.API_SECRET,
    });
    storage = new multer_storage_cloudinary_1.CloudinaryStorage({
        cloudinary: cloudinary_1.v2,
        params: {
            folder: 'receipts',
            allowed_formats: ['jpg', 'png', 'jpeg'],
        },
    });
}
else {
    console.log("Cloudinary credentials not found or incomplete. Using local storage for uploads.");
    storage = multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            cb(null, `${Date.now()}-${file.originalname}`);
        },
    });
}
exports.upload = (0, multer_1.default)({ storage });
