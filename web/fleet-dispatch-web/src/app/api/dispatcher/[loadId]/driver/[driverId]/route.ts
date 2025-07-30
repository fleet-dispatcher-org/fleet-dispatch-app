import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/prisma/prisma'

interface RouteParams {
    params: {
        loadId: string
        driverId: string
    }
    loadId: string
    driverId: string
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        const { loadId, driverId } = await params;
        await prisma.load.update({
            where: { id: loadId },
            data: { assigned_driver: driverId },
        });
        return NextResponse.json({ message: "Driver assigned successfully" }, { status: 200 });
    } catch (error) {
        console.error('Error assigning driver to load:', error);
        return NextResponse.json({ message: "Error assigning driver to load" }, { status: 500 });
    }
}