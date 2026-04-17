const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Seed admin user
  const adminEmail = process.env.ADMIN_DEFAULT_EMAIL || 'admin@angelx.com';
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@123456';
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Super Admin',
      role: 'admin',
    },
  });

  // Seed default system settings
  const defaultSettings = [
    { key: 'referral_reward_amount', value: '5' },
    { key: 'min_deposit', value: '100' },
    { key: 'min_withdrawal', value: '50' },
    { key: 'min_sell', value: '10' },
    { key: 'min_cmd', value: '500' },
    { key: 'min_imps', value: '100' },
    { key: 'usdt_rate', value: '102' },
    { key: 'cmd_rate', value: '102' },
    { key: 'imps_rate', value: '102' },
    { key: 'trc20_wallet_address', value: 'TG25WAjnbAjdqCZrBtrAinU8EsQ6smu47L' },
    { key: 'trc20_qr_url', value: '/images/trc20.png' },
    { key: 'bep20_wallet_address', value: '0xd7d565e4f58d832c07f0bf1d04290dff4104247a' },
    { key: 'bep20_qr_url', value: '/images/bep20.jpg' },
  ];

  for (const setting of defaultSettings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
