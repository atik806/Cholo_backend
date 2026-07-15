import {
  Injectable,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of, tap } from 'rxjs';
import { Response } from 'express';

export const CACHE_TTL_KEY = 'cache_ttl';

@Injectable()
export class HttpCacheInterceptor {
  private readonly logger = new Logger(HttpCacheInterceptor.name);
  private memoryCache = new Map<string, { data: unknown; expiry: number }>();

  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ttl = this.reflector.get<number>(CACHE_TTL_KEY, context.getHandler());
    if (ttl === undefined) {
      return next.handle();
    }

    const cacheKey = this.generateKey(context);
    const now = Date.now();
    const cached = this.memoryCache.get(cacheKey);

    if (cached && cached.expiry > now) {
      const response = context.switchToHttp().getResponse<Response>();
      response.setHeader('X-Cache', 'HIT');
      response.setHeader(
        'Cache-Control',
        `public, max-age=${Math.ceil((cached.expiry - now) / 1000)}`,
      );
      return of(cached.data);
    }

    return next.handle().pipe(
      tap((data) => {
        this.memoryCache.set(cacheKey, { data, expiry: now + ttl * 1000 });

        const response = context.switchToHttp().getResponse<Response>();
        response.setHeader('X-Cache', 'MISS');
        response.setHeader('Cache-Control', `public, max-age=${ttl}`);
        response.setHeader('Vary', 'Accept-Encoding');
      }),
    );
  }

  private generateKey(context: ExecutionContext): string {
    const request = context.switchToHttp().getRequest();
    return `${request.method}:${request.url}`;
  }
}
