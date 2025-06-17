import prisma from "../../../../prisma/prisma";
import cuid from "cuid";

export async function getUser(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return user;
}

export async function getUserByEmail(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    return user;
}

export async function createUser(email: string) {
    const existingUser = await getUserByEmail(email);
    if (existingUser) return existingUser;
    
    const cuidId = cuid();
    const user = await prisma.user.create({ data: { email } });
    return user;
}

export async function getAllUsers() {
    const users = await prisma.user.findMany({ orderBy: { name: "asc" } });
    return users;
}