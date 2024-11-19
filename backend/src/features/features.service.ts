import { Injectable, Logger } from '@nestjs/common';
import { CloudinaryService } from '../services/cloudinary.service';

@Injectable()
export class FeaturesService {
  private readonly logger = new Logger(FeaturesService.name);

  constructor(private readonly cloudinaryService: CloudinaryService) {}

  async getFeaturesByCategory(category: string) {
    this.logger.debug(`Getting features for category: ${category}`);
    try {
      const features = await this.cloudinaryService.getFacialFeatures(category);
      this.logger.debug(`Found ${features.length} features for ${category}`);
      return features;
    } catch (error) {
      this.logger.error(`Error getting features for ${category}:`, error);
      throw error;
    }
  }
} 