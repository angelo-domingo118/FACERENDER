import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return { message: 'NestJS Backend is running!' };
  }

  getTest() {
    return { message: 'Backend is connected!' };
  }

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
