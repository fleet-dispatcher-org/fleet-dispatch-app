import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from "@/prisma/prisma";


export async function GET(request: Request) {
    try {
        const session = await auth();
        if(!session || session.user?.role != "DISPATCHER" && session.user?.role != "ADMIN") 
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        
        const routes = await prisma.route.findMany({
            include: {
                routeLoads: {
                    include: {
                        load: true
                    },
                    orderBy: {
                        order: 'asc'
                    }
                },
                driver: true,
                truck: true,
                trailer: true
            }
        });

        // Transform to include loads directly
        const routesWithLoads = routes.map(route => ({
            ...route,
            loads: route.routeLoads.map(rl => rl.load)
        }));

        return NextResponse.json(routesWithLoads);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: `Internal Server Error: ${error}` }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if(!session || session.user?.role != "DISPATCHER" && session.user?.role != "ADMIN") 
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        
        const body = await request.json();
        
        // Create the route with the loads through the join table
        const newRoute = await prisma.route.create({ 
            data: { 
                assigned_driver: body.assigned_driver,
                assigned_truck: body.assigned_truck,
                assigned_trailer: body.assigned_trailer,
                routeLoads: {
                    create: body.loads.map((load: { id: string }, index: number) => ({
                        loadId: load.id,
                        order: index  // Optional: preserves the order of loads
                    }))
                }
            },
            include: { 
                routeLoads: {
                    include: {
                        load: true  // Include the actual load data
                    },
                    orderBy: {
                        order: 'asc'  // Order by the sequence
                    }
                },
                driver: true,
                truck: true,
                trailer: true
            }
        });

        // Transform the response to match your expected format
        const routeWithLoads = {
            ...newRoute,
            loads: newRoute.routeLoads.map(rl => rl.load)
        };

        return NextResponse.json(routeWithLoads);
    } catch (error) {
        console.error('Error creating route:', error);
        return NextResponse.json({ 
            message: `Internal Server Error: ${error instanceof Error ? error.message : error}` 
        }, { status: 500 });
    }
}