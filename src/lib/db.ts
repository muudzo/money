import { PrismaClient } from "@prisma/client";

/**
 * Prisma singleton. Next.js dev hot-reload would otherwise create a new client
 * on every reload and exhaust connections, so we cache it on globalThis.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
