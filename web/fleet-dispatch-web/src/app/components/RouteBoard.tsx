'use client'
import { useState, useEffect } from 'react';
import { Trailer, Load, Driver, Truck, Route } from "@prisma/client";
import Link from 'next/link';
import { RoutePlanner } from '../hooks/routePlanner';
import { RoutePlannerContext, TreeBasedAssignment, RouteNode } from '../hooks/routePlanner';
import { useSession } from 'next-auth/react';
import Logo from './Logo';


export default function SuggestedRouteBoard() {
    const [routes, setRoutes] = useState<Load[]>([]);
    const [trucks, setTrucks] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [trailers, setTrailers] = useState<Record<string, string>>({});
    const [driverNames, setDriverNames] = useState<Record<string, string>>({});
    const [generatingSuggestions, setGeneratingSuggestions] = useState(false);
    const [clearingSuggestions, setClearingSuggestions] = useState(false);
    const url = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const { data: session } = useSession();

    useEffect(() => {
        // Only load existing suggestions on mount, don't automatically generate new ones
        getRoutes();   
    }, []);
    const fetchUnassignedDrivers = async (): Promise<Driver[]> => {
    try {
        setLoading(true);
        
        const response = await fetch(`${url}/api/dispatcher/drivers`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store'
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Handle both array and object responses
        let driversArray;
        if (Array.isArray(data)) {
            driversArray = data;
        } else if (data && Array.isArray(data.drivers)) {
            driversArray = data.drivers;
        } else {
            throw new Error('Invalid response format: expected array or object with drivers property');
        }
        
        const availableDrivers = driversArray.filter((driver: Driver) => driver.driver_status === 'AVAILABLE');
        setError(null);
        return availableDrivers; // Return the data
    } catch (error) {
        console.error('Error fetching unassigned drivers:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
        return []; // Return empty array on error
    } finally {
        setLoading(false);
    }
};


const fetchUnassignedTrucks = async (): Promise<Truck[]> => {
    try {
        setLoading(true);
        
        const response = await fetch(`${url}/api/trucks`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        // Filter for truly unassigned trucks - available status and no assigned driver
        const availableTrucks = data.filter((truck: Truck) => 
            truck.truck_status === 'AVAILABLE' // && !truck.assigned_driver
        );
        setError(null);
        return availableTrucks; // Return the filtered available trucks
    } catch (error) {
        console.error('Error fetching unassigned trucks:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
        return []; // Return empty array on error
    } finally {
        setLoading(false);
    }
};

const fetchUnassignedTrailers = async (): Promise<Trailer[]> => {
    try {
        setLoading(true);
        
        const response = await fetch(`${url}/api/trailers`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        // Filter for truly unassigned trailers - available status
        const availableTrailers = data.filter((trailer: Trailer) => 
            trailer.status === 'AVAILABLE'
        );
        setError(null);
        return availableTrailers; // Return the filtered available trailers
    } catch (error) {
        console.error('Error fetching unassigned trailers:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
        return []; // Return empty array on error
    } finally {
        setLoading(false);
    }
};

const fetchUnassignedLoads = async (): Promise<Load[]> => {
    try {
        setLoading(true);
        
        const response = await fetch(`${url}/api/dispatcher/loads`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        // let unassignedLoads = data.filter((load: Load) => !load.assigned_driver || !load.assigned_truck || !load.assigned_trailer);
        const unassignedLoads = data.filter((load: Load) => load.status === 'UNASSIGNED');
        setError(null);
        return unassignedLoads; // Return the filtered unassigned loads
    } catch (error) {
        console.error('Error fetching unassigned loads:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
        return []; // Return empty array on error
    } finally {
        setLoading(false);
    }
    }


    const getRoutes = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch('/api/dispatcher/routes', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch loads: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            const driverIds = new Set<string>((data || []).map((route: Route) => route.assigned_driver));
                        
            driverIds.forEach((id: string) => {if(id) {
                getDriverName(id)
            }});
            
            const truckIds = new Set<string>((data || []).map((route: Route) => route.assigned_truck));
            
            truckIds.forEach((id: string) => {if(id) {
                getTruckMakeModel(id)
            }});

            const trailerIds = new Set<string>((data || []).map((route: Route) => route.assigned_trailer));
            
            trailerIds.forEach((id: string) => {if(id) {
                getTrailerMakeModel(id)
            }});
                        
            setRoutes(data.filter((route: Route) => route.status != 'SUGGESTED') || []);
        } catch (err) {
            console.error('Error fetching suggestions:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch loads');
            setRoutes([]);
        } finally {
            setLoading(false);
        }
    };

    const getTruckMakeModel = async (truckId: string) => {
        try {
            const response = await fetch(`/api/trucks/${truckId}`);
            
            // This is a checker. Most of the time the error you'll get is an unauthorized. 
            // Make sure you're authenticated and or have the correct role.
            if (!response.ok) {
                throw new Error('Failed to fetch truck name');
            }
            const data = await response.json();

            // This is the actual data you want
            setTrucks(prevTrucks => ({
                ...prevTrucks,
                [truckId]: `${data.truck_number} `
            }))
            
        } catch (err) {
            console.error('Error fetching driver name:', err);
            // If there's an error it'll set the trucks as Unknown. 
            // In order to check the actual error you'll need to look at the router.
            setTrucks(prevTrucks => ({
                ...prevTrucks,
                [truckId]: 'Unknown'
            }))
        }
    }

    const getTrailerMakeModel = async(trailerId: string) => {
        // Check if trailerId exists and is not empty
        if (!trailerId || trailerId.trim() === '') {
            setTrailers(prevTrailers => ({
                ...prevTrailers,
                [trailerId]: 'No Trailer Assigned'
            }));
            return;
        }

        try {
            const response = await fetch(`/api/trailers/${trailerId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch trailer name');
            }
            const data = await response.json();
            setTrailers(prevTrailers => ({
                ...prevTrailers,
                [trailerId]: `${data.year} ${data.make}, ${data.model} `
            }))
        } catch (err) {
            console.error('Error fetching trailer name:', err);
            setTrailers(prevTrailers => ({
                ...prevTrailers,
                [trailerId]: 'Unknown'
            }))
        }
    }

    const getDriverName = async (driverId: string) => {
        try {
            const response = await fetch(`/api/admin/users/${driverId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch driver name');
            }
            const data = await response.json();
            const fullname= `${data.name}`;

            setDriverNames(prevDriverNames => ({
                ...prevDriverNames,
                [driverId]: fullname
            }));
        } catch (err) {
            console.error('Error fetching driver name:', err);
            setDriverNames(prevDriverNames => ({
                ...prevDriverNames,
                [driverId]: 'Unknown'
            }))
        }
    }
    
    if (loading && routes.length === 0) {
        return (
            <div className="max-w-7xl mx-auto p-6 mt-4">
                <div className="bg-gray-900 shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4 text-center">
                        <p className="text-gray-400">Loading suggested loads...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 mt-4">
            <div className="max-w-7xl mx-auto p-6k">
                        {/* Outer Container ^*/}
                        
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex flex-row mb-2">
                                <Logo 
                                    path="/fleet-dispatch-logo-no-background.png"
                                    alt="Inverted Logo"
                                    width={38}
                                    height={38}
                                    reroute="/"
                                />
                                <h1 className="text-3xl mt-0.5 ml-2 font-bold text-gray-400">Dispatcher Dashboard</h1>
                            </div>
                            <p className="text-gray-500 mt-2">
                                Welcome back, {session?.user?.name}. Manage your drivers and loads here.
                            </p>
                        </div>
                    </div>
            <div className="bg-gray-900 shadow rounded-lg overflow-hidden">
                {/* Table Header */}
                <div className="px-6 py-4 border-b border-gray-900">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-400">Current Routes</h2>
                            <p className="text-sm text-gray-600 mt-1">
                                View current or pending routes here. 
                            </p>
                        </div>
                    </div>
                    {error && (
                        <div className="mt-2 p-2 bg-red-900 border border-red-700 rounded text-red-300 text-sm">
                            {error}
                        </div>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-400">
                    <thead className="bg-gray-800">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Route ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Assigned Driver
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Assigned Truck
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Assigned Trailer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                View Route
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-900 divide-y divide-gray-400">
                        {routes.map((route) => (
                            <tr key={route.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-400">{route.id}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-400 hover:underline hover:cursor-pointer">
                                        <Link 
                                            href={`/admin/users/${route.assigned_driver}`}
                                            className="group"
                                        >
                                            <span className='text-sm font-medium text-gray-300 hover:underline hover:cursor-pointer'>
                                                {route.assigned_driver ? (driverNames[route.assigned_driver] || 'Assigning Driver...') : 'No Driver Assigned'}
                                            </span>
                                        </Link>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-400">{
                                    route.assigned_truck ? (trucks[route.assigned_truck] || 'Assigning Truck...'): 'No Truck Assigned'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-400">{route.assigned_trailer ? (trailers[route.assigned_trailer] || 'Assigning Trailer...'): 'No Trailer Assigned'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col space-y-2">
                                        <Link 
                                            href={`/routes/${route.id}`}
                                            className="text-sm font-medium text-gray-300 hover:underline hover:cursor-pointer"
                                        >
                                            View
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {routes.length === 0 && !loading && (
                <div className='text-center py-8'>
                    <p className="text-gray-500 mt-2">No suggested loads found.</p>
                </div>
            )}

            
            {/* Refresh Button */}
            <div className="mt-6 flex justify-end">
                <button
                    onClick={getRoutes}
                    disabled={loading || generatingSuggestions}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Refreshing...' : 'Refresh Display'}
                </button>
            </div>
        </div>
    );
}