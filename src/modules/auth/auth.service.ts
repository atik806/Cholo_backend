import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import type { RegisterDto } from './dto/register.dto.js';
import type { LoginDto } from './dto/login.dto.js';
import type { UpdateProfileDto } from './dto/update-profile.dto.js';
import {
  createSupabaseClient,
  createSupabaseAdminClient,
} from '../../config/supabase.config.js';

@Injectable()
export class AuthService {
  private supabase = createSupabaseClient();
  private supabaseAdmin = createSupabaseAdminClient();

  async register(dto: RegisterDto) {
    const { data: authData, error: authError } =
      await this.supabase.auth.signUp({
        email: dto.email,
        password: dto.password,
      });

    if (authError) {
      if (
        authError.message.includes('already registered') ||
        authError.message.includes('already exists')
      ) {
        throw new ConflictException('Email already registered');
      }
      throw new InternalServerErrorException(authError.message);
    }

    const userId = authData.user?.id;
    if (!userId) {
      throw new InternalServerErrorException('Failed to create user');
    }

    const { error: profileError } = await this.supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        name: dto.name,
        email: dto.email,
        role: 'customer',
      });

    if (profileError) {
      await this.supabaseAdmin.auth.admin.deleteUser(userId);
      throw new InternalServerErrorException('Failed to create profile');
    }

    return {
      user: {
        id: userId,
        email: dto.email,
        name: dto.name,
        role: 'customer',
      },
      session: authData.session
        ? {
            access_token: authData.session.access_token,
            refresh_token: authData.session.refresh_token,
            expires_at: authData.session.expires_at,
          }
        : null,
      message:
        'Registration successful. Please check your email to confirm your account.',
    };
  }

  async login(dto: LoginDto) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const user = data.user;

    const { data: profile } = await this.supabaseAdmin
      .from('profiles')
      .select('name, role')
      .eq('id', user.id)
      .single();

    return {
      user: {
        id: user.id,
        email: user.email,
        name: profile?.name || user.email,
        role: profile?.role || 'customer',
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
    };
  }

  async getProfile(userId: string) {
    const { data: profile, error } = await this.supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      throw new UnauthorizedException('User not found');
    }

    return profile;
  }

  async updateProfile(
    userId: string,
    updates: UpdateProfileDto,
  ) {
    const { data, error } = await this.supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException('Failed to update profile');
    }

    return data;
  }
}
