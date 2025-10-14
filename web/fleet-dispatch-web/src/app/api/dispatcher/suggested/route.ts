import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from "@/prisma/prisma";
export const dynamic = 'force-dynamic'
export async function GET() {
    const session = await auth();

    if (!session) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (session.user.role !== 'DISPATCHER' && session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

   try {
    const suggestedLoads = await prisma.load.findMany({
        where: {
            status: "SUGGESTED"
        },
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
    })

    return NextResponse.json(suggestedLoads)        
   } catch (error) {
    console.error(error);
    return NextResponse.json({ message: `Internal Server Error: ${error}` }, { status: 500 });
   }
}