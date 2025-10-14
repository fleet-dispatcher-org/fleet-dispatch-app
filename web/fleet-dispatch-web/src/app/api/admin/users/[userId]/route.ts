import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/prisma/prisma'

type RouteParams = {
    params: Promise<{
        userId: string
    }>
}

export const dynamic = 'force-dynamic'
// This is how we will be getting the data!!! Go to the route off of the api folder
// Everything is going to be a route of some sorts so just follow the file paths.
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        console.log("Session:", session?.user?.role || "User not logged in");
        // This one is going to be pretty much open to anyone. It's still a private route but any role can use it. 
        // This may be a problem in the future.
        // The idea is that both dispatchers and admins can use it.
        if(session?.user?.role != "ADMIN" && session?.user?.role != "DISPATCHER") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        } 

        const { userId } = await params;
        
        // This is essentially the SQL query here.
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, name:true, email: true, role: true} });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: `Internal Server Error: ${error}` }, { status: 500 });
        }   
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        console.log("Session:", session?.user?.role || "User not logged in");
        // This one is going to be pretty much open to anyone. It's still a private route but any role can use it. 
        // This may be a problem in the future.
        // The idea is that both dispatchers and admins can use it.
        if(session?.user?.role != "ADMIN" && session?.user?.role != "DISPATCHER") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { userId } = await params;
        await prisma.user.delete({ where: { id: userId } });
        return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: `Internal Server Error: ${error}` }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        console.log("Session:", session?.user?.role || "User not logged in");
        // This one is going to be pretty much open to anyone. It's still a private route but any role can use it. 
        // This may be a problem in the future.
        // The idea is that both dispatchers and admins can use it.
        if(session?.user?.role != "ADMIN" && session?.user?.role != "DISPATCHER") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { userId } = await params;
        const updatedUser = await prisma.user.update({ where: { id: userId }, data: body });
        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: `Internal Server Error: ${error}` }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        console.log("Session:", session?.user?.role || "User not logged in");
        // This one is going to be pretty much open to anyone. It's still a private route but any role can use it. 
        // This may be a problem in the future.
        // The idea is that both dispatchers and admins can use it.
        if(session?.user?.role != "ADMIN" && session?.user?.role != "DISPATCHER") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const user = await prisma.user.create({ data: body });
        return NextResponse.json(user);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: `Internal Server Error: ${error}` }, { status: 500 });
    }
}