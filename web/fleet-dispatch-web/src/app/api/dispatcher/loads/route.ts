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
        const loads = await prisma.load.findMany({
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

export async function POST(request: Request) {
    const session = await auth();

    if (!session) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (session.user.role !== 'DISPATCHER' && session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    try {
        const body = await request.json();
        const newLoad = await prisma.load.create({ data: body });
        return NextResponse.json(newLoad);
    } catch (error) {
        console.error('Error creating load:', error);
        return NextResponse.json({ error: 'Failed to create load' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const session = await auth();

    if (!session) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (session.user.role !== 'DISPATCHER' && session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    try {
        const { loadId } = await request.json();
        await prisma.load.delete({ where: { id: loadId } });
        return NextResponse.json({ message: 'Load deleted successfully' });
    } catch (error) {
        console.error('Error deleting load:', error);
        return NextResponse.json({ error: 'Failed to delete load' }, { status: 500 });
    }

}