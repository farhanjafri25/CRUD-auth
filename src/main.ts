import * as dotenv from 'dotenv';
import * as path from 'path';
const envPath = path.join(
  process.cwd(),
  process.env.NODE_ENV ? `envs/.env.${process.env.NODE_ENV}` : `/.env`,
);
dotenv.config({
  path: envPath,
});

const redisURL = `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;
console.log({ redisURL });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/user');
  await app.listen(3000);
}
bootstrap();
