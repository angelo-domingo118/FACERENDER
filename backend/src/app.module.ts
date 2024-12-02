import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FeaturesController } from './features/features.controller';
import { FeaturesService } from './features/features.service';
import { CloudinaryService } from './services/cloudinary.service';
import { HealthController } from './health/health.controller';
import { User } from './entities/user.entity';
import { Composite } from './entities/composite.entity';
import { Feature } from './entities/feature.entity';
import { Case } from './entities/case.entity';
import { AuditLog } from './entities/audit-log.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || '090011',
      database: process.env.DATABASE_NAME || 'facerender_db',
      entities: [User, Composite, Feature, Case, AuditLog],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User]),
    CacheModule.register({
      isGlobal: true,
      ttl: 3600,
      max: 100
    }),
  ],
  controllers: [AppController, FeaturesController, HealthController],
  providers: [AppService, FeaturesService, CloudinaryService],
})
export class AppModule {}