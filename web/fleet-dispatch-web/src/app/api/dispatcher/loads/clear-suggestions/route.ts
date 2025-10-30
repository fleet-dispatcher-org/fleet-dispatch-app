import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from "@/prisma/prisma";

export async function PATCH (request: Request) {
    const session = await auth();

    if (!session) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (session.user.role !== 'DISPATCHER' && session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    try {
        const body = await request.json();
        const updatedLoad = await prisma.load.updateMany({where: { status: 'SUGGESTED' }, data: body });
        return NextResponse.json(updatedLoad);
    } catch (error) {
        console.error('Error updating load:', error);
        return NextResponse.json({ error: 'Failed to update load' }, { status: 500 });
    }
}