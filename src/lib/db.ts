import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const getPrismaClient = () => {
  const dbUrl = process.env.DATABASE_URL || "";
  
  if (dbUrl.startsWith("prisma+postgres://")) {
    return new PrismaClient({
      accelerateUrl: dbUrl,
    });
  }

  // Use driver adapter for direct PostgreSQL connections
  const pool = new Pool({ connectionString: dbUrl });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

export const db = globalForPrisma.prisma || getPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
