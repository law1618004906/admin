import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function seed() {
  console.log('Seeding database...');
  console.log('✅ Database seeded successfully (empty seed for simplified system)');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
