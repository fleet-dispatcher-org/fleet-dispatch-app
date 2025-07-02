import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/prisma/prisma'

interface RouteParams {
    params: {
        userId: string
    }
    userId: string
}
// This is how we will be getting the data!!! Go to the route off of the api folder
// Everything is going to be a route of some sorts so just follow the file paths.
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        
        // This one is going to be pretty much open to anyone. It's still a private route but any role can use it. 
        // This may be a problem in the future.
        // The idea is that both dispatchers and admins can use it.
        if(!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        } 

        const userId = params.userId;
        
        // This is essentially the SQL query here.
        const user = await prisma.driver.findUnique({ where: { id: userId }, select: { id: true, first_name: true, last_name: true} });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: `Internal Server Error: ${error}` }, { status: 500 });
        }   
}