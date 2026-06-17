import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Clearing database...');
  await prisma.rating.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 10);

  console.log('Seeding users...');
  // 1 Admin
  const admin = await prisma.user.create({
    data: {
      name: 'System Administrator',
      email: 'admin@trustrate.com',
      password: passwordHash,
      address: '123 Admin Headquarter St, San Francisco, CA',
      role: Role.ADMIN,
    },
  });

  // 5 Normal Users
  const normalUsers = [];
  for (let i = 1; i <= 5; i++) {
    const user = await prisma.user.create({
      data: {
        name: `Normal User ${i}`,
        email: `user${i}@trustrate.com`,
        password: passwordHash,
        address: `${100 + i} Quiet Residential Rd, Seattle, WA`,
        role: Role.USER,
      },
    });
    normalUsers.push(user);
  }

  // 6 Stores & 6 Owners
  const stores = [];
  const storeNames = [
    'SuperMart Grocery',
    'TechWorld Electronics',
    'Cafe Delight',
    'Active Life Sports',
    'Fashion Hub Boutique',
    'Green & Fresh Florals',
  ];

  for (let i = 1; i <= 6; i++) {
    const owner = await prisma.user.create({
      data: {
        name: `Store Owner ${i}`,
        email: `owner${i}@trustrate.com`,
        password: passwordHash,
        address: `${200 + i} Commercial Blvd, New York, NY`,
        role: Role.STORE_OWNER,
      },
    });

    const store = await prisma.store.create({
      data: {
        name: storeNames[i - 1],
        email: `contact@${storeNames[i - 1].toLowerCase().replace(/\s+/g, '')}.com`,
        address: `${500 + i} Shopping Plaza Ave, Chicago, IL`,
        ownerId: owner.id,
      },
    });
    stores.push(store);
  }

  console.log('Seeding ratings...');
  const allOwners = await prisma.user.findMany({ where: { role: Role.STORE_OWNER } });
  const allUsers = [admin, ...normalUsers, ...allOwners];
  let ratingCount = 0;
  const targetRatings = 40;
  
  const generatedPairs = new Set<string>();

  while (ratingCount < targetRatings) {
    const user = allUsers[Math.floor(Math.random() * allUsers.length)];
    const store = stores[Math.floor(Math.random() * stores.length)];
    const pairKey = `${user.id}-${store.id}`;

    if (!generatedPairs.has(pairKey)) {
      generatedPairs.add(pairKey);
      await prisma.rating.create({
        data: {
          value: Math.floor(Math.random() * 5) + 1,
          userId: user.id,
          storeId: store.id,
        },
      });
      ratingCount++;
    }
  }

  console.log(`Database seeding completed!`);
  console.log(`- Created Admin: 1`);
  console.log(`- Created Users: ${allUsers.length}`);
  console.log(`- Created Stores: ${stores.length}`);
  console.log(`- Created Ratings: ${ratingCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
