import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import prisma from "@/prisma/prisma";

type RouteParams = {
    params: Promise<{
        trailerId: string;
    }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    const session = await auth();

    if (!session) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (session.user.role !== "DISPATCHER" && session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        // Extract trailerId from the URL
        const url = new URL(request.url);
        const pathSegments = url.pathname.split('/');
        const trailerId = pathSegments[pathSegments.length - 1];
        
        console.log('API: Trailer ID from URL:', trailerId); // Debug log
        
        if (!trailerId) {
            return NextResponse.json({ error: "Trailer ID is required" }, { status: 400 });
        }
        
        const trailer = await prisma.trailer.findUnique({
            where: {
                id: trailerId,
            },
        });
    
        
        if (!trailer) {
            return NextResponse.json({ error: "Trailer not found" }, { status: 404 });
        }
        
        return NextResponse.json(trailer);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ message: `Internal Server Error: ${error}` }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { trailerId } = await params;
        await prisma.trailer.update({
            where: { id: trailerId },
            data: await request.json(),
        });
        return NextResponse.json({ message: "Trailer updated successfully" }, { status: 200 });
    } catch (error) {
        console.error('Error updating trailer:', error);
        return NextResponse.json({ message: "Error updating trailer" }, { status: 500 });
    }
}