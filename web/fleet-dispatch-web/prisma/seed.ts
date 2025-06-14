import { PrismaClient } from "@prisma/client/extension";
const prisma = new PrismaClient();
const seed = async () => {
    await prisma.User.createMany({data: [
        {},
    ]});
}