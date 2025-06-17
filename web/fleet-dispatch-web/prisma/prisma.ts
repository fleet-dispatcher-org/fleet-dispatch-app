import { PrismaClient } from "@prisma/client";
import { Return } from "@prisma/client/runtime/library";

let prisma: PrismaClient;

const prismaClientSingelton = () => {
 prisma = new PrismaClient();

 return prisma
}

declare const globalThis: {
  prismaGlobal : ReturnType<typeof prismaClientSingelton>;
} & typeof global; 

prisma = globalThis.prismaGlobal ?? prismaClientSingelton();

export default prisma;