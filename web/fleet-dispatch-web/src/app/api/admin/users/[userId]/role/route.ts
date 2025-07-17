import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/prisma/prisma'

interface RouteParams {
  params: {
    userId: string
  }
}
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        if(!session || session.user?.role != "ADMIN") 
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        const { userId } = await params 
        const role = body.role;

        if (!['ADMIN', 'DRIVER', 'DISPATCHER'].includes(role)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { role },
            select: {
                id: true,
                name: true,
                email: true,
                role: true
      }
    })
    return NextResponse.json(updatedUser);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: `Internal Server Error: ${error}` }, { status: 500 });
    }
}