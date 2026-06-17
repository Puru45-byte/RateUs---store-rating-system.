import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from '../common/dto/register.dto';
import { RegisterStoreOwnerDto } from '../common/dto/register-store-owner.dto';
import { ChangePasswordDto } from '../common/dto/change-password.dto';
import { Role } from '@prisma/client';
import { exclude } from '../common/utils/exclude';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email address already in use');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: registerDto.name,
        email: registerDto.email,
        password: hashedPassword,
        address: registerDto.address,
        role: Role.USER,
      },
    });

    return exclude(user, ['password']);
  }

  async registerStoreOwner(dto: RegisterStoreOwnerDto) {
    // Check for existing owner email
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.ownerEmail },
    });
    if (existingUser) {
      throw new ConflictException('Owner email address is already in use');
    }

    // Check for existing store email
    const existingStore = await this.prisma.store.findFirst({
      where: { email: dto.storeEmail },
    });
    if (existingStore) {
      throw new ConflictException('Store email address is already in use');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create owner and store together
    const owner = await this.prisma.user.create({
      data: {
        name: dto.ownerName,
        email: dto.ownerEmail,
        password: hashedPassword,
        address: dto.ownerAddress,
        role: Role.STORE_OWNER,
      },
    });

    await this.prisma.store.create({
      data: {
        name: dto.storeName,
        email: dto.storeEmail,
        address: dto.storeAddress,
        ownerId: owner.id,
      },
    });

    return exclude(owner, ['password']);
  }

  async login(loginDto: any) {
    const { email, password } = loginDto;
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        store: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    const profile: any = exclude(user, ['password']);
    
    let storeId: string | null = null;
    if (user.role === Role.STORE_OWNER && user.store) {
      storeId = user.store.id;
    }

    return {
      accessToken,
      user: {
        ...profile,
        ...(storeId && { storeId }),
      },
    };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await bcrypt.compare(changePasswordDto.oldPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Current password does not match');
    }

    const newHashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: newHashedPassword },
    });

    return { message: 'Password changed successfully' };
  }
}
