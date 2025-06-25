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

    const loads = await prisma.load.findMany();

    return NextResponse.json(loads);
}