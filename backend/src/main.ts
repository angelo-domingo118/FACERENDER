import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

interface AddressInUseError extends Error {
  code: string;
  port: number;
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Check required environment variables
  const requiredEnvVars = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ];

  const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missingEnvVars.length > 0) {
    logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    process.exit(1);
  }

  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'debug', 'log', 'verbose'],
    });
    
    app.enableCors({
      origin: [
        'http://localhost:5173', 
        'http://127.0.0.1:5173',
        'http://localhost:5174', 
        'http://127.0.0.1:5174'
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization']
    });
    
    const port = 3002;
    
    await app.listen(port, '0.0.0.0');
    logger.log(`Application is running on: http://localhost:${port}`);
  } catch (error) {
    if ((error as AddressInUseError).code === 'EADDRINUSE') {
      logger.error(`Port ${(error as AddressInUseError).port} is already in use. Please try another port or kill the process using this port.`);
    } else {
      logger.error('Failed to start application:', error);
    }
    process.exit(1);
  }
}
bootstrap();
