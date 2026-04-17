const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

// Handle connection errors gracefully
prisma.$on('error', (e) => {
  console.error('Prisma error:', e);
});

// Test database connection on startup
async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    // Don't exit process - let the app retry connections on requests
  }
}

testConnection();

module.exports = prisma;
