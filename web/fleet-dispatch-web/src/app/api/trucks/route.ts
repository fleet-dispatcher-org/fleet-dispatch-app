import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/prisma/prisma";

export const dynamic = 'force-dynamic'
export async function GET() {
    try {
        const session = await auth();
        if(!session || session.user?.role != "ADMIN") 
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const trucks = await prisma.truck.findMany({ 
            orderBy: {
                year: 'desc'
            }
         });

        return NextResponse.json(trucks);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: `Internal Server Error: ${error}` }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if(!session || session.user?.role != "ADMIN") 
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        const body = await request.json();
        const newTruck = await prisma.truck.create({ data: body });
        return NextResponse.json(newTruck);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: `Internal Server Error: ${error}` }, { status: 500 });
    }
}