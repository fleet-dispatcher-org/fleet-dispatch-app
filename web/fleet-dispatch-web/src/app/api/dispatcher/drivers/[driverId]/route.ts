import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/prisma/prisma'
import { Route } from 'next';

interface RouteParams {
    params: { 
        driverId: string,
    };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        
        if (!session) {
            return NextResponse.json({ message: "Session not found" }, { status: 401 });
        }
        if(session?.user?.role !== "DISPATCHER" && session?.user?.role !== "ADMIN") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const { driverId } = await params;
        const driver = await prisma.driver.findUnique({ where: { id: driverId } });
        return NextResponse.json(driver, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: `Internal Server Error: ${error}` }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
         const { driverId } = await params;
        
        if(session?.user?.id !== driverId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const body = await request.json();
        const updatedDriver = await prisma.driver.update({ where: { id: driverId }, data: body });
        return NextResponse.json(updatedDriver, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: `Internal Server Error: ${error}` }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        if(!session || session.user?.role != "DISPATCHER" && session.user?.role != "ADMIN") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const { driverId } = await params;
        const body = await request.json();
        const updatedDriver = await prisma.driver.update({ where: { id: driverId }, data: body });
        return NextResponse.json(updatedDriver, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: `Internal Server Error: ${error}` }, { status: 500 });
    }
}

export async function DELETE({params}: RouteParams) {
    try {
        const session = await auth();
        if(!session || session.user?.role != "DISPATCHER" && session.user?.role != "ADMIN") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const { driverId } = await params;
        await prisma.driver.delete({ where: { id: driverId } });
        return NextResponse.json({ message: "Driver deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: `Internal Server Error: ${error}` }, { status: 500 });
    }
}