import { PrismaClient } from '@prisma/client'

// Use direct URL for migration
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
})

async function createUsersTable() {
  try {
    console.log('Creating users table...')

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        "tipsShown" JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `)

    console.log('✓ Users table created successfully!')
  } catch (error) {
    console.error('Failed to create users table:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createUsersTable()
