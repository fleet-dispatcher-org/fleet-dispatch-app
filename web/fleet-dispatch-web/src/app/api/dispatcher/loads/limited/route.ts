import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/prisma/prisma'

export const dynamic = 'force-dynamic'
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const limit_string = searchParams.get('limit');
    const random = searchParams.get('random');

    const limit = limit_string ? parseInt(limit_string) : 5;

    try {
        const session = await auth();
        if(!session || session.user?.role != "DISPATCHER" && session.user?.role != "ADMIN") 
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

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
                started_at: 'desc'
            },
            take: limit,
            skip: random ? Math.floor(Math.random() * (await prisma.load.count())) : 0,
         });

        return NextResponse.json(loads);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch loads' }, { status: 500 });
    }
}