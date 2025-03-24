import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { PipelinesModule } from './pipelines/pipelines.module';
import { TelegramModule } from './telegram/telegram.module';
import { 
  databaseConfig, 
  jwtConfig, 
  telegramConfig, 
  googleConfig, 
  appConfig 
} from './config/configuration';

/**
 * Main application module
 * This is the entry point for the application
 */
@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, telegramConfig, googleConfig, appConfig],
      envFilePath: '.env',
    }),
    
    // Database connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        let uri = configService.get<string>('database.uri');
        
        if (!uri) {
          // Fallback to direct environment variable
          uri = process.env.MONGODB_URI;
        }
        
        if (!uri) {
          console.warn('MongoDB URI not defined. Database functionality will be limited.');
          // Return a mock connection that won't throw errors
          return { uri: 'mongodb://127.0.0.1:27017/dummy' };
        }
        
        return {
          uri,
          useNewUrlParser: true,
          useUnifiedTopology: true,
          // Add error handling for the connection
          connectionFactory: (connection) => {
            connection.on('error', (error) => {
              console.error('MongoDB connection error:', error);
            });
            connection.on('disconnected', () => {
              console.warn('MongoDB disconnected. Database functionality will be limited.');
            });
            return connection;
          },
        };
      },
    }),
    
    // Application modules
    DatabaseModule,
    AuthModule,
    PipelinesModule,
    TelegramModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {} 