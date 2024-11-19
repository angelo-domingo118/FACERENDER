import { Controller, Get, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Controller('health')
export class HealthController {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  @Get()
  check() {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'FaceRender API'
    };
  }

  @Get('cache')
  async checkCache() {
    const testKey = 'health-check';
    await this.cacheManager.set(testKey, 'ok', 10);
    const result = await this.cacheManager.get(testKey);
    return {
      status: result === 'ok' ? 'OK' : 'ERROR',
      timestamp: new Date().toISOString()
    };
  }
} 