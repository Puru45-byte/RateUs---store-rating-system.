import { Body, Controller, HttpCode, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from '../common/dto/register.dto';
import { RegisterStoreOwnerDto } from '../common/dto/register-store-owner.dto';
import { ChangePasswordDto } from '../common/dto/change-password.dto';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty, ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

class LoginDto {
  @ApiProperty({ example: 'admin@trustrate.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new normal user account' })
  @ApiResponse({ status: 201, description: 'User created' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('register/store-owner')
  @ApiOperation({ summary: 'Register a new Store Owner account together with their store' })
  @ApiResponse({ status: 201, description: 'Store owner and store created' })
  async registerStoreOwner(@Body() dto: RegisterStoreOwnerDto) {
    return this.authService.registerStoreOwner(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in credentials to receive JWT' })
  @ApiResponse({ status: 200, description: 'JWT token returned' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change current password' })
  async changePassword(@Request() req: any, @Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.id, changePasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stateless logout' })
  async logout() {
    return { message: 'Logged out successfully' };
  }
}
