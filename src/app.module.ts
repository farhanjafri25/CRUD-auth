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
import { SocketController } from './socket/socket.controller';
import { AppGateway } from './socket/socket.gateway';
// import { AuthService } from './socket/auth.strategy';
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
      secret: `${process.env.JWT_SECRET_KEY}`,
    }),
    MongooseModule.forRoot(`${process.env.MONGO_URI}`),
    MongooseModule.forFeature([
      { name: `${process.env.MONGO_DB}`, schema: UserSchema },
    ]),
  ],
  controllers: [AppController, SocketController],
  providers: [AppService, AppRepository, JwtStrategy, AppGateway],
  exports: [JwtStrategy, PassportModule, AppGateway],
})
export class AppModule {}
