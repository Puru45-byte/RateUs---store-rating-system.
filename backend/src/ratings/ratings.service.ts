import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RatingsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, storeId: string, value: number, comment?: string) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });
    if (!store) {
      throw new NotFoundException('Store not found');
    }

    const existingRating = await this.prisma.rating.findUnique({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
    });

    if (existingRating) {
      return this.prisma.rating.update({
        where: { id: existingRating.id },
        data: { value, comment },
      });
    }

    return this.prisma.rating.create({
      data: {
        userId,
        storeId,
        value,
        comment,
      },
    });
  }

  async update(userId: string, ratingId: string, value: number, comment?: string) {
    const rating = await this.prisma.rating.findUnique({
      where: { id: ratingId },
    });

    if (!rating) {
      throw new NotFoundException('Rating not found');
    }

    if (rating.userId !== userId) {
      throw new ConflictException('You can only modify your own ratings');
    }

    return this.prisma.rating.update({
      where: { id: ratingId },
      data: { value, comment },
    });
  }
}
