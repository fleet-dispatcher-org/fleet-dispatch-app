import { NextResponse } from 'next/server'
import prisma from '@/prisma/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const limit_string = searchParams.get('limit');
        const random = searchParams.get('random');
        
        const limit = limit_string ? parseInt(limit_string) : 5;
        
        const trucks = await prisma.truck.findMany({ 
            take: limit,
            skip: random ? Math.floor(Math.random() * (await prisma.truck.count())) : 0,
        });

        return NextResponse.json({ trucks });
    } catch (error) {
        // Log the error
        console.error(error);
        
        // Pray this never happens
        return NextResponse.json({ message: `Internal Server Error: ${error}` }, { status: 500 });
    }
}