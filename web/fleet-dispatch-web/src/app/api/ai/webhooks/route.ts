import prisma from "@/prisma/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { Driver } from "@prisma/client";

// Import webhook sender
import { WebhookSender } from './webhookSender';
const webhookSender = new WebhookSender();

export async function POST(req: Request, res: Response) {
    // const session = await auth();
    // if (!session) {
    //     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    // }

    try {
        const payload = await req.json();

        const signatures = req.headers.get("x-webhook-signature");
        if(!verifyWebhookSignature(payload, signatures)) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        switch (payload.event) {
            case "load_assigned":
                await handleLoadAssigned(payload);
                break;
            
            case "driver_status_update":
                await handleDriverStatusUpdate(payload);
                break;
            
            case "get_available_drivers":
                await getAvailableDrivers(payload);
                break;

            case "get_available_trucks":
                await getAvailableTrucks(payload);
                break;
            
            case "get_available_trailers":
                await getAvailableTrailers(payload);
                break;
            
            case "get_available_loads":
                await getAvaliableLoads(payload);
                break;
            
            case "test_connection":
                return NextResponse.json({ message: "Success" }, { status: 200 });
            
            default:
                console.log(`Unknown event: ${payload.event}`);
                return new Response('Unknown event type', { status: 400 });
            
            }

            // Forward webhook to backend This uses the queryWebhook function in the webhookSender.js file.
            try {
                const response = await webhookSender.queryWebhook(payload.data);
                console.log(`Webhook forwarded to backend: ${payload.event}`, response);
            } catch (error) {
                console.error(`Failed to forward webhook to backend: ${error}`);
            }

            return NextResponse.json({ message: "Success" }, { status: 200 });

        } catch (error) {
            console.error(error);
            if (error instanceof Error) {
                return NextResponse.json({ message: error.message }, { status: 500 });
            }

        }

        return
    }

    async function handleLoadAssigned(payload: any) {
        const { loadId, driverId, truckId, trailerId } = payload.data;
        await prisma.load.update({
            where: { id: loadId },
            data: { 
                assigned_driver: driverId,
                assigned_truck: truckId,
                assigned_trailer: trailerId,
                status: "SUGGESTED",
            },
        });
    }
    
    async function handleDriverStatusUpdate(payload: any) {
        const { driverId, driver_status } = payload.data;
        await prisma.driver.update({
            where: { id: driverId },
            data: { driver_status },
        });
    }

    async function getAvailableDrivers(payload: any) {
        const drivers = await prisma.driver.findMany({ where: { driver_status: "AVAILABLE" } });
        return NextResponse.json({ drivers });
    }

    async function getAvailableTrucks(payload: any) {
        const trucks = await prisma.truck.findMany({ where: { truck_status: "AVAILABLE" } });
        return NextResponse.json({ trucks });
    }

    async function getAvailableTrailers(payload: any) {
        const trailers = await prisma.trailer.findMany({ where: { trailer_status: "AVAILABLE" } });
        return NextResponse.json({ trailers });
    }

    async function getAvaliableLoads(payload: any) {
        const loads = await prisma.load.findMany({ where: { 
                assigned_driver: null,
                assigned_truck: null,
                assigned_trailer: null,
                status: "UNASSIGNED" 
            } 
        });
        return NextResponse.json({ loads });
    }

    async function handleLoadStatusChange(data: any) {
        const { load_id, status, percent_complete, current_location } = data;
        
        const updatedLoad = await prisma.load.update({
            where: { id: load_id },
            data: {
                status,
                percent_complete,
            }
        });
        
        // If load is delivered, free up resources
        if (status === 'DELIVERED') {
            // Make driver available again
            if (updatedLoad.assigned_driver) {
                await prisma.driver.update({
                    where: { id: updatedLoad.assigned_driver },
                    data: { is_available: true }
                });
            }
            
            // Update truck location to destination
            if (updatedLoad.assigned_truck) {
                await prisma.truck.update({
                    where: { id: updatedLoad.assigned_truck },
                    data: { current_location: updatedLoad.destination }
                });
            }
        }
        
        console.log(`Load ${load_id} status changed to ${status}`);
    }

    // Simple signature verification
    function verifyWebhookSignature(payload: any, signature: string | null) {
        const expectedSignature = process.env.WEBHOOK_SECRET;
        return signature === expectedSignature;
    }