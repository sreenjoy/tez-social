import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter, AllExceptionsFilter } from './common/filters';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    logger.log('Bootstrapping application...');
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // Enable validation
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }));

    // Apply global filters (order matters - more specific first)
    app.useGlobalFilters(
      new HttpExceptionFilter(),
      new AllExceptionsFilter(),
    );

    // Set global prefix
    app.setGlobalPrefix('api');

    // Set headers for security
    app.use((req, res, next) => {
      res.header('X-Content-Type-Options', 'nosniff');
      res.header('X-Frame-Options', 'DENY');
      res.header('X-XSS-Protection', '1; mode=block');
      next();
    });

    // Enable CORS for production
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',') 
      : ['https://tez-social.vercel.app', 'http://localhost:3000'];
      
    app.enableCors({
      origin: allowedOrigins,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });

    // Handle shutdown signals
    process.on('SIGTERM', async () => {
      logger.log('SIGTERM signal received: closing HTTP server');
      await app.close();
      logger.log('HTTP server closed');
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.log('SIGINT signal received: closing HTTP server');
      await app.close();
      logger.log('HTTP server closed');
      process.exit(0);
    });

    const port = process.env.PORT || 3001;
    await app.listen(port);
    logger.log(`Application is running on port ${port}`);
    logger.log(`API Documentation available at: http://localhost:${port}/api`);
  } catch (error) {
    logger.error(`Error during bootstrap: ${error.message}`);
    logger.error(error.stack);
    process.exit(1);
  }
}

bootstrap();
