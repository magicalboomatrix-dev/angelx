import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@angelx.pro";
  const password = "AngelX@54321"; // In production, use environment variables or secure vaults for secrets

  const hashed = await bcrypt.hash(password, 10);

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (!existing) {
    await prisma.admin.create({
      data: { email, password: hashed },
    });
    console.log("Admin user created:", email);
  } else {
    // If admin exists but password is different (dev convenience), update hashed password
    await prisma.admin.update({ where: { email }, data: { password: hashed } });
    console.log("Admin exists. Password updated for:", email);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
