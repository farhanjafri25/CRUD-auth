import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AppRepository } from './app.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly appRepository: AppRepository,
    private readonly jwtService: JwtService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'secretTokenBackend',
    });
  }
  async validate(payload: any): Promise<any> {
    const { id } = payload;
    const user = await this.appRepository.getUserById(id);
    if (!user) {
      throw new UnauthorizedException();
    }
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      age: user.age,
    };
  }
  async validateUser(payload: any) {
    // Validate the JWT token and return the user
    const decode = this.jwtService.verify(payload, {
      secret: 'secretTokenBackend',
    });
    console.log(decode);
    const { id } = decode;
    const user = await this.appRepository.getUserById(id);
    if (!user) {
      throw new UnauthorizedException();
    }
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      age: user.age,
    };
  }
}
