import { SetMetadata } from '@nestjs/common';
import { CACHE_TTL_KEY } from '../interceptors/http-cache.interceptor.js';

export const CacheTTL = (ttl: number) => SetMetadata(CACHE_TTL_KEY, ttl);
