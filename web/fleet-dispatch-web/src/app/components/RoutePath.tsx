"use client";

import { Reorder } from "framer-motion";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Load } from "@prisma/client";
import Link from "next/link";
import LoadStatusClient from "./LoadStatusClient";

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

    if (session?.user?.id != loads.at(0)?.assigned_driver && session?.user?.role != "ADMIN" && session?.user?.role != "DISPATCHER") {
        return (
            <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6">
                <div className="flex items-center justify-center">
                    <p className="text-gray-400">You are not permitted to view this route</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6">
            <div className="flex flex-col justify-center space-x-4">
                <p className="text-gray-400 text-2xl p-2 align-middle">Route Management:</p>
                <Reorder.Group values={loads} onReorder={setLoads} className="flex flex-row flex-wrap justify-center">
                    {/* For some reason, you have to use load.load to actually get into the load object. Not sure why but it works */}
                    {loads.map((load: any, index: number) => (
                        <Reorder.Item draggable drag={true} value={load} key={load.id} className="mx-2 p-4 border
                         border-gray-600 rounded-2xl mb-2">
                            <div className="flex flex-col justify-between space-y-2">
                                <div className="flex flex-row text-gray-400 justify-between">
                                    <Link href={`/load/${load.load.id}`}>
                                    <div className="text-sm text-gray-400 font-bold">
                                        <p>Load {index + 1}</p>
                                    </div>
                                    </Link>
                                    <div className="text-sm font-bold justify-end">
                                        <button>X</button>
                                    </div>
                                </div>
                                <br />
                                <div className="flex flex-row items-center text-gray-300 justify-center">
                                    <p>{load.load.origin}</p>
                                    <p className="mx-2">to</p>
                                    <p>{load.load.destination}</p>
                                </div>
                                <div className="flex flex-row items-center justify-center">
                                    <p>{new Date(load.load.pick_up_by).toLocaleDateString()}</p>
                                    <p className="mx-2">&rarr;</p>
                                    <p>{new Date(load.load.due_by).toLocaleDateString()}</p>
                                </div>
                                <div className="flex flex-col">
                                    <LoadStatusClient loadId={load.load.id} initialStatus={load.load.status} />
                                </div>
                            </div>
                        </Reorder.Item>
                    ))}
                </Reorder.Group>
            </div>
        </div>
    );
}