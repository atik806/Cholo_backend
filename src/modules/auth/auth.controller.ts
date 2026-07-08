import { Controller, Post, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { JwtUser } from '../../common/decorators/current-user.decorator.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { RegisterSchema, type RegisterDto } from './dto/register.dto.js';
import { LoginSchema, type LoginDto } from './dto/login.dto.js';
import {
  UpdateProfileSchema,
  type UpdateProfileDto,
} from './dto/update-profile.dto.js';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(
    @Body(new ZodValidationPipe(RegisterSchema)) dto: RegisterDto,
  ) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body(new ZodValidationPipe(LoginSchema)) dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser() user: JwtUser) {
    return this.authService.getProfile(user.id);
  }

  @Patch('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  async updateProfile(
    @CurrentUser() user: JwtUser,
    @Body(new ZodValidationPipe(UpdateProfileSchema)) updates: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(user.id, updates);
  }
}
