import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_SEED_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD;

  if (!password) {
    throw new Error("ADMIN_SEED_PASSWORD is required to seed the admin account");
  }

  const hashed = await bcrypt.hash(password, 10);

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (!existing) {
    await prisma.admin.create({
      data: { email, password: hashed },
    });
    console.log("Admin user created:", email);
  } else {
    console.log("Admin already exists:", email);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
