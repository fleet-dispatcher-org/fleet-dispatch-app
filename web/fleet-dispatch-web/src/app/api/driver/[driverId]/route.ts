import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/prisma/prisma'

interface RouteParams {
    params: {
        driverId: string
    }
    driverId: string
}

export async function PATCH(request: NextRequest, { params } : RouteParams) {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { driverId } = await params;
        
        await prisma.driver.update({
            where: { id: driverId },
            data: await request.json(),
        });

        return NextResponse.json({ message: "Driver updated successfully" }, { status: 200 });
    } catch (error) {
        console.error('Error updating driver:', error);
        return NextResponse.json({ message: "Error updating driver" }, { status: 500 });
    }
}
