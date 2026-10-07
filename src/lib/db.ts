import 'server-only';
import { PrismaClient } from '@prisma/client';

// One client per server process (avoids exhausting connections during Next.js hot reload).
const g = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = g.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') g.prisma = prisma;
