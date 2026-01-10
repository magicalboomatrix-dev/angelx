import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const email = "admin@angelxsuper.com";
  const password = "Admin@123";

  const hashed = await bcrypt.hash(password, 10);

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (!existing) {
    await prisma.admin.create({
      data: { email, password: hashed },
    });
    console.log("✅ Admin user created:", email);
  } else {
    await prisma.admin.update({ where: { email }, data: { password: hashed } });
    console.log("✅ Admin exists. Password updated for:", email);
  }

  // Create default settings if they don't exist
  const settings = await prisma.settings.findFirst();
  if (!settings) {
    await prisma.settings.create({
      data: {
        rate: 102,
        withdrawMin: 50,
        depositMin: 100,
        trc20Address: "TU7f7jwJr56owuutyzbJEwVqF3ii4KCiPV",
        erc20Address: "0x78845f99b319b48393fbcde7d32fcb7ccd6661bf",
        trc20QrUrl: "images/trc20.png",
        erc20QrUrl: "images/erc20.png",
      },
    });
    console.log("✅ Default settings created");
  } else {
    console.log("✅ Settings already exist");
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });

