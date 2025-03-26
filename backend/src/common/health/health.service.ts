import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import * as os from 'os';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private startTime: number = Date.now();

  constructor(
    @InjectConnection() private readonly mongoConnection: Connection,
  ) {}

  async checkOverallHealth(): Promise<any> {
    const dbHealth = await this.checkDatabaseHealth();
    const systemHealth = this.checkSystemHealth();

    return {
      status: dbHealth.status === 'connected' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: this.getUptime(),
      version: process.env.npm_package_version || '1.0.0',
      database: dbHealth,
      system: systemHealth,
    };
  }

  async checkDatabaseHealth() {
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
          this.logger.error(`Database ping failed: ${pingError.message}`);
          pingResult = { ok: 0 };
        }
        
        // Only try to get version if connected
        try {
          const serverInfo = await this.mongoConnection.db.admin().serverInfo();
          mongoVersion = serverInfo?.version?.toString() || null;
        } catch (versionError) {
          this.logger.error(`Failed to get MongoDB version: ${versionError.message}`);
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
      this.logger.error(`Database health check failed: ${error.message}`);
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  checkSystemHealth() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMemPercentage = ((totalMem - freeMem) / totalMem) * 100;

    return {
      memory: {
        total: this.formatBytes(totalMem),
        free: this.formatBytes(freeMem),
        used: this.formatBytes(totalMem - freeMem),
        usedPercentage: usedMemPercentage.toFixed(2) + '%',
      },
      cpu: {
        arch: os.arch(),
        cores: os.cpus().length,
        model: os.cpus()[0]?.model || 'Unknown',
        load: os.loadavg(),
      },
      os: {
        platform: os.platform(),
        type: os.type(),
        release: os.release(),
        uptime: this.formatUptime(os.uptime()),
      },
      process: {
        pid: process.pid,
        nodeVersion: process.version,
        memoryUsage: {
          rss: this.formatBytes(process.memoryUsage().rss),
          heapTotal: this.formatBytes(process.memoryUsage().heapTotal),
          heapUsed: this.formatBytes(process.memoryUsage().heapUsed),
        },
      },
    };
  }

  private getUptime(): string {
    const uptimeMs = Date.now() - this.startTime;
    return this.formatUptime(uptimeMs / 1000);
  }

  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${days}d ${hours}h ${minutes}m ${remainingSeconds}s`;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
} 