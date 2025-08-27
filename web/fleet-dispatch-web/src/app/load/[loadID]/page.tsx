import { auth } from "@/auth";
import { notFound } from "next/navigation";
import Logo from "@/src/app/components/Logo";
import LoadStatus from "../../components/LoadStatusClient";
import prisma  from "@/prisma/prisma";
import { Load } from "@prisma/client";
import { Suspense } from "react";
import LoadStatusWrapper from "../../components/LoadStatusWrapper";
import { get } from "http";
import HalfCircleProgress from "../../components/HalfCircleProgress";
import Link from "next/link";
import AcceptDenyLoad from "../../components/AcceptDenyLoad";
import { button } from "@material-tailwind/react";
import AssignDriverWrapper from "../../components/AssignDriverWrapper";
import AssignTruckWrapper from "../../components/AssignTruckWrapper";
import AssignTrailerWrapper from "../../components/AssignTrailerWrapper";

interface LoadViewProps {
    params: Promise<{
        loadId: string;
    }>;
}

export default async function Page({ params }: any) {
    const session = await auth();

    if (session?.user === null) return <div>Error signing in. Please try again. </div>;

    else if (session?.user === undefined) return <div>Loading...</div>;

    async function assignDriver(loadId: string, driverId: string) {
        try {
            await prisma.load.update({
                where: { id: loadId },
                data: { assigned_driver: driverId },
            });
        } catch (error) {
            console.error('Error assigning driver to load:', error);
        }
    }

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

    async function getAssignedTrailer(load: Load) {
        try {
            if (!load.assigned_trailer) {
                return null;
            } else {
                const trailer = await prisma.trailer?.findUnique({ where: { id: load.assigned_trailer } });
                if (!trailer) {
                    throw new Error('Trailer not found');
                }
                return trailer;    
            }
            
        } catch (error) {
            console.error('Error fetching driver:', error);
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

    async function getAssignedBy(load: Load) {
        try {
            if (!load.assigned_by) {
                return null;
            } else {
                const user = await prisma.user?.findUnique({ where: { id: load.assigned_by } });
                if (!user) {
                    throw new Error('User not found');
                }
                return user;    
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
    const [assignedDriver, assigned_truck, assigned_trailer, assigned_by] = await Promise.all([
        getAssignedDriver(load as Load),
        getAssignedTruck(load as Load),
        getAssignedTrailer(load as Load),
        getAssignedBy(load as Load),
    ])
    
    if (!load) {
        return notFound();
    }

    const serializedLoad = {
        ...load, 
        weight: load.weight.toNumber(),
    }
    
    const serializedTrailer = assigned_trailer ? {
    ...assigned_trailer,
    max_cargo_capacity: assigned_trailer.max_cargo_capacity?.toNumber() || 0,
    current_cargo_weight: assigned_trailer.current_cargo_weight?.toNumber() || 0,
} : {
    max_cargo_capacity: 0,
    current_cargo_weight: 0,
    // add other default properties as needed
};
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
                        Load ID: {load.id}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8 bg-gray-900 border border-gray-700 mt-4 rounded-lg">
                {/* Route Header */}
                <div className="mb-8">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
                        <div className="flex items-center justify-center space-x-4">
                            <div className="text-center">
                                <h2 className="text-lg font-semibold opacity-90">Origin</h2>
                                <p className="text-2xl font-bold">{load.origin}</p>
                            </div>
                            <div className="text-4xl opacity-75">→</div>
                            <div className="text-center">
                                <h2 className="text-lg font-semibold opacity-90">Destination</h2>
                                <p className="text-2xl font-bold">{load.destination}</p>
                            </div>
                        </div>
                        <div className="mt-4 text-center">
                            <p className="text-sm opacity-90">
                                Due by: {`${load.due_by.getUTCMonth() + 1}/${load.due_by.getUTCDate()}/${load.due_by.getUTCFullYear()}`}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Progress Section */}
                <div className="mb-8">
                    <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6">
                        <div className="flex items-center justify-center">
                            <div className="text-center">
                                <HalfCircleProgress 
                                    percentage={load.percent_complete} 
                                    color={
                                        load.percent_complete === 100 ? "#10b981" : // Green for complete
                                        load.percent_complete >= 50 ? "#3b82f6" :   // Blue for in progress
                                        "#f59e0b"                                   // Orange for starting
                                    }
                                    size={200}
                                />
                                <h3 className="text-lg font-semibold text-gray-400 mt-4">
                                    {load.percent_complete}% Complete
                                </h3>
                                <p className="text-sm text-gray-400">
                                    {load.percent_complete === 100 ? "Delivery Complete" : 
                                     load.percent_complete >= 50 ? "In Transit" : "Getting Ready"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Assignment Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Driver Card */}
                    <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-400">Driver</h3>
                        </div>
                            <AssignDriverWrapper loadId={load.id} assignedDriver={assignedDriver} />
                    </div>

                    {/* Truck Card */}
                    <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-400">Truck</h3>
                        </div>
                        <AssignTruckWrapper loadId={load.id} assignedTruck={assigned_truck}></AssignTruckWrapper>
                    </div>

                    {/* Trailer Card */}
                    <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-400">Trailer</h3>
                        </div>
                        <AssignTrailerWrapper loadId={load.id} assignedTrailer={assigned_trailer}></AssignTrailerWrapper>
                    </div>
                </div>

                {/* Load Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Weight/Capacity Card */}
                    <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-400 mb-4">Load Capacity</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Current Weight:</span>
                                <span className="text-lg font-bold text-gray-400">{serializedLoad.weight.toLocaleString()} lbs</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Max Capacity:</span>
                                <span className="text-lg font-bold text-gray-400">
                                    {assigned_trailer?.max_cargo_capacity?.toLocaleString() || "N/A"} lbs
                                </span>
                            </div>
                            {assigned_trailer?.max_cargo_capacity && (
                                <div className="mt-4">
                                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                                        <span>Capacity Usage</span>
                                        <span>{Math.round((serializedLoad.weight / serializedTrailer.max_cargo_capacity) * 100)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="h-2 rounded-full transition-all duration-300"
                                            style={{ 
                                                width: `${Math.min((serializedLoad.weight / serializedTrailer.max_cargo_capacity) * 100, 100)}%`,
                                                backgroundColor: (() => {
                                                    const percentage = (serializedLoad.weight / serializedTrailer.max_cargo_capacity) * 100;
                                                    if (percentage >= 90) return '#dc2626'; // Red (near overweight)
                                                    if (percentage >= 80) return '#ea580c'; // Orange-red
                                                    if (percentage >= 70) return '#f59e0b'; // Orange
                                                    if (percentage >= 50) return '#eab308'; // Yellow
                                                    if (percentage >= 30) return '#84cc16'; // Light green
                                                    return '#22c55e'; // Green (light load)
                                                })()
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Timeline Card */}
                    <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-400 mb-4">Schedule</h3>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <div>
                                    <p className="text-sm font-medium text-gray-400">Pickup Complete</p>
                                    <p className="text-xs text-gray-500">From {load.origin}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full ${load.percent_complete >= 50 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                                <div>
                                    <p className="text-sm font-medium text-gray-400">In Transit</p>
                                    <p className="text-xs text-gray-500">En route to destination</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full ${load.percent_complete === 100 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                <div>
                                    <p className="text-sm font-medium text-gray-400">Delivery</p>
                                    <p className="text-xs text-gray-500">
                                        Due: {`${load.due_by.getUTCMonth() + 1}/${load.due_by.getUTCDate()}/${load.due_by.getUTCFullYear()}`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>

                    </div>
                </div>

                <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6">

                </div>

                {/* Load Status Section */}
                <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-400 mb-4">Load Status Updates</h3>
                    <Suspense fallback={
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    }>
                        <LoadStatusWrapper loadId={load.id} />
                    </Suspense>
                </div>
                {/* Accept/Deny Load Section */}
                { load.status === "SUGGESTED" &&
                    <AcceptDenyLoad loadId={load.id} driverId={load.assigned_driver!} trailerId={load.assigned_trailer!} truckId={load.assigned_truck!}></AcceptDenyLoad>
                }
                <Link 
                    href={`/dispatcher`}
                    className="group"
                >
                <p className="text-sm font-medium text-gray-400 hover:text-gray-200 hover:underline transition-colors duration-300" >Back to Loads &rarr;</p>
                </Link>
                
                
            </main>
        </div>
    )
}