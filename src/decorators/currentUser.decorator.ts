import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { UserToken } from '../types/user.type';

export const GetCurrentUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user: UserToken = request.user || request.headers.user;
    console.log('user', user);
    if (user === null) {
      throw new ForbiddenException('Not found');
    }
    if (!user) return null;
    if (!data) return user;
    user['token'] = request.headers;
    return user[data];
  },
);
