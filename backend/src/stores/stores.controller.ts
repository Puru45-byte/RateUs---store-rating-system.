import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { StoresService } from './stores.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Stores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stores')
export class StoresController {
  constructor(private storesService: StoresService) {}

  @Get('owner/dashboard')
  @ApiOperation({ summary: 'Get store owner dashboard metrics' })
  async getOwnerDashboard(@Request() req: any) {
    return this.storesService.getOwnerDashboard(req.user.id);
  }

  @Get('me/ratings')
  @ApiOperation({ summary: 'Get all ratings submitted for the logged-in owner\'s store' })
  async getStoreRatings(@Request() req: any) {
    return this.storesService.getStoreRatings(req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get list of stores with optional filters' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term for name or address' })
  @ApiQuery({ name: 'category', required: false, description: 'Category pill filter' })
  @ApiQuery({ name: 'featured', required: false, description: 'Return top-rated stores only' })
  async getStores(
    @Request() req: any,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('featured') featured?: string,
  ) {
    return this.storesService.findAll(search, category, featured, req.user.id);
  }
}
