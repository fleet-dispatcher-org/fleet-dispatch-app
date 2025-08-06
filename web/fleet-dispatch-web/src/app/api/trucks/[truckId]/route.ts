import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/prisma/prisma'

interface RouteParams {
    params: { truckId: string };
}

// This is how we will be getting the data!!! Go to the route off of the api folder
// Everything is going to be a route of some sorts so just follow the file paths. 
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        // Handle authentication on the server side
        if(!session || session.user?.role != "DISPATCHER" && session.user?.role != "ADMIN") 
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { truckId } = await params;

        // This is essentially the SQL query here. 
        const truck = await prisma.truck.findUnique({ where: { id: truckId }, select: { id: true, make: true, model: true, year: true, license_plate: true, capacity_tons: true} });

        // This is what packs it up into JSON. There's no external [data] or anything like that. 
        // In the response just use the variable data. 
        return NextResponse.json(truck);
    } catch (error) {
        // Log the error
        console.error(error);
        
        // Pray this never happens
        return NextResponse.json({ message: `Internal Server Error: ${error}` }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        const { truckId } = await params;
        await prisma.truck.update({
            where: { id: truckId },
            data: await request.json(),
        });
        return NextResponse.json({ message: "Truck updated successfully" }, { status: 200 });
    } catch (error) {
        console.error('Error updating truck:', error);
        return NextResponse.json({ message: "Error updating truck" }, { status: 500 });
    }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        const { truckId } = await params;
        await prisma.truck.update({
            where: { id: truckId },
            data: await request.json(),
        });
        return NextResponse.json({ message: "Truck updated successfully" }, { status: 200 });
    } catch (error) {
        console.error('Error updating truck:', error);
        return NextResponse.json({ message: "Error updating truck" }, { status: 500 });
    }
}

export async function DELETE({params}: RouteParams) {
    try {
        const session = await auth();
        const { truckId } = await params;
        await prisma.truck.delete({ where: { id: truckId } });
        return NextResponse.json({ message: "Truck deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: `Internal Server Error: ${error}` }, { status: 500 });
    }
}