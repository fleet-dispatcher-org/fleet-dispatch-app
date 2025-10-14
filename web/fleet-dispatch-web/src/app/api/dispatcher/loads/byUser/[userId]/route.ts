import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import prisma from "@/prisma/prisma";
export const dynamic = 'force-dynamic'
type RouteParams = {
    params: Promise<{
        userId: string;
    }>;
}
export async function GET(request: NextRequest, { params }: RouteParams) {

    const session = await auth();

    if (!session) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (session.user.role !== "DISPATCHER" && session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const { userId } = await params;
        const loads = await prisma.load.findMany({
            select: {
                id: true,
                origin: true,
                destination: true,
                weight: true,
                status: true,
                started_at: true,
                assigned_driver: true,
                assigned_trailer: true,
                assigned_truck: true,
                percent_complete: true,
                is_active: true,
            },
            orderBy: {
                started_at: "desc",
            },
            where: {
                assigned_driver: userId,
            },
        });
        return NextResponse.json(loads);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: `Internal Server Error: ${error}` }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { userId } = await params;
        const body = await request.json();
        const updatedDriver = await prisma.driver.update({ where: { id: userId }, data: body });
        return NextResponse.json(updatedDriver, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: `Internal Server Error: ${error}` }, { status: 500 });
    }
}