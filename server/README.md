import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

dotenv? 

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@duzcehub.test';
  const exists = await prisma.user.findUnique({ where: { email } });
  if (!exists) {
    const hash = await bcrypt.hash('Admin123!', 10);
    await prisma.user.create({
      data: {
        email,
        password: hash,
        name: 'Kurucu',
        gender: 'Erkek',
        role: 'Kurucu',
        badges: 'DüzceHub Üye,DüzceHub Erkek,DüzceHub Kurucusu',
      },
    });
  }

  const roomCount = await prisma.chatRoom.count();
  if (roomCount === 0) {
    await prisma.chatRoom.create({ data: { name: 'Genel Sohbet', isPrivate: false } });
    await prisma.chatRoom.create({ data: { name: 'Erkek Sohbet', isPrivate: true } });
    await prisma.chatRoom.create({ data: { name: 'Kız Sohbet', isPrivate: true } });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
