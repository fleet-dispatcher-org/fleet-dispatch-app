'use client'
import { useState, useEffect } from 'react';
import { Trailer, Load, Driver, Truck, Route } from "@prisma/client";
import Link from 'next/link';
import { RoutePlanner } from '../hooks/routePlanner';
import { RoutePlannerContext, TreeBasedAssignment, RouteNode } from '../hooks/routePlanner';
import { clear } from 'console';


export default function AIBoard() {
    const [suggestedRoutes, setSuggestedRoutes] = useState<Load[]>([]);
    const [trucks, setTrucks] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [trailers, setTrailers] = useState<Record<string, string>>({});
    const [driverNames, setDriverNames] = useState<Record<string, string>>({});
    const [generatingSuggestions, setGeneratingSuggestions] = useState(false);
    const [clearingSuggestions, setClearingSuggestions] = useState(false);
    const url = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    useEffect(() => {
        // Only load existing suggestions on mount, don't automatically generate new ones
        getSuggestions();   
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

const clearSuggestions = async () => {
    try {
        setLoading(true);
        setClearingSuggestions(true);
        await fetch(`${url}/api/dispatcher/loads/clear-suggestions`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                assigned_driver: null,
                assigned_by: null,
                assigned_truck: null,
                assigned_trailer: null,
                status: 'UNASSIGNED'
            }),
        });

        await fetch(`${url}/api/dispatcher/routes/clear-suggestions`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            
        })
        setError(null);
    } catch (error) {
        console.error('Error clearing suggestions:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
        setLoading(false);
        setClearingSuggestions(false);
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
            trailer.trailer_status === 'AVAILABLE'
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

const makeSuggestionsParallel = async () => {
    try {
        setGeneratingSuggestions(true);
        setError(null);
        
        const [unassignedDrivers, unassignedTrucks, unassignedTrailers, unassignedLoads] = await Promise.all([
            fetchUnassignedDrivers(), 
            fetchUnassignedTrucks(), 
            fetchUnassignedTrailers(),
            fetchUnassignedLoads()
        ]);


        const assignmentData: RoutePlannerContext = {
            drivers: unassignedDrivers,
            trucks: unassignedTrucks,
            trailers: unassignedTrailers,
            loads: unassignedLoads
        }

        const routePlanner = new RoutePlanner();
        const suggestions = routePlanner.makeChronologicalTreeBasedAssignments(assignmentData, 600, 10, 10, "HIGHEST_FEASIBILITY", "pick_up_by");

        console.log("Suggestions:", suggestions);
        
        // Create all API calls as promises
        const allApiCalls: Promise<Response>[] = [];
        
        // Fixed version of your function
        suggestions.forEach((suggestion: TreeBasedAssignment) => {
            const assigned_driver = suggestion.driverGroup.driver.id;
            const assigned_truck = suggestion.driverGroup.truck.id;
            const assigned_trailer = suggestion.driverGroup.trailer.id;

            const assigned_loads = suggestion.primaryRoute.routePath.map((node: RouteNode) => node.load);

            const validLoads = assigned_loads.filter((load: Load) => !load.id.includes('current_'));

            // Deduplicate by ID
            const uniqueLoads = validLoads.filter((load, index, self) => 
                index === self.findIndex((l) => l.id === load.id)
            );
            console.log("Total assigned loads:", assigned_loads.length);
            console.log("Valid loads after filter:", validLoads.length);
            console.log("Valid load IDs:", validLoads.map(load => load.id));
            console.log("Unique loads:", uniqueLoads.length);
            console.log("Unique load IDs:", uniqueLoads.map(load => load.id));

            uniqueLoads.forEach((load: Load) => {
                allApiCalls.push(fetch(`${url}/api/dispatcher/${load.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        assigned_driver,
                        assigned_truck,
                        assigned_trailer,
                    }),
                }));
            });

            allApiCalls.push((fetch(`${url}/api/dispatcher/routes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    assigned_driver: assigned_driver,
                    assigned_truck: assigned_truck,
                    assigned_trailer: assigned_trailer,
                    loads: uniqueLoads.map(load => ({ id: load.id })),
                })
            })))
            

        });

        // Execute all API calls in parallel
        await Promise.all(allApiCalls);

        console.log("Suggestions made successfully");
        await getSuggestions();
        
    } catch (error) {
        console.error('Error making suggestions:', error);
        setError(error instanceof Error ? error.message : 'Failed to generate suggestions');
    } finally {
        setGeneratingSuggestions(false);
    }
}

const handleGetSuggestions = async () => {
    await makeSuggestionsParallel();
}
    const getSuggestions = async () => {
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
                        
            setSuggestedRoutes(data || []);
        } catch (err) {
            console.error('Error fetching suggestions:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch loads');
            setSuggestedRoutes([]);
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
                [truckId]: `${data.year} ${data.make}, ${data.model} `
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
    
    if (loading && suggestedRoutes.length === 0) {
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
            <div className="bg-gray-900 shadow rounded-lg overflow-hidden">
                {/* Table Header */}
                <div className="px-6 py-4 border-b border-gray-900">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-400">AI Suggested Loads</h2>
                            <p className="text-sm text-gray-600 mt-1">
                                Accept or Deny suggested loads here
                            </p>
                        </div>
                        <button
                            onClick={handleGetSuggestions}
                            disabled={generatingSuggestions}
                            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 hover:cursor-pointer"
                        >
                            {generatingSuggestions ? 'Generating Suggestions...' : 'Get Suggestions'}
                        </button>
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
                                Suggested Driver
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Suggested Truck
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Suggested Trailer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                View Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-900 divide-y divide-gray-400">
                        {suggestedRoutes.map((route) => (
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
                                    <div className="text-sm text-gray-400">{route.assigned_truck ? (trucks[route.assigned_truck] || 'Assigning Truck...'): 'No Truck Assigned'}</div>
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
            
            {suggestedRoutes.length === 0 && !loading && (
                <div className='text-center py-8'>
                    <p className="text-gray-500 mt-2">No suggested loads found.</p>
                </div>
            )}

            <div className="mt-6 flex justify-start">
                <button
                    onClick={clearSuggestions}
                    disabled={loading || clearingSuggestions}
                    className='bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed'>
                    {clearingSuggestions ? 'Clearing Suggestions...' : 'Clear Suggestions'}
                </button>
            </div>
            
            {/* Refresh Button */}
            <div className="mt-6 flex justify-end">
                <button
                    onClick={getSuggestions}
                    disabled={loading || generatingSuggestions}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Refreshing...' : 'Refresh Display'}
                </button>
            </div>
        </div>
    );
}