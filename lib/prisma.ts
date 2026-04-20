import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

let _prisma: PrismaClient | undefined;

function getPrisma() {
  if (_prisma) return _prisma;

  if (globalThis.prisma) {
    _prisma = globalThis.prisma;
    return _prisma;
  }

  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL || "postgres://localhost/placeholder",
  });

  _prisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

  if (process.env.NODE_ENV !== "production") {
    globalThis.prisma = _prisma;
  }

  return _prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    const client = getPrisma();
    const value = client[prop as keyof PrismaClient];
    if (typeof value === "function") {
      return (value as Function).bind(client);
    }
    return value;
  },
});
