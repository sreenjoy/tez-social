import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // Set global prefix but exclude Google OAuth routes
  app.setGlobalPrefix('api', {
    exclude: [
      'auth/google',
      'auth/google/callback',
    ],
  });

  // Enable CORS
  app.enableCors();

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
  logger.log(`Production server running on port ${port}`);
  logger.log(`Auth routes available at: http://localhost:${port}/auth/google and http://localhost:${port}/auth/google/callback`);
}
bootstrap();
