import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/prisma/prisma'

interface RouteParams {
    params: { 
        loadId: string,
    };
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        
        if(!session || session.user?.role != "DISPATCHER" && session.user?.role != "ADMIN") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        
        const { loadId } = await params;
        const body = await request.json();
        
        const updatedLoad = await prisma.load.update({
            where: { id: loadId },
            data: body,
        });

        return NextResponse.json(updatedLoad);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: `Internal Server Error: ${error}` }, { status: 500 });
    }
}

export async function GET({ params }: RouteParams) {
    
    try {
        const session = await auth();
        console.log('Session:', session); // Add this
        
        if(!session || session.user?.role != "DISPATCHER" && session.user?.role != "ADMIN") {
            console.log('Unauthorized access attempt'); // Add this
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        
        const loadId = await params.loadId;
        
        const load = await prisma.load.findUnique({
            where: { id: loadId },
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

        return NextResponse.json(load);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: `Internal Server Error: ${error}` }, { status: 500 });
    }
}

export async function DELETE({params}: RouteParams) {
    try {
        const session = await auth();
        console.log('Session:', session); // Add this
        
        if(!session || session.user?.role != "DISPATCHER" && session.user?.role != "ADMIN") {
            console.log('Unauthorized access attempt'); // Add this
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        
        const { loadId } = await params;
        
        await prisma.load.delete({ where: { id: loadId } });
        return NextResponse.json({ message: "Load deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: `Internal Server Error: ${error}` }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        console.log('Session:', session); // Add this
        
        if(!session || session.user?.role != "DISPATCHER" && session.user?.role != "ADMIN") {
            console.log('Unauthorized access attempt'); // Add this
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        
        const body = await request.json();
        
        const newLoad = await prisma.load.create({ data: body });
        return NextResponse.json(newLoad);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: `Internal Server Error: ${error}` }, { status: 500 });
    }
}