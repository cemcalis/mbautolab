import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend communication in development
  app.enableCors();
  
  await app.listen(3001);
  console.log('====================================================');
  console.log('🚀 MBAUTOLAB REST API is running on: http://localhost:3001');
  console.log('====================================================');
}
bootstrap();
