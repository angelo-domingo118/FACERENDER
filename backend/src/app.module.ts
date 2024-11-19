import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FeaturesController } from './features/features.controller';
import { FeaturesService } from './features/features.service';
import { CloudinaryService } from './services/cloudinary.service';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    CacheModule.register({
      isGlobal: true,
      // For development, use memory cache
      ttl: 3600, // 1 hour
      max: 100 // maximum number of items in cache
    }),
  ],
  controllers: [
    AppController,
    FeaturesController, 
    HealthController
  ],
  providers: [
    AppService,
    FeaturesService, 
    CloudinaryService
  ],
})
export class AppModule {}