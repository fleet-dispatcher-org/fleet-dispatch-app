import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from "@/prisma/prisma";

export async function GET() {
    const session = await auth();

    if (!session) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (session.user.role !== 'DISPATCHER' && session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    try {
        const loads = await prisma.load.findMany({
            select: {
                id: true,
                origin: true,
                destination: true,
                due_by: true, 
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
        });

        return NextResponse.json(loads);
    } catch (error) {
        console.error('Error fetching loads:', error);
        return NextResponse.json({ error: 'Failed to fetch loads' }, { status: 500 });
    }
}