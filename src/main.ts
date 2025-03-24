import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable CORS
  const corsOrigin = configService.get<string>('app.corsOrigin') || '*';
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  // Enable validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // Set global prefix
  app.setGlobalPrefix('api');

  // Add health check endpoint
  app.getHttpAdapter().get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  const port = configService.get<number>('app.port') || 3001;
  await app.listen(port);
  
  console.log('-----------------------------------');
  console.log(`Environment: ${configService.get('app.nodeEnv') || 'development'}`);
  console.log(`Server running on port: ${port}`);
  console.log(`API URL: ${configService.get('app.apiUrl') || `http://localhost:${port}`}`);
  console.log('-----------------------------------');
}
bootstrap(); 