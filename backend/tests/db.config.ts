import dotenv from 'dotenv'
import path from 'path'
import { PrismaClient } from '../src/generated/prisma/client.js'
import pg from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

dotenv.config({
  path: path.resolve(process.cwd(), '.env.test'),
})

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error('Missing DATABASE_TEST_URL in .env.test')
  }

  const pool = new pg.Pool({
    connectionString,
    ssl: false,
  })

  const adapter = new PrismaPg(pool)

  return new PrismaClient({
    adapter,
    log: ['warn', 'error'],
  })
}

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma