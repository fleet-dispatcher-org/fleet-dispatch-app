
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
            // Get cookies from the current request context
            const { cookies } = await import('next/headers');
            const cookieStore = await cookies();
            const cookieHeader = cookieStore.toString();
            const response = await fetch(`${baseURL}/api/trucks/${truckId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Cookie": cookieHeader
                },
                cache: 'no-store',
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
            
            // Get cookies from the current request context
            const { cookies } = await import('next/headers');
            const cookieStore = await cookies();
            const cookieHeader = cookieStore.toString();
            const response = await fetch(`${baseURL}/api/dispatcher/drivers/${driverId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Cookie": cookieHeader
                },
                cache: 'no-store',
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

    

    const [assignedDriver] = await Promise.all([
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
                                </div>
                                <div className="mt-4 text-center">
                                    <p className="text-sm opacity-90">
                                        Mileage: {truck?.mileage as number} miles
                                    </p>
                                </div>
                            </div>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"> 
                                <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-400">Driver</h3>
                                    </div>
                                        {assignedDriver ? (
                                            <div className="flex items-center space-x-3">
                                                <div className="text-gray-400">
                                                    <p className="text-sm">{assignedDriver.first_name} {assignedDriver.last_name}</p>
                                                    <p className="text-sm">{assignedDriver.email}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </div>
                                                <p className="text-gray-400">No Driver Assigned</p>
                                            </div>
                                        )}
                                </div>
                                <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-400">Capacity Tons</h3>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="text-gray-400">
                                            <p className="text-sm">{truck?.capacity_tons as unknown as number} tons</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6">
                                    <div className="flex items-center space-x-3 mb-4">
                                        {truck?.truck_status === "AVAILABLE" ? (
                                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                        ) : (
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        )
                                        }
                                        <h3 className="text-lg font-semibold text-gray-400">Truck Status</h3>
                                    </div>
                                        {truck?.truck_status === "AVAILABLE" ? (
                                            <div className="flex items-center space-x-3">
                                                <p className="text-gray-400">Available</p>
                                            </div>
                                        ) : (
                                            <div className="flex items-center space-x-3">
                                                <p className="text-gray-400">Unavailable</p>
                                            </div>
                                        )}
                            </div>
                         </div>
                    </main>
        </div>
    )
}