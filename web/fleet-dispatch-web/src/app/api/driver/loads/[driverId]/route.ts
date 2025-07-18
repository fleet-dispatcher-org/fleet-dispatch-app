import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/prisma/prisma'

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if(!session || session.user?.role != "DRIVER" ) 
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        const searchParams = new URL(req.url).searchParams;
        const driverId = searchParams.get('driverId') as string;
        const loads = await prisma.load.findMany({ where: { assigned_driver: driverId } });
        return NextResponse.json(loads, { status: 200 });
    } catch (error) {
        console.error('Error fetching loads:', error);
        return NextResponse.json({ message: 'Error fetching loads' }, { status: 500 });
    }
}