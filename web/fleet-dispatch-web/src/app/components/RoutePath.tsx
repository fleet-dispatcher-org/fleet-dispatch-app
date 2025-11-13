import { Reorder } from "motion/react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Route, Truck, Driver, Trailer, Load } from "@prisma/client";
import { set } from "zod";



export default  async function RoutePath({routeId}: {routeId: string}) {
    const { data: session } = useSession();
    const [loads, setLoads] = useState<Load[]>([]);

    async function getRoute(routeId: string) {
        try {
            const response = await fetch(`/api/dispatcher/routes/${routeId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Route not found');
            }

            const route = await response.json(); 
            return route;
        } catch (error) {
            console.error('Error fetching load:', error);
            return null;
        }
    }

    const [route] = await Promise.all([getRoute(routeId)]);

    if (!route) {
        return <div>Route not found</div>;
    }

    setLoads(route.loads);

    

    return (
        <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6">
            <div className="flex flex-row items-center justify-center space-x-4">
                <Reorder.Group axis="x" values={loads} onReorder={setLoads}>
                {loads.map((load: Load, index) => (
                    <Reorder.Item value={load} key={load.id}>
                        <div className="flex flex-col items-center justify-center space-y-2">
                            <div className="flex flex-row items-center justify-center">
                                <div className="text-lg font-bold">
                                    <p>Load {index + 1}</p>
                                </div>
                                <div className="text-lg font-bold">
                                    <button>X</button>
                                </div>
                            </div>
                            <br />
                            <div className="flex flex-row items-center justify-center">
                                <p>{load.origin}</p>
                                <p className="mx-2">to</p>
                                <p>{load.destination}</p>
                            </div>
                            <div className="flex flex-row items-center justify-center">
                                <p>{load.pick_up_by.toLocaleDateString()}</p>
                                <p className="mx-2">&rarr;</p>
                                <p>{load.due_by.toLocaleDateString()}</p>
                            </div>
                            <div className="flex flex-col">
                                <p>
                                    {load.status}
                                </p>
                            </div>
                        </div>
                    </Reorder.Item>
                    
                ))}

                </Reorder.Group>
            </div>
        </div>
    
    );

}