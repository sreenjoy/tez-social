import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectConnection() private readonly mongoConnection: Connection
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  healthCheck(): { status: string } {
    return { status: 'ok' };
  }

  @Get('health/database')
  async databaseHealthCheck() {
    try {
      // Check MongoDB connection state
      const state = this.mongoConnection.readyState;
      /*
        Connection states:
        0 = disconnected
        1 = connected
        2 = connecting
        3 = disconnecting
      */
      
      // Check the database by performing a simple operation
      const isConnected = state === 1;
      let pingResult: any = null;
      let mongoVersion: string | null = null;
      
      if (isConnected && this.mongoConnection.db) {
        // Only try to ping if connected
        try {
          pingResult = await this.mongoConnection.db.admin().ping();
        } catch (pingError) {
          pingResult = { ok: 0 };
        }
        
        // Only try to get version if connected
        try {
          const serverInfo = await this.mongoConnection.db.admin().serverInfo();
          mongoVersion = serverInfo?.version?.toString() || null;
        } catch (versionError) {
          mongoVersion = null;
        }
      }
      
      return {
        status: isConnected ? 'connected' : 'disconnected',
        connectionState: state,
        pingSuccess: isConnected && pingResult?.ok === 1,
        details: {
          mongoVersion,
          readyState: state,
          connectionStateText: ['disconnected', 'connected', 'connecting', 'disconnecting'][state] || 'unknown'
        }
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        details: {
          stack: error.stack,
          name: error.name
        }
      };
    }
  }

  @Get('protected')
  @UseGuards(AuthGuard('jwt'))
  getProtected(@Req() req) {
    return {
      statusCode: 200,
      message: 'This is a protected route',
      data: {
        user: req.user
      },
      timestamp: new Date().toISOString(),
      path: '/api/protected',
    };
  }
}
