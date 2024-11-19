import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
  ) {}

  @Get()
  getHello() {
    return { message: 'NestJS Backend is running!' };
  }

  @Get('/api/test')
  getTest() {
    return { message: 'Backend is connected!' };
  }

  @Get('/api/features')
  getFeatures() {
    return {
      features: [
        {
          title: "AI-Powered Alignment",
          description: "Automatic feature alignment and proportion matching"
        },
        {
          title: "Real-time Collaboration",
          description: "Work together in real-time"
        },
        {
          title: "Secure Database",
          description: "Centralized, secure storage"
        }
      ]
    };
  }
}
