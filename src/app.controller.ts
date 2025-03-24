import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      time: new Date().toISOString(),
      service: 'tez-social-api',
      environment: process.env.NODE_ENV || 'development'
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('protected')
  getProtected(): string {
    return 'This is a protected route';
  }
} 