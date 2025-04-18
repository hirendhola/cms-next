// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Check if TEMP institution already exists
  const existingTemp = await prisma.institution.findUnique({
    where: {
      code: 'TEMP'
    }
  });

  // Only create if it doesn't exist
  if (!existingTemp) {
    await prisma.institution.create({
      data: {
        name: 'Temporary Institution',
        code: 'TEMP',
        country: 'Global',
      }
    });
    console.log('Created TEMP institution for initial user signup');
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });