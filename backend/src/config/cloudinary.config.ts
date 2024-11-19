import { v2 as cloudinary } from 'cloudinary';
import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const logger = new Logger('CloudinaryConfig');

const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET
} = process.env;

// Log environment variables (without secrets)
logger.log('Cloudinary Configuration:', {
  cloudName: CLOUDINARY_CLOUD_NAME,
  hasApiKey: !!CLOUDINARY_API_KEY,
  hasApiSecret: !!CLOUDINARY_API_SECRET
});

try {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });

  logger.log('Cloudinary configured successfully');
} catch (error) {
  logger.error('Failed to configure Cloudinary:', error);
  throw error;
}

export default cloudinary; 