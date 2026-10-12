import express from 'express';
import multer from 'multer';
import { uploadToCloudinary } from '../services/cloudinaryService.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Configure Multer in-memory storage with strict file type and 5MB size limits
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Strict MIME whitelist (JPEG, PNG, WebP, AVIF)
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and AVIF images are permitted.'));
    }
  },
});

// POST /api/upload/image (Requires Admin or Manager role)
router.post(
  '/image',
  authenticate,
  requireRole('admin', 'manager'),
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No image file provided in upload.' });
      }

      const folder = req.body.folder || 'velneer/products';
      const uploadResult = await uploadToCloudinary(req.file.buffer, folder);

      return res.status(200).json({
        success: true,
        message: 'Image uploaded and processed successfully via Cloudinary.',
        url: uploadResult.url,
        publicId: uploadResult.public_id,
        format: uploadResult.format,
        bytes: uploadResult.bytes,
      });
    } catch (error) {
      console.error('[UPLOAD ERROR]', error);
      return res.status(500).json({
        success: false,
        message: 'Image upload failed. ' + error.message,
      });
    }
  }
);

export default router;
