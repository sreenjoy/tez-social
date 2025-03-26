import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async getHealth() {
    return { status: 'ok' };
  }

  @Get('check')
  async fullHealthCheck() {
    return this.healthService.checkOverallHealth();
  }

  @Get('database')
  async checkDatabase() {
    return this.healthService.checkDatabaseHealth();
  }

  @Get('system')
  getSystemHealth() {
    return this.healthService.checkSystemHealth();
  }
} 