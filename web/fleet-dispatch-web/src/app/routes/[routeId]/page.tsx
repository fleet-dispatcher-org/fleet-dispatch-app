import { auth } from "@/auth";
import { notFound } from "next/navigation";
import Logo from "@/src/app/components/Logo";
import prisma  from "@/prisma/prisma";
import { Route } from "@prisma/client";
import Link from "next/link";
import RoutePath from "../../components/RoutePath";
import AssignDriverRouteWrapper from "../../components/AssignDriverRouteWrapper";
import AssignTruckRouteWrapper from "../../components/AssignTruckRouteWrapper";
import AssignTrailerRouteWrapper from "../../components/AssignTrailerRouteWrapper";
import RouteStatusWrapper from "../../components/RouteStatusWrapper";
import AcceptDenyRoute from "../../components/AcceptDenyRoute";


interface RouteViewProps {
    params: Promise<{
        routeId: string;
    }>;
}

export default async function Page({ params }: RouteViewProps) {
    const session = await auth();

    if (session?.user === null) return <div>Error signing in. Please try again. </div>;

    else if (session?.user === undefined) return <div>Loading...</div>;

    const { routeId } = await params;

    // async function assignDriver(loadId: string, driverId: string) {
    //     try {
    //         await prisma.load.update({
    //             where: { id: loadId },
    //             data: { assigned_driver: driverId },
    //         });
    //     } catch (error) {
    //         console.error('Error assigning driver to load:', error);
    //     }
    // }

    async function getRoute(routeId: string) {
        try {
            const route = await prisma.route.findUnique({ where: { id: routeId } });
            if (!route) {
                throw new Error('Load not found');
            }
            return route;
        } catch (error) {
            console.error('Error fetching load:', error);
            return null;
        }
    }

    async function getAssignedTrailer(route: Route) {
        try {
            if (!route.assigned_trailer) {
                return null;
            } else {
                const trailer = await prisma.trailer?.findUnique({ where: { id: route.assigned_trailer } });
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
    
    async function getAssignedDriver(route: Route) {
        try {
            if (!route.assigned_driver) {
                return null;
            } else {
                const driver = await prisma.driver?.findUnique({ where: { id: route.assigned_driver } });
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

    async function getAssignedTruck(route: Route) {
        try {
            if (!route.assigned_truck) {
                return null;
            } else {
                const truck = await prisma.truck?.findUnique({ where: { id: route.assigned_truck } });
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

    // async function getAssignedBy(load: Load) {
    //     try {
    //         if (!load.assigned_by) {
    //             return null;
    //         } else {
    //             const user = await prisma.user?.findUnique({ where: { id: load.assigned_by } });
    //             if (!user) {
    //                 throw new Error('User not found');
    //             }
    //             return user;    
    //         }
            
    //     } catch (error) {
    //         console.error('Error fetching driver:', error);
    //         return null;
    //     }
    // }

    const [route] = await Promise.all([
        getRoute(routeId),
    ]);
    const [assignedDriver, assigned_truck, assigned_trailer] = await Promise.all([
        getAssignedDriver(route as Route),
        getAssignedTruck(route as Route),
        getAssignedTrailer(route as Route),
        // getAssignedBy(load as Load),
    ])
    
    if (!route) {
        return notFound();
    }
    
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
                        Load ID: {route.id}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8 bg-gray-900 border border-gray-700 mt-4 rounded-lg">
                {/* Route Header */}
                <div className="mb-8">
                    <RoutePath routeId={routeId} />
                </div>

                {/* Progress Section */}
                <div className="mb-8">
                    
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
                            <AssignDriverRouteWrapper routeId={route.id} assignedDriver={assignedDriver} />
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
                        <AssignTruckRouteWrapper routeId={route.id} assignedTruck={assigned_truck} />
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
                        <AssignTrailerRouteWrapper routeId={route.id} assignedTrailer={assigned_trailer} />
                    </div>
                </div>

                {/* Load Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Weight/Capacity Card */}
                    <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-400 mb-4">Route Criteria</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Feasibility Score:</span>
                                <span className="text-lg font-bold text-gray-400">{route.feasibilityScore} / 1000</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Total Cost:</span>
                                <span className="text-lg font-bold text-gray-400">
                                    {route.totalCost?.toFixed(2) || "N/A"}
                                </span>
                            </div>
                            
                        </div>
                    </div>

                    {/* Timeline Card */}
                    <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-400 mb-4">Route Status</h3>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <RouteStatusWrapper routeId={route.id} />
                            </div>
                        </div>
                    </div>
                    <div>

                    </div>
                </div>
               
                { route.status === "SUGGESTED" &&
                    <AcceptDenyRoute routeId={route.id} driverId={route.assigned_driver!} 
                    trailerId={route.assigned_trailer!} truckId={route.assigned_truck!} />
                }
                <Link 
                    href={`/dispatcher`}
                    className="group"
                >
                <p className="text-sm font-medium text-gray-400 hover:text-gray-200 
                hover:underline transition-colors duration-300" > &larr; Back to Dispatcher </p>
                </Link>
                
                
            </main>
        </div>
    )
}