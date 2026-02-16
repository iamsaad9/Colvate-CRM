// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// We declare the global object type for Prisma
declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = globalThis.prisma || new PrismaClient();

// If we are not in production, we assign the client to the global object.
// This prevents creating too many connections in a development environment.
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;
