import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const totalUsers = await this.prisma.user.count();
    const totalStores = await this.prisma.store.count();
    const totalRatings = await this.prisma.rating.count();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsers = await this.prisma.user.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });
    const newStores = await this.prisma.store.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });
    const newRatings = await this.prisma.rating.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });

    return {
      totalUsers,
      totalStores,
      totalRatings,
      deltas: {
        users: newUsers,
        stores: newStores,
        ratings: newRatings,
      },
    };
  }

  async getUsers(name?: string, email?: string, address?: string, role?: string) {
    const where: any = {};
    if (name) where.name = { contains: name, mode: 'insensitive' };
    if (email) where.email = { contains: email, mode: 'insensitive' };
    if (address) where.address = { contains: address, mode: 'insensitive' };
    if (role) where.role = role as any;

    const users = await this.prisma.user.findMany({
      where,
      include: {
        store: {
          include: {
            ratings: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return users.map((u) => {
      let storeRating = null;
      if (u.role === 'STORE_OWNER' && u.store) {
        const ratings = u.store.ratings;
        storeRating = ratings.length > 0
          ? parseFloat((ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length).toFixed(1))
          : 0;
      }
      const { password, ...userWithoutPassword } = u;
      return {
        ...userWithoutPassword,
        storeRating,
      };
    });
  }

  async getStores() {
    const stores = await this.prisma.store.findMany({
      include: {
        ratings: true,
        owner: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return stores.map((s) => {
      const ratings = s.ratings;
      const avgRating = ratings.length > 0
        ? parseFloat((ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length).toFixed(1))
        : 0;
      return {
        id: s.id,
        name: s.name,
        email: s.email,
        address: s.address,
        owner: s.owner
          ? { id: s.owner.id, name: s.owner.name, email: s.owner.email }
          : null,
        averageRating: avgRating,
        totalRatings: ratings.length,
      };
    });
  }

  async createUser(body: any) {
    // Basic Form validations
    if (!body.name || body.name.length < 20) {
      throw new BadRequestException('Name must be at least 20 characters long.');
    }
    if (!body.address || body.address.length > 400) {
      throw new BadRequestException('Address must be at most 400 characters long.');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!body.email || !emailRegex.test(body.email)) {
      throw new BadRequestException('Invalid email format.');
    }
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/;
    if (!body.password || !passwordRegex.test(body.password)) {
      throw new BadRequestException(
        'Password must be 8-16 characters long, contain at least one uppercase letter, and at least one special character.'
      );
    }

    const existingUser = await this.prisma.user.findUnique({ where: { email: body.email } });
    if (existingUser) {
      throw new BadRequestException('Email is already registered.');
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: body.name,
          email: body.email,
          address: body.address,
          password: hashedPassword,
          role: body.role,
        },
      });

      if (body.role === 'STORE_OWNER') {
        if (body.storeId) {
          // Attach to existing store
          await tx.store.update({
            where: { id: body.storeId },
            data: { ownerId: user.id },
          });
        } else if (body.newStore) {
          // Inline store creation validations
          if (!body.newStore.name || body.newStore.name.length < 20) {
            throw new BadRequestException('New store name must be at least 20 characters long.');
          }
          if (!body.newStore.address || body.newStore.address.length > 400) {
            throw new BadRequestException('New store address must be at most 400 characters long.');
          }
          if (!body.newStore.email || !emailRegex.test(body.newStore.email)) {
            throw new BadRequestException('Invalid store email format.');
          }

          const existingStore = await tx.store.findUnique({ where: { email: body.newStore.email } });
          if (existingStore) {
            throw new BadRequestException('Store email is already registered.');
          }

          await tx.store.create({
            data: {
              name: body.newStore.name,
              email: body.newStore.email,
              address: body.newStore.address,
              ownerId: user.id,
            },
          });
        }
      }

      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  async createStore(body: any) {
    if (!body.name || body.name.length < 20) {
      throw new BadRequestException('Store name must be at least 20 characters long.');
    }
    if (!body.address || body.address.length > 400) {
      throw new BadRequestException('Store address must be at most 400 characters long.');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!body.email || !emailRegex.test(body.email)) {
      throw new BadRequestException('Invalid store email format.');
    }

    const existingStore = await this.prisma.store.findUnique({ where: { email: body.email } });
    if (existingStore) {
      throw new BadRequestException('Store email is already registered.');
    }

    if (body.ownerId) {
      const owner = await this.prisma.user.findUnique({ where: { id: body.ownerId } });
      if (!owner) {
        throw new BadRequestException('Selected owner user not found.');
      }
      if (owner.role !== 'STORE_OWNER') {
        throw new BadRequestException('Selected owner user must have STORE_OWNER role.');
      }
      const ownedStore = await this.prisma.store.findFirst({ where: { ownerId: body.ownerId } });
      if (ownedStore) {
        throw new BadRequestException('Selected owner user already owns another store.');
      }
    }

    return this.prisma.store.create({
      data: {
        name: body.name,
        email: body.email,
        address: body.address,
        ownerId: body.ownerId || null,
      },
    });
  }
}
