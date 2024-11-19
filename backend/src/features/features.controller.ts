import { Controller, Get, Param, Logger } from '@nestjs/common';
import { FeaturesService } from './features.service';

@Controller('api/features')
export class FeaturesController {
  private readonly logger = new Logger(FeaturesController.name);

  constructor(private readonly featuresService: FeaturesService) {}

  @Get(':category')
  async getFeaturesByCategory(@Param('category') category: string) {
    this.logger.debug(`Received request for category: ${category}`);
    try {
      const features = await this.featuresService.getFeaturesByCategory(category);
      this.logger.debug(`Found ${features.length} features for ${category}`);
      return {
        success: true,
        data: features,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Error fetching features for ${category}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }
} 