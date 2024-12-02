import { Controller, Get, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Controller()
export class AppController {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  @Post('test-db')
  async testDB() {
    const user = this.userRepository.create({
      username: 'testuser',
      password: 'password123',
      email: 'test@example.com',
      role: 'user'
    });
    
    await this.userRepository.save(user);
    return { message: 'Test user created successfully' };
  }

  @Get('users')
  async getUsers() {
    return await this.userRepository.find();
  }
}
