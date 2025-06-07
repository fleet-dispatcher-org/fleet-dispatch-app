import { PrismaClient } from "@prisma/client/extension";

export default function Prisma() {
    const prisma = new PrismaClient();
    return prisma;
}