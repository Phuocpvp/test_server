import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import * as express from 'express';
async function bootstrap() {
   const app = await NestFactory.create(AppModule);
   app.enableCors({
      origin: (origin, callback) => {
         if (!origin || origin.startsWith(process.env.LOCALHOST)) {
            callback(null, true);
         } else {
            callback(new Error('Not allowed by CORS'));
         }
      },
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
   });
   app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));
   await app.listen(3000);
}
bootstrap();