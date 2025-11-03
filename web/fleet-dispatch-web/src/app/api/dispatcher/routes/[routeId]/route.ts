import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from "@/prisma/prisma";

export const dynamic = 'force-dynamic'

type RouteParams = {
    params: Promise<{
        routeId: string,
    }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        if(!session || session.user?.role != "DISPATCHER" && session.user?.role != "ADMIN") 
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        const { routeId } = await params;
        const route = await prisma.route.findUnique({ where: { id: routeId } });
        return NextResponse.json(route);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: `Internal Server Error: ${error}` }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        if(!session || session.user?.role != "DISPATCHER" && session.user?.role != "ADMIN") 
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        const { routeId } = await params;
        const body = await request.json();
        const updatedRoute = await prisma.route.update({ where: { id: routeId }, data: body });
        return NextResponse.json(updatedRoute);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: `Internal Server Error: ${error}` }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        if(!session || session.user?.role != "DISPATCHER" && session.user?.role != "ADMIN") 
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        const { routeId } = await params;
        await prisma.route.delete({ where: { id: routeId } });
        return NextResponse.json({ message: "Route deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: `Internal Server Error: ${error}` }, { status: 500 });
    }
}  