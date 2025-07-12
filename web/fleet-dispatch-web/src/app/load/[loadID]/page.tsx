import { auth } from "@/auth";
import { notFound } from "next/navigation";
import Logo from "@/src/app/components/Logo";
import LoadStatus from "../../components/LoadStatus";
import prisma  from "@/prisma/prisma";
import { Load } from "@prisma/client";
import { Suspense } from "react";

interface LoadViewProps {
    params: Promise<{
        loadId: string;
    }>;
}

export default async function Page({ params }: any) {
    const session = await auth();

    if (session?.user === null) return <div>Error signing in. Please try again. </div>;

    else if (session?.user === undefined) return <div>Loading...</div>;

    async function getLoad(loadId: string) {
        try {
            const load = await prisma.load.findUnique({ where: { id: loadId } });
            if (!load) {
                throw new Error('Load not found');
            }
            return load;
        } catch (error) {
            console.error('Error fetching load:', error);
            return null;
        }
    }
    
    async function getAssignedDriver(load: Load) {
        try {
            if (!load.assigned_driver) {
                return null;
            } else {
                const driver = await prisma.driver?.findUnique({ where: { id: load.assigned_driver } });
                if (!driver) {
                    throw new Error('Driver not found');
                }
                return driver;    
            }
            
        } catch (error) {
            console.error('Error fetching driver:', error);
            return null;
        }
    }

    async function getAssignedTruck(load: Load) {
        try {
            if (!load.assigned_truck) {
                return null;
            } else {
                const truck = await prisma.truck?.findUnique({ where: { id: load.assigned_truck } });
                if (!truck) {
                    throw new Error('Truck not found');
                }
                return truck;    
            }
            
        } catch (error) {
            console.error('Error fetching driver:', error);
            return null;
        }
    }

    const { loadId } = await params;
    const [load] = await Promise.all([
        getLoad(loadId),
    ]);
    
    if (!load) {
        return notFound();
    }

    return ( 
        <div>
            <div className="flex flex-row space-x-0">
                <Logo
                    path="/fleet-dispatch-logo-no-background.png"
                    alt="Inverted Logo"
                    width={38}
                    height={38}
                    reroute="/"
                />
                <h4 className="text-3xl mt-0.5 ml-1 font-bold">Fleet Dispatch</h4>
            </div>
            <main>
                <Suspense fallback={<div>Loading...</div>}>
                    <LoadStatus load={load} />
                </Suspense>
            </main>
        </div>
    )
    

}