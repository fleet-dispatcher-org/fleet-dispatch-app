import { NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { auth } from "@/auth";

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const session = await auth();
        
        if(!session || session.user?.role != "DISPATCHER" && session.user?.role != "ADMIN") 
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const drivers = await prisma.driver.findMany();
        return NextResponse.json({ drivers });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: `Internal Server Error: ${error}` }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if(!session || session.user?.role != "DISPATCHER" && session.user?.role != "ADMIN") 
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        const body = await request.json();
        const newDriver = await prisma.driver.create({ data: body });
        return NextResponse.json(newDriver);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: `Internal Server Error: ${error}` }, { status: 500 });
    }
}

