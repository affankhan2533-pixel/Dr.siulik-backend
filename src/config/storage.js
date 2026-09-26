const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

// Check if Cloudinary is configured
const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) || Boolean(process.env.CLOUDINARY_URL);

if (isCloudinaryConfigured) {
  if (process.env.CLOUDINARY_URL) {
    // configured via URL
  } else {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }
}

// Local storage directory setup
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
  } catch (err) {
    console.warn('[Storage] Could not create uploads directory:', err.message);
  }
}

// Local disk storage engine
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${cleanBase}-${uniqueSuffix}${ext}`);
  },
});

// File filter (accept images & video files)
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|webp|svg|gif/;
  const allowedVideoTypes = /mp4|webm|ogg|mov/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const mime = file.mimetype.toLowerCase();

  const isImage = allowedImageTypes.test(ext) || mime.startsWith('image/');
  const isVideo = allowedVideoTypes.test(ext) || mime.startsWith('video/');

  if (isImage || isVideo) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type. Please upload an image (WEBP, PNG, JPG, SVG) or video (MP4).'), false);
  }
};

const upload = multer({
  storage: diskStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
  fileFilter,
});

/**
 * Upload a local file to persistent storage (Cloudinary if configured, else returns local server path)
 */
const uploadToPersistentStorage = async (file, folder = 'dr_siulik_dental') => {
  if (isCloudinaryConfigured) {
    try {
      const isVideo = file.mimetype.startsWith('video/') || /\.(mp4|webm|mov)$/i.test(file.path);
      const result = await cloudinary.uploader.upload(file.path, {
        folder,
        resource_type: isVideo ? 'video' : 'auto',
      });
      // Remove temporary local file after Cloudinary upload
      try {
        fs.unlinkSync(file.path);
      } catch {}
      return {
        url: result.secure_url,
        publicId: result.public_id,
        storageProvider: 'cloudinary',
      };
    } catch (err) {
      console.error('[Storage] Cloudinary upload failed, falling back to local file URL:', err.message);
    }
  }

  // Fallback to local server upload URL
  const filename = path.basename(file.path);
  return {
    url: `/uploads/${filename}`,
    publicId: filename,
    storageProvider: 'local-disk',
  };
};

module.exports = {
  upload,
  uploadToPersistentStorage,
  isCloudinaryConfigured,
  uploadDir,
};
