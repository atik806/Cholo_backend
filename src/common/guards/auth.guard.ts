import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import {
  createSupabaseClient,
  createSupabaseAdminClient,
} from '../../config/supabase.config.js';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);
  private _supabase = createSupabaseClient();
  private _supabaseAdmin = createSupabaseAdminClient();

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Authentication token is required');
    }

    const {
      data: { user },
      error,
    } = await this._supabase.auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    let { data: profile } = await this._supabaseAdmin
      .from('profiles')
      .select('name, role')
      .eq('id', user.id)
      .single();

    if (!profile) {
      const name =
        (user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        user.email ??
        '').toString().slice(0, 100).replace(/[<>]/g, '');
      const avatar_url = typeof user.user_metadata?.avatar_url === 'string'
        ? user.user_metadata.avatar_url.slice(0, 500)
        : null;

      const { error: insertError } = await this._supabaseAdmin
        .from('profiles')
        .upsert(
          { id: user.id, name, email: user.email ?? '', avatar_url, role: 'customer' },
          { onConflict: 'id' },
        );

      if (insertError) {
        this.logger.error(`Failed to create OAuth profile: ${insertError.message}`);
      }

      profile = { name, role: 'customer' };
    }

    (
      request as Request & {
        user: { id: string; email: string; name: string; role: string };
      }
    ).user = {
      id: user.id,
      email: user.email ?? '',
      name: profile?.name ?? user.email ?? '',
      role: profile?.role ?? 'customer',
    };

    return true;
  }

  private extractToken(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) return undefined;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
