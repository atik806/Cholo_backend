import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface JwtUser {
  id: string;
  email: string;
  name?: string;
  role: string;
}

export const CurrentUser = createParamDecorator(
  (
    data: keyof JwtUser | undefined,
    ctx: ExecutionContext,
  ): JwtUser | string | undefined => {
    const request = ctx.switchToHttp().getRequest<{ user?: JwtUser }>();
    return data ? request.user?.[data] : request.user;
  },
);
