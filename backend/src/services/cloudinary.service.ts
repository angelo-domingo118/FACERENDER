import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import cloudinary from '../config/cloudinary.config';

// Define CloudinaryResource interface
interface CloudinaryResource {
  public_id: string;
  secure_url: string;
  context?: Record<string, any>;
  tags?: string[];
}

// Define Feature interface
interface Feature {
  id: string;
  url: string;
  category: string;
  type: number;
}

// Define folder mapping type
type FolderMapping = {
  [key: string]: string;
};

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private readonly CACHE_TTL = 3600; // Cache for 1 hour
  private readonly CACHE_PREFIX = 'features:';

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  private readonly folderMapping: FolderMapping = {
    faceShape: 'Segemented_Faces_Demo/Face_Shape',
    eyes: 'Segemented_Faces_Demo/Eyes',
    eyebrows: 'Segemented_Faces_Demo/Eyebrows',
    nose: 'Segemented_Faces_Demo/Nose',
    mouth: 'Segemented_Faces_Demo/Mouth',
    ears: 'Segemented_Faces_Demo/Ears',
    hair: 'Segemented_Faces_Demo/Hair'
  };

  async getFacialFeatures(category: string) {
    try {
      // Try to get from cache first
      const cacheKey = `${this.CACHE_PREFIX}${category}`;
      const cachedFeatures = await this.cacheManager.get<Feature[]>(cacheKey);
      
      if (cachedFeatures) {
        this.logger.debug(`Cache hit for ${category}`);
        return cachedFeatures;
      }

      // If not in cache, fetch from Cloudinary
      this.logger.debug(`Cache miss for ${category}, fetching from Cloudinary`);
      const features = await this.fetchFromCloudinary(category);
      
      // Store in cache
      await this.cacheManager.set(cacheKey, features, this.CACHE_TTL);
      
      return features;

    } catch (error) {
      this.logger.error('Error fetching features:', error);
      throw error;
    }
  }

  private async fetchFromCloudinary(category: string) {
    const folderPath = this.folderMapping[category];
    if (!folderPath) {
      this.logger.error(`Invalid category: ${category}`);
      return [];
    }

    await this.testConnection();
    
    const searchExpression = `folder:${folderPath}/*`;
    const result = await cloudinary.search
      .expression(searchExpression)
      .with_field('context')
      .with_field('tags')
      .max_results(30)
      .execute();

    if (!result.resources || result.resources.length === 0) {
      return [];
    }

    return result.resources.map((resource: CloudinaryResource) => ({
      id: resource.public_id,
      url: this.getOptimizedUrl(resource.secure_url),
      category: category,
      type: this.extractTypeNumber(resource.public_id)
    }));
  }

  private extractTypeNumber(publicId: string): number {
    try {
      const match = publicId.match(/type_(\d+)/);
      return match ? parseInt(match[1]) : 0;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error extracting type number from ${publicId}: ${errorMessage}`);
      return 0;
    }
  }

  async testConnection() {
    try {
      const result = await cloudinary.api.ping();
      this.logger.log('Cloudinary connection test successful');
      return true;
    } catch (error) {
      this.logger.error('Cloudinary connection test failed:', error);
      throw new Error('Failed to connect to Cloudinary');
    }
  }

  private getOptimizedUrl(url: string): string {
    // Add Cloudinary transformations for better loading
    return url.replace('/upload/', '/upload/f_auto,q_auto/');
  }

  async onApplicationBootstrap() {
    try {
      // Warm up cache for all categories
      for (const category of Object.keys(this.folderMapping)) {
        await this.getFacialFeatures(category);
      }
      this.logger.log('Cache warmup completed');
    } catch (error) {
      this.logger.error('Cache warmup failed:', error);
    }
  }
} 