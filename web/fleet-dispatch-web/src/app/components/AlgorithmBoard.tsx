'use client'
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Role, Status, Trailer, Load, Driver, Truck } from "@prisma/client";
import Logo from './Logo';
import { Timestamp } from 'next/dist/server/lib/cache-handlers/types';
import Link from 'next/link';
import { assignLoadsToResources, Assignment, AssignmentContext } from '../agent';
import { RoutePlanner } from '../hooks/routePlanner';
import { RoutePlannerContext, TreeBasedAssignment, RouteNode } from '../hooks/routePlanner';
import { stat } from 'fs';


export default function AIBoard() {
    const { data: session } = useSession();
    const [suggestedLoads, setSuggestedLoads] = useState<Load[]>([]);
    const [trucks, setTrucks] = useState<Record<string, string>>({});
    const [unassignedTrucks, setUnassignedTrucks] = useState<Truck[]>([]);
    const [unassignedTrailers, setUnassignedTrailers] = useState<Trailer[]>([]);
    const [unassignedDrivers, setUnassignedDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingLoadId, setUpdatingLoadId] = useState<string | null>(null);
    const [trailers, setTrailers] = useState<Record<string, string>>({});
    const [driverNames, setDriverNames] = useState<Record<string, string>>({});
    const [unassignedLoads, setUnassignedLoads] = useState<Load[]>([]);
    const [generatingSuggestions, setGeneratingSuggestions] = useState(false);

    useEffect(() => {
        // Only load existing suggestions on mount, don't automatically generate new ones
        getSuggestions();   
    }, []);
    const fetchUnassignedDrivers = async (): Promise<Driver[]> => {
    try {
        setLoading(true);
        
        const response = await fetch('/api/dispatcher/drivers', {
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
        setUnassignedDrivers(availableDrivers);
        setError(null);
        return availableDrivers; // Return the data
    } catch (error) {
        console.error('Error fetching unassigned drivers:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
        setUnassignedDrivers([]);
        return []; // Return empty array on error
    } finally {
        setLoading(false);
    }
};

const fetchUnassignedTrucks = async (): Promise<Truck[]> => {
    try {
        setLoading(true);
        
        const response = await fetch('/api/trucks', {
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
        setUnassignedTrucks(availableTrucks);
        setError(null);
        return availableTrucks; // Return the filtered available trucks
    } catch (error) {
        console.error('Error fetching unassigned trucks:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
        setUnassignedTrucks([]);
        return []; // Return empty array on error
    } finally {
        setLoading(false);
    }
};

const fetchUnassignedTrailers = async (): Promise<Trailer[]> => {
    try {
        setLoading(true);
        
        const response = await fetch('/api/trailers', {
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
        setUnassignedTrailers(availableTrailers);
        setError(null);
        return availableTrailers; // Return the filtered available trailers
    } catch (error) {
        console.error('Error fetching unassigned trailers:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
        setUnassignedTrailers([]);
        return []; // Return empty array on error
    } finally {
        setLoading(false);
    }
};

const fetchUnassignedLoads = async (): Promise<Load[]> => {
    try {
        setLoading(true);
        
        const response = await fetch('/api/dispatcher/loads', {
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
        let unassignedLoads = data.filter((load: Load) => load.status === 'UNASSIGNED');
        setUnassignedLoads(unassignedLoads);
        setError(null);
        return unassignedLoads; // Return the filtered unassigned loads
    } catch (error) {
        console.error('Error fetching unassigned loads:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
        setUnassignedLoads([]);
        return []; // Return empty array on error
    } finally {
        setLoading(false);
    }
    }

const makeSuggestionsParallel = async () => {
    try {
        setGeneratingSuggestions(true);
        setError(null);
        
        const [drivers, trucks, trailers, loads] = await Promise.all([
            fetchUnassignedDrivers(), 
            fetchUnassignedTrucks(), 
            fetchUnassignedTrailers(),
            fetchUnassignedLoads()
        ]);

        const assignmentData: RoutePlannerContext = {
            drivers: drivers,
            trucks: trucks,
            trailers: trailers,
            loads: loads
        }

        const routePlanner = new RoutePlanner();
        const suggestions = routePlanner.makeTreeBasedAssignments(assignmentData, 100, 5, 5, "HIGHEST_FEASIBILITY");
        
        // Create all API calls as promises
        const allApiCalls: Promise<Response>[] = [];
        
        suggestions.forEach((suggestion: TreeBasedAssignment) => {
            const driverId = suggestion.driverGroup.driver.id;
            const truckId = suggestion.driverGroup.truck.id;
            const trailerId = suggestion.driverGroup.trailer.id;

            // Add root node update to promises array
            const rootLoadId = suggestion.primaryRoute.rootNode.load.id;
            allApiCalls.push(
                fetch(`/api/dispatcher/loads/${rootLoadId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        assigned_driver: driverId,
                        assigned_truck: truckId,
                        assigned_trailer: trailerId,
                        status: "SUGGESTED"
                    })
                })
            );

            // Add all route path updates to promises array
            suggestion.primaryRoute.routePath.forEach((node: RouteNode) => {
                allApiCalls.push(
                    fetch(`/api/dispatcher/loads/${node.load.id}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            assigned_driver: driverId,
                            assigned_truck: truckId,
                            assigned_trailer: trailerId,
                            status: "SUGGESTED"
                        })
                    })
                );
            });
        });

        // Execute all API calls in parallel
        await Promise.all(allApiCalls);
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
            
            const response = await fetch('/api/dispatcher/suggested', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch loads: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            const driverIds = new Set<string>((data || []).map((load: Load) => load.assigned_driver));
                        
            driverIds.forEach((id: string) => {if(id) {
                getDriverName(id)
            }});
            
            const truckIds = new Set<string>((data || []).map((load: Load) => load.assigned_truck));
            
            truckIds.forEach((id: string) => {if(id) {
                getTruckMakeModel(id)
            }});

            const trailerIds = new Set<string>((data || []).map((load: Load) => load.assigned_trailer));
            
            trailerIds.forEach((id: string) => {if(id) {
                getTrailerMakeModel(id)
            }});
                        
            setSuggestedLoads(data || []);
        } catch (err) {
            console.error('Error fetching suggestions:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch loads');
            setSuggestedLoads([]);
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
    
    if (loading && suggestedLoads.length === 0) {
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
                                Load ID
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
                                Due Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                View Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-900 divide-y divide-gray-400">
                        {suggestedLoads.map((load) => (
                            <tr key={load.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-400">{load.id}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-400 hover:underline hover:cursor-pointer">
                                        <Link 
                                            href={`/admin/users/${load.assigned_driver}`}
                                            className="group"
                                        >
                                            <span className='text-sm font-medium text-gray-300 hover:underline hover:cursor-pointer'>
                                                {load.assigned_driver ? (driverNames[load.assigned_driver] || 'Assigning Driver...') : 'No Driver Assigned'}
                                            </span>
                                        </Link>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-400">{load.assigned_truck ? (trucks[load.assigned_truck] || 'Assigning Truck...'): 'No Truck Assigned'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-400">{load.assigned_trailer ? (trailers[load.assigned_trailer] || 'Assigning Trailer...'): 'No Trailer Assigned'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-400">{(() => {
                                            if (!load.due_by) return 'No due date';
                                            const date = new Date(load.due_by);
                                            if (isNaN(date.getTime())) return 'Invalid date';
                                            return `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getUTCFullYear()}`;
                                        })()}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col space-y-2">
                                        <Link 
                                            href={`/load/${load.id}`}
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
            
            {suggestedLoads.length === 0 && !loading && (
                <div className='text-center py-8'>
                    <p className="text-gray-500 mt-2">No suggested loads found.</p>
                </div>
            )}
            
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