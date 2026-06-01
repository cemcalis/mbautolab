import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS — allow frontend in dev and production
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://mbautolab-frontend.onrender.com',
    ],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log('====================================================');
  console.log(`🚀 MBAUTOLAB REST API is running on port: ${port}`);
  console.log('====================================================');
}
bootstrap();
