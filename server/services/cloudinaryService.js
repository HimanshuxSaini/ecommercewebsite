import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary from environment variables
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL });
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'velneer-store',
    api_key: process.env.CLOUDINARY_API_KEY || '123456789012345',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'velneer_mock_cloudinary_secret',
    secure: true,
  });
}

/**
 * Upload an image buffer or base64 stream directly to Cloudinary
 * with automatic image optimization, responsive webp conversion, and secure folder grouping.
 */
export async function uploadToCloudinary(fileBuffer, folder = 'velneer/products', filename = null) {
  // Check if real Cloudinary credentials exist
  const hasRealCredentials =
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_KEY !== '123456789012345' &&
    process.env.CLOUDINARY_CLOUD_NAME;

  if (!hasRealCredentials) {
    console.log('[CLOUDINARY] Simulation: File received and processed. Configure CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY in .env for production CDN sync.');
    const mockPublicId = `velneer_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const previewUrl = fileBuffer
      ? `data:image/webp;base64,${fileBuffer.toString('base64')}`
      : 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80';
    return {
      success: true,
      url: previewUrl,
      public_id: mockPublicId,
      format: 'webp',
      bytes: fileBuffer ? fileBuffer.length : 1024,
    };
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: filename || `velneer_img_${Date.now()}`,
        format: 'webp',
        quality: 'auto:best',
        fetch_format: 'auto',
      },
      (error, result) => {
        if (error) {
          console.error('[CLOUDINARY] Upload failed:', error);
          reject(error);
        } else {
          resolve({
            success: true,
            url: result.secure_url,
            public_id: result.public_id,
            format: result.format,
            bytes: result.bytes,
            width: result.width,
            height: result.height,
          });
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
}

/**
 * Delete image from Cloudinary by public ID
 */
export async function deleteFromCloudinary(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return { success: result.result === 'ok' };
  } catch (error) {
    console.error('[CLOUDINARY] Delete error:', error);
    return { success: false, error: error.message };
  }
}

export { cloudinary };
