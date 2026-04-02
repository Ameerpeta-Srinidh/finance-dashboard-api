import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const databaseUrl = process.env.DATABASE_URL || "file:./dev.db";
const sqlitePath = databaseUrl.replace("file:", "");
const dbPath = path.isAbsolute(sqlitePath)
  ? sqlitePath
  : path.resolve(process.cwd(), sqlitePath.replace(/^\.\//, ""));

const adapter = new PrismaBetterSqlite3({
  url: dbPath,
});

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
