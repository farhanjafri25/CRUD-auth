import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { UserSchema } from './model/user.model';
import { AppRepository } from './app.repository';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
const envPath = path.join(
  process.cwd(),
  process.env.NODE_ENV ? `envs/.env.${process.env.NODE_ENV}` : `/.env`,
);
dotenv.config({
  path: envPath,
});

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'secretTokenBackend',
    }),
    MongooseModule.forRoot(`mongodb://localhost:27017/users_data`),
    MongooseModule.forFeature([{ name: 'users_data', schema: UserSchema }]),
  ],
  controllers: [AppController],
  providers: [AppService, AppRepository, JwtStrategy],
  exports: [JwtStrategy, PassportModule],
})
export class AppModule {}
