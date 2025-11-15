"use client";

import { Reorder } from "motion/react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Route, Truck, Driver, Trailer, Load } from "@prisma/client";

export default function RoutePath({ routeId }: { routeId: string }) {
    const { data: session } = useSession();
    const [loads, setLoads] = useState<Load[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchRoute() {
            try {
                setLoading(true);
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
                setLoads(route.loads || []);
            } catch (error) {
                console.error('Error fetching route:', error);
                setError('Failed to load route');
            } finally {
                setLoading(false);
            }
        }

        if (routeId) {
            fetchRoute();
        }
    }, [routeId]);

    if (loading) {
        return (
            <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6">
                <div className="flex items-center justify-center">
                    <p className="text-gray-400">Loading route...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6">
                <div className="flex items-center justify-center">
                    <p className="text-red-400">{error}</p>
                </div>
            </div>
        );
    }

    if (!loads.length) {
        return (
            <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6">
                <div className="flex items-center justify-center">
                    <p className="text-gray-400">No loads found for this route</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6">
            <div className="flex flex-row items-center justify-center space-x-4">
                <Reorder.Group axis="x" values={loads} onReorder={setLoads}>
                    {loads.map((load: Load, index: number) => (
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
                                    <p>{new Date(load.pick_up_by).toLocaleDateString()}</p>
                                    <p className="mx-2">&rarr;</p>
                                    <p>{new Date(load.due_by).toLocaleDateString()}</p>
                                </div>
                                <div className="flex flex-col">
                                    <p>{load.status}</p>
                                </div>
                            </div>
                        </Reorder.Item>
                    ))}
                </Reorder.Group>
            </div>
        </div>
    );
}