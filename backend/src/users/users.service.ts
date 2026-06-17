import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(userId: string) {
    const storesCount = await this.prisma.store.count();
    const myRatingsCount = await this.prisma.rating.count({
      where: { userId },
    });
    const avgRating = await this.prisma.rating.aggregate({
      where: { userId },
      _avg: {
        value: true,
      },
    });

    const averageGiven = avgRating._avg.value ? parseFloat(avgRating._avg.value.toFixed(1)) : 0;
    const reviewsHelped = myRatingsCount * 100;

    return {
      storesExplored: storesCount,
      myRatings: myRatingsCount,
      averageGiven: averageGiven,
      reviewsHelped: reviewsHelped,
    };
  }

  async getMyRatings(userId: string) {
    return this.prisma.rating.findMany({
      where: { userId },
      include: {
        store: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }
}
