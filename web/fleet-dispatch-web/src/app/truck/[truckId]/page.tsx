"use server";

import { Truck } from "@prisma/client";
import Link from "next/link";
import { auth } from "@/auth";
import Logo from "../../components/Logo";

export default async function TruckPage({ params }: { params: { truckId: string } }) {

    const session = await auth();

    if (session?.user === null) return <div>Error signing in. Please try again. </div>;

    else if (session?.user === undefined) return <div>Loading...</div>;

    else if (session?.user?.role !== "ADMIN" && session?.user?.role !== "DISPATCHER") return <div>Unauthorized</div>;

    async function fetchTruck(truckId: string): Promise<Truck | undefined> {
        try {
            const baseURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
            const response = await fetch(`${baseURL}/api/trucks/${truckId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json(); 
            return data; 
        } catch (error) {
            console.error("Error fetching truck:", error);
        }
    }

    async function getAssignedDriver(driverId: string) {
        try {
            const baseURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
            const response = await fetch(`${baseURL}/api/dispatcher/drivers/${driverId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json(); 
            return data;
        } catch (error) {
            console.error("Error fetching driver:", error);
        }
    }

    const truckProps = await params;

    const [truck] = await Promise.all([
        fetchTruck(truckProps.truckId),
    ]);

    const assignedDriver = await Promise.all([
        getAssignedDriver(truck?.driver_id as string),
    ])

    return (
        <div className="min-h-screen bg-black">
                    {/* Header */}
                    <header className="bg-gray-900 shadow-sm border-b border-gray-400 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Logo
                                    path="/fleet-dispatch-logo-no-background.png"
                                    alt="Inverted Logo"
                                    width={38}
                                    height={38}
                                    reroute="/"
                                />
                                <h1 className="text-2xl font-bold text-white">Fleet Dispatch</h1>
                            </div>
                            <div className="text-sm text-gray-500">
                                Truck ID: {truck?.id}
                            </div>
                        </div>
                    </header>

                    <main className="max-w-7xl mx-auto px-6 py-8 bg-gray-900 border border-gray-700 mt-4 rounded-lg">
                         <div className="mb-8">
                            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
                                <div className="flex items-center justify-center space-x-4">
                            <       div className="text-center">
                                        <h2 className="text-lg font-semibold opacity-90">Current Location</h2>
                                        <p className="text-2xl font-bold">{truck?.current_location}</p>
                                    </div>
                                <div className="text-4xl opacity-75">→</div>
                                    <div className="text-center">
                                        <h2 className="text-lg font-semibold opacity-90">Make, Model, Year</h2>
                                        <p className="text-2xl font-bold">{`${truck?.make}, ${truck?.model}, ${truck?.year}`}</p>
                                    </div>
                                </div>
                                <div className="mt-4 text-center">
                                    <p className="text-sm opacity-90">
                                        Mileage: {truck?.mileage as number} miles
                                    </p>
                                </div>
                            </div>
                         </div>
                    </main>
        </div>
    )
}