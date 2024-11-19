import { Controller, Get, Param } from '@nestjs/common';
import { CloudinaryService } from '../services/cloudinary.service';

@Controller('api/features')
export class FeaturesController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Get(':category')
  async getFacialFeatures(@Param('category') category: string) {
    try {
      const features = await this.cloudinaryService.getFacialFeatures(category);
      return { 
        success: true, 
        data: features,
        category,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in getFacialFeatures:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch features',
        category,
        timestamp: new Date().toISOString()
      };
    }
  }
} 