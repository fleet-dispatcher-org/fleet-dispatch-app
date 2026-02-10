import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from "@/prisma/prisma";


export async function DELETE() {
    try {
        const session = await auth();
        if(!session || session.user?.role != "DISPATCHER" && session.user?.role != "ADMIN") 
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        await prisma.route.deleteMany({});
        return NextResponse.json({ message: "Suggestions cleared successfully" }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: `Internal Server Error: ${error}` }, { status: 500 });
    }
}