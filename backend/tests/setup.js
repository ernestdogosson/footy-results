import 'dotenv/config';
import { beforeEach, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';

process.env.AUTH_DISABLED = 'true';

const prisma = new PrismaClient();

beforeEach(async () => {
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "Report", "Match" RESTART IDENTITY CASCADE');
});

afterAll(async () => {
  await prisma.$disconnect();
});
