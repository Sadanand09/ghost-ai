import { PrismaClient } from '@/app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

function normalizeSslMode(rawUrl: string): string {
  try {
    const url = new URL(rawUrl)
    const mode = url.searchParams.get('sslmode')
    if (mode === 'prefer' || mode === 'require' || mode === 'verify-ca') {
      url.searchParams.set('sslmode', 'verify-full')
    }
    return url.toString()
  } catch {
    return rawUrl
  }
}

function createPrismaClient() {
  const url = process.env.DATABASE_URL ?? ''
  if (url.startsWith('prisma+postgres://')) {
    return new PrismaClient({ accelerateUrl: url })
  }
  const adapter = new PrismaPg(normalizeSslMode(url))
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
