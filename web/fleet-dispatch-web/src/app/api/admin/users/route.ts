import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import prisma from "@/prisma/prisma";

export async function GET() {
    try {
        const session = await auth();
        if(!session || session.user?.role != "ADMIN") 
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const users = await prisma.user.findMany({ 
            orderBy: {
                createdAt: 'desc'
            }
         });

        return NextResponse.json(users);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: `Internal Server Error: ${error}` }, { status: 500 });
    }
}
