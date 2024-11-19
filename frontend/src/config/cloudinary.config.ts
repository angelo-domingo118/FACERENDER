import { v2 as cloudinary } from 'cloudinary';

// Use environment variables from your frontend .env
const CLOUDINARY_CONFIG = {
  cloud_name: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'facerender',
  api_key: import.meta.env.VITE_CLOUDINARY_API_KEY || '541897598769331',
  api_secret: import.meta.env.VITE_CLOUDINARY_API_SECRET || 'saP6-wIksFk4lWginRJGWHLseG4'
};

cloudinary.config(CLOUDINARY_CONFIG);

export default cloudinary; 