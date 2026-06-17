import { Controller, Post, Patch, Body, Param, Request, UseGuards } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { IsNotEmpty, IsUUID, IsInt, Min, Max, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

class CreateRatingDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  storeId: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  value: number;

  @ApiProperty({ example: 'Great customer service and nice ambience!', required: false })
  @IsString()
  @IsOptional()
  comment?: string;
}

class UpdateRatingDto {
  @ApiProperty({ example: 4, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  value: number;

  @ApiProperty({ example: 'Updated comment details.', required: false })
  @IsString()
  @IsOptional()
  comment?: string;
}

@ApiTags('Ratings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.USER)
@Controller('ratings')
export class RatingsController {
  constructor(private ratingsService: RatingsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a new store rating or update existing' })
  @ApiResponse({ status: 201, description: 'Rating recorded' })
  async createRating(@Request() req: any, @Body() dto: CreateRatingDto) {
    return this.ratingsService.create(req.user.id, dto.storeId, dto.value, dto.comment);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modify an existing rating' })
  @ApiResponse({ status: 200, description: 'Rating updated' })
  async updateRating(
    @Request() req: any,
    @Param('id') ratingId: string,
    @Body() dto: UpdateRatingDto,
  ) {
    return this.ratingsService.update(req.user.id, ratingId, dto.value, dto.comment);
  }
}
