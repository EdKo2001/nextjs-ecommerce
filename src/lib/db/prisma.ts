import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// export const prisma = globalForPrisma.prisma ?? new PrismaClient();
export const prisma = new PrismaClient().$extends({
  query: {
    cart: {
      async update({ args, query }) {
        args.data = { ...args.data, updatedAt: new Date() };
        return query(args);
      },
    },
  },
});

// if(process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
