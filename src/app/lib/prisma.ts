import "server-only";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// SQLite database file used in local development
const adapter = new PrismaBetterSqlite3({ url: "file:./prisma/dev.db" });

// In dev, Next.js hot-reload can re-run module code.
// Keep a single PrismaClient instance to avoid multiple connections/handles.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}