import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AppRepository } from './app.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly appRepository: AppRepository) {
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
}
