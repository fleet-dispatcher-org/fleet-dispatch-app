import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/prisma/prisma'

interface RouteParams {
    params: {
        loadId: string
        trailerId: string
    }
    loadId: string
    trailerId: string
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        const { loadId, trailerId } = await params;
        await prisma.load.update({
            where: { id: loadId },
            data: { assigned_trailer: trailerId },
        });
        return NextResponse.json({ message: "Trailer assigned successfully" }, { status: 200 });
    } catch (error) {
        console.error('Error assigning trailer to load:', error);
        return NextResponse.json({ message: "Error assigning trailer to load" }, { status: 500 });
    }
}