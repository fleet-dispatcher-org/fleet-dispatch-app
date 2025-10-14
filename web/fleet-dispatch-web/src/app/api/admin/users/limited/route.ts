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
            if(!session || session.user?.role != "ADMIN") 
                return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

            const users = await prisma.user.findMany({ 
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: limit,
                skip: random ? Math.floor(Math.random() * (await prisma.user.count())) : 0,
                where: {
                    id: { not: session.user.id }
                }
             });

            return NextResponse.json(users);
        } catch (error) {
            console.error(error);
            return NextResponse.json({ message: `Internal Server Error: ${error}` }, { status: 500 });
        }
}