import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/prisma/prisma'

interface RouteParams {
        params: { 
            loadId: string,
         };
    }

export async function PATCH(request: NextRequest) {
    try {
        const session = await auth();
        if(!session || session.user?.role != "DISPATCHER" ) 
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        const searchParams = new URL(request.url).searchParams;
        
        // This might not be the best way to ensure this isnt null
        const loadId = searchParams.get('loadId') as string;
        const body = await request.json();
        

        const updatedLoad = await prisma.load.update({
            where: { id: loadId },
            data: body,
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
            }
        });

        return NextResponse.json(updatedLoad);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: `Internal Server Error: ${error}` }, { status: 500 });
    }
}