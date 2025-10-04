'use client'
import { useState, useEffect } from 'react';
import { Trailer, Load, Driver, Truck } from "@prisma/client";
import Link from 'next/link';

interface ShipmentStep {
    id: number;
    location: [number, number];
    service?: number; // in seconds
}

interface Shipment {
    id: number;
    amount: [number];
    pickup: ShipmentStep; 
    delivery: ShipmentStep;
};

interface Vehicle {
    id: number;
    start: [number, number];
    end: [number, number];
    capacity: number[];
}

export default function AIBoard() {
    const [suggestedLoads, setSuggestedLoads] = useState<Load[]>([]);
    const [trucks, setTrucks] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [trailers, setTrailers] = useState<Record<string, string>>({});
    const [driverNames, setDriverNames] = useState<Record<string, string>>({});
    const [unassignedLoads, setUnassignedLoads] = useState<Load[]>([]);
    const [generatingSuggestions, setGeneratingSuggestions] = useState(false);
    const apiUrl = process.env.NEXT_PUBLIC_BASE_URL;

    useEffect(() => {
        // Only load existing suggestions on mount, don't automatically generate new ones
        getSuggestions();   
    }, []);

    const parseCoords = (coords: Array<{ lat: string | number; long: string | number }>): [number, number] | null => {
        if (!coords) return null;

        // Helper to safely convert to number
        const toNumber = (val: any): number | null => {
            if (typeof val === 'number') return val;
            if (typeof val === 'string') {
                const num = parseFloat(val);
                return isNaN(num) ? null : num;
            }
            return null;
        };

        console.log('Parsing coordinates:', coords);

        if(Array.isArray(coords)) {
            let coordsObject = coords[0];
            let lat = toNumber(coordsObject.lat);
            let long = toNumber(coordsObject.long);
            console.log('Parsed from array:', lat, long);
            if (lat !== null && long !== null) {
                return [lat, long];
            }
        }
        
        return null;
    };

    const isValidCoordinateArray = (coords: any): coords is Array<{ lat: string | number; long: string | number }> => {
    return Array.isArray(coords) && 
           coords.length > 0 && 
           coords[0] !== null &&
           typeof coords[0] === 'object' &&
           'lat' in coords[0] && 
           'long' in coords[0];
};
    
    const fetchUnassignedDrivers = async (): Promise<Driver[]> => {
    try {
        setLoading(true);
        
        const response = await fetch(`${apiUrl}/api/dispatcher/drivers`, {
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
        
        const response = await fetch(`${apiUrl}/api/trucks`, {
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
        
        const response = await fetch(`${apiUrl}/api/trailers`, {
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
        
        const response = await fetch(`${apiUrl}/api/dispatcher/loads`, {
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

const makeSuggestions = async () => {
    try {
        setGeneratingSuggestions(true);
        setError(null);
        
        const [unassignedDrivers, unassignedTrucks, unassignedTrailers, unassignedLoads] = await Promise.all([
            fetchUnassignedDrivers(), 
            fetchUnassignedTrucks(), 
            fetchUnassignedTrailers(),
            fetchUnassignedLoads()
        ]);

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        if (!baseUrl) {
            throw new Error('Base URL is not defined in environment variables');
        }

        let shipments: Shipment[] = [];
        let vehicles: Vehicle[] = [];
        let loadIdMap = new Map<number, string>();
        let driverIdMap = new Map<number, string>();

        console.log('Unassigned Loads:', unassignedLoads);

        // Helper function to validate coordinates
        const isValidCoordinate = (coords: number[] | null): coords is [number, number] => {
            return coords !== null && 
                   coords.length === 2 && 
                   typeof coords[0] === 'number' && 
                   typeof coords[1] === 'number' &&
                   !isNaN(coords[0]) && 
                   !isNaN(coords[1]) &&
                   coords[0] >= -180 && coords[0] <= 180 && // longitude
                   coords[1] >= -90 && coords[1] <= 90;     // latitude
        };

        unassignedLoads.forEach((load, index) => {
            const origin_coords = isValidCoordinateArray(load.origin_coordinates) 
            ? parseCoords(load.origin_coordinates) 
            : null;
        const dest_coords = isValidCoordinateArray(load.destination_coordinates) 
            ? parseCoords(load.destination_coordinates) 
            : null;
            console.log(`Load ${load.id} - Origin:`, origin_coords, 'Destination:', dest_coords);
            // Validate both coordinate pairs
                shipments.push({
                    id: index,
                    pickup: {
                        id: index * 2, // Unique ID for pickup
                        location: [origin_coords![1], origin_coords![0]], // [lng, lat]
                        service: 300
                    },
                    delivery: {
                        id: index * 2 + 1, // Unique ID for delivery
                        location: [dest_coords![1], dest_coords![0]], // [lng, lat]
                        service: 300
                    },
                    amount: [1]
                });
                loadIdMap.set(index, load.id);
        });

        console.log('Shipments for VROOM:', JSON.stringify(shipments, null, 2));

        // Prepare vehicles from unassigned drivers
        unassignedDrivers.forEach((driver, index) => {
            let startLocation: [number, number];
            let endLocation: [number, number];
            if (driver.current_location && isValidCoordinateArray(driver.current_location)) {
                const parsed = parseCoords(driver.current_location);
                startLocation = [parsed![1], parsed![0]];
                endLocation = [parsed![1], parsed![0]];
            } else if (driver.home_base && isValidCoordinateArray(driver.home_base)) {
                const parsed = parseCoords(driver.home_base);
                startLocation = [parsed![1], parsed![0]];
                endLocation = [parsed![1], parsed![0]];
            } else {
                console.warn(`Driver ${driver.id} has invalid current and home base locations, using default location`);
                startLocation = [-122.4194, 37.7749]; // Example: San Francisco
                endLocation = [-122.4194, 37.7749];
            }

            vehicles.push({
                id: index,
                start: startLocation,
                end: endLocation,
                capacity: [5]
            });

            driverIdMap.set(index, driver.id);
        });

        console.log('Vehicles for VROOM:', JSON.stringify(vehicles, null, 2));

        // Don't send empty arrays to VROOM
        if (shipments.length === 0) {
            throw new Error('No valid shipments to optimize');
        }
        if (vehicles.length === 0) {
            throw new Error('No valid vehicles available');
        }

        const payload = { vehicles, shipments };
        console.log('VROOM payload:', JSON.stringify(payload, null, 2));

        const response = await fetch(`${baseUrl}/api/vroom`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`VROOM API error: ${JSON.stringify(errorData)}`);
        }

        const result = await response.json();
        console.log('VROOM result:', result);
        
        // Process the result here...

    } catch (error) {
        console.error('Error generating suggestions:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred while generating suggestions');
    } finally {
        setGeneratingSuggestions(false);
    }
}

const handleGetSuggestions = async () => {
    await makeSuggestions();
}
    const getSuggestions = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch(`${apiUrl}/api/dispatcher/suggested`, {
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
            const response = await fetch(`${apiUrl}/api/trucks/${truckId}`);
            
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
            const response = await fetch(`${apiUrl}/api/trailers/${trailerId}`);
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
            const response = await fetch(`${apiUrl}/api/admin/users/${driverId}`);
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