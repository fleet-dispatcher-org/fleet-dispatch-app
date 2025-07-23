import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/prisma/prisma'

interface RouteParams {
    params: {
        driverId: string;
    };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        
        if(!session) 
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        
        const { driverId } = await params;
        const loads = await prisma.load.findMany({ where: { assigned_driver: driverId } });
        
        return NextResponse.json(loads, { status: 200 });
    } catch (error) {
        console.error('Error fetching loads:', error);
        return NextResponse.json({ message: 'Error fetching loads' }, { status: 500 });
    }
}