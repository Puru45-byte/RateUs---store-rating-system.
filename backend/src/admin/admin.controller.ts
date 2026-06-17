import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get overall system stats' })
  async getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'Get list of users with filters' })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'email', required: false })
  @ApiQuery({ name: 'address', required: false })
  @ApiQuery({ name: 'role', required: false })
  async getUsers(
    @Query('name') name?: string,
    @Query('email') email?: string,
    @Query('address') address?: string,
    @Query('role') role?: string,
  ) {
    return this.adminService.getUsers(name, email, address, role);
  }

  @Get('stores')
  @ApiOperation({ summary: 'Get list of stores' })
  async getStores() {
    return this.adminService.getStores();
  }

  @Post('users')
  @ApiOperation({ summary: 'Create a new user' })
  async createUser(@Body() body: any) {
    return this.adminService.createUser(body);
  }

  @Post('stores')
  @ApiOperation({ summary: 'Create a new store' })
  async createStore(@Body() body: any) {
    return this.adminService.createStore(body);
  }
}
