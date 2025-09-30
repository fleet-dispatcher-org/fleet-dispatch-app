import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/prisma/prisma'

interface RouteParams {
    params: {
        loadId: string
        truckId: string
    }
    loadId: string
    truckId: string
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { loadId, truckId } = await params;
        await prisma.load.update({
            where: { id: loadId },
            data: { assigned_truck: truckId },
        });
        return NextResponse.json({ message: "Truck assigned successfully" }, { status: 200 });
    } catch (error) {
        console.error('Error assigning truck to load:', error);
        return NextResponse.json({ message: "Error assigning truck to load" }, { status: 500 });
    }
}