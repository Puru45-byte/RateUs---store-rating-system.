import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me/dashboard-stats')
  @ApiOperation({ summary: 'Get user dashboard overview metrics' })
  async getDashboardStats(@Request() req: any) {
    return this.usersService.getDashboardStats(req.user.id);
  }

  @Get('me/ratings')
  @ApiOperation({ summary: 'Get user rating history' })
  async getMyRatings(@Request() req: any) {
    return this.usersService.getMyRatings(req.user.id);
  }
}
