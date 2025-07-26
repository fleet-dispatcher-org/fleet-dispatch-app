import { NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { auth } from "@/auth";

export async function GET(request: Request) {
    try {
        const session = await auth();
        
        if(!session || session.user?.role != "DISPATCHER" && session.user?.role != "ADMIN") 
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const drivers = await prisma.driver.findMany({ where: { driver_status: "AVAILABLE" } });
        return NextResponse.json({ drivers });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: `Internal Server Error: ${error}` }, { status: 500 });
    }
}
