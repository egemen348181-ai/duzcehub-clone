import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@duzcehub.test';
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const hashed = await bcrypt.hash('Admin123!', 10);
    await prisma.user.create({ data: { email: adminEmail, password: hashed, name: 'Admin', isAdmin: true } });
    console.log('Admin user created:', adminEmail, 'password: Admin123!');
  }

  const u = await prisma.user.findFirst();
  if (u) {
    await prisma.post.create({ data: { content: 'Hoş geldin DüzceHUB! Bu başlangıç postudur.', authorId: u.id } });
    console.log('Seed post created');
  }
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
