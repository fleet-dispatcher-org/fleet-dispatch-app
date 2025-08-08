'use client'
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Role, Status } from "@prisma/client";
import Logo from './Logo';
import { Timestamp } from 'next/dist/server/lib/cache-handlers/types';
import { tr } from 'react-day-picker/locale';
import Link from 'next/link';
import { Load } from "@prisma/client";


// interface Load {
//     id: string,
//     origin: string,
//     destination: string,
//     due_by: Timestamp,
//     weight: number,
//     status: Status,
//     started_at: Timestamp,
//     assigned_driver: string,
//     assigned_trailer: string,
//     assigned_truck: string,
//     percent_complete: number,
//     is_active: boolean,
//     due_date: Timestamp
// }

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export default function DispatchBoard() {
    const { data: session } = useSession();
    const [loads, setLoads] = useState<Load[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingLoadId, setUpdatingLoadId] = useState<string | null>(null);
    const [driverNames, setDriverNames] = useState<Record<string, string>>({});
    const [trucks, setTrucks] = useState<Record<string, string>>({});
    const [trailers, setTrailers] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchLoads();
    }, []);

    const getUnassignedLoads = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/dispatcher/loads/unassigned');
            if (!response.ok) {
                throw new Error('Failed to fetch unassigned loads');
            }
            const data = await response.json();
            setLoads(data || []);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }

    const fetchLoads = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/dispatcher/loads');

            if (!response.ok) {
                throw new Error('Failed to fetch loads');
            }

            const data = await (await response.json()).filter((item: { status: string; })  => 
                ['PENDING', 'IN_PROGRESS', 'REQUESTED'].includes(item.status)
            );
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
            
            setLoads(data || []);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }

    const updateLoad = async (loadId: string, newStatus: string) => {
    setUpdatingLoadId(loadId);
    try {
        const response = await fetch(`/api/dispatcher/${loadId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: loadId,
                status: newStatus
            })
        })
        
        if (!response.ok) {
            // Get the actual error message from the API
            const errorData = await response.json();
            console.error('API Error:', errorData);
            throw new Error(`HTTP ${response.status}: ${errorData.message || 'Failed to update load'}`);
        }
        
        setLoads(prevLoads =>
            prevLoads.map(load =>
                load.id === loadId ? { ...load, status: newStatus as Status } : load
            )
        )
        alert("Load status updated successfully!");

    } catch (err) {
        console.error('Error updating load:', err);
        alert(`Failed to update load: ${err}`); // Show the actual error
    } finally {
        setUpdatingLoadId(null);
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

    const terminateLoad = async (loadId: string) => {
        setUpdatingLoadId(loadId);
        try {
        const response = await fetch(`/api/dispatcher/loads/${loadId}/terminate`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                status: 'TERMINATED',
                is_active: false
            })
        })
        if (!response.ok) {
            throw new Error('Failed to update load');
        }
        setLoads(prevLoads =>
            prevLoads.map(load =>
                load.id === loadId ? { ...load, is_active: true } : load
            )
        )
        alert("Load terminated successfully!");

        } catch (err) {
            console.error('Error updating load:', err);
            alert('Failed to update load');
        }
        finally {
            setUpdatingLoadId(null);
        }
    }
    
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-lg">Loading dashboard...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="text-red-800">
                        <strong>Error loading dashboard: {error}</strong>
                    </div>
                </div>
            </div>
        );
    }

    if (session && session.user.role === Role.DRIVER) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="text-red-800">
                        <strong>Access denied. You are not authorized to access this page.</strong>
                    </div>
                </div>
            </div>
        );
    }
    return (
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

            {/* Loads Table */}
            <div className="bg-gray-900 shadow rounded-lg overflow-hidden">
                {/* Table Header */}
                <div className="px-6 py-4 border-b border-gray-900">
                    <h2 className="text-xl font-semibold text-gray-400">All Active Loads</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Manage Drivers and Loads here
                    </p>
                </div>
            </div>

            {/* Table Body */}
            <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-400">
                        <thead className="bg-gray-800">
                             <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Origin
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Driver
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Truck
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Trailer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Due Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Info
                                </th>
                            </tr>
                        </thead>

                        {/* Table Body */}
                        <tbody className="bg-gray-800 divide-y divide-gray-200">
                            {loads.map((load) => (
                                <tr key={load.id} className="hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {load.origin}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <Link 
                                            href={`/admin/users/${load.assigned_driver}`}
                                            className="group">
                                            <span className='text-sm font-medium text-gray-300 hover:underline'>
                                                {driverNames[load.assigned_driver || ""] ?? "No Driver Assigned"}
                                            </span>
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hover:underline hover:cursor-pointer">
                                        <Link 
                                            href={`/trucks/${load.assigned_truck}`}
                                            className="group">
                                                {trucks[load.assigned_truck || ""] ?? "No Truck Assigned"}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hover:underline hover:cursor-pointer">
                                        { trailers[load.assigned_trailer || ""] ?? "No Trailer Assigned"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hover:underline hover:cursor-pointer">
                                        {(() => {
                                            if (!load.due_by) return 'No due date';
                                            const date = new Date(load.due_by);
                                            if (isNaN(date.getTime())) return 'Invalid date';
                                            return `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getUTCFullYear()}`;
                                        })()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center space-x-3">
                                            <select 
                                                value={load.status}
                                                onChange={(e) => updateLoad(load.id, e.target.value)}
                                                className={`text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed
                                                    ${
                                                        load.status === 'DELIVERED' ? 'bg-green-800 text-green-200' :
                                                        load.status === 'IN_PROGRESS' ? 'bg-blue-800 text-blue-200' :
                                                        load.status === 'PENDING' ? 'bg-yellow-800 text-yellow-200' :
                                                        load.status === 'TERMINATED' ? 'bg-red-800 text-red-200' :
                                                        load.status === 'REQUESTED' ? 'bg-pink-800 text-pink-200' : 
                                                        'bg-gray-800 text-gray-200'}`}
                                                >
                                                <option value="TERMINATED">TERMINATED</option>
                                                <option value="SUGGESTED" hidden={true}>SUGGESTED</option>
                                                <option value="REQUESTED" hidden={true}>REQUESTED</option>
                                                <option value="IN_PROGRESS">IN PROGRESS</option>
                                                <option value="PENDING">PENDING</option> 
                                                <option value="DELIVERED">DELIVERED</option>   
                                            </select>

                                            {updatingLoadId === load.id && (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                                )}
                                        </div>
                                    </td>
                                    <td>
                                        <Link 
                                            href={`/load/${load.id}`}
                                            className="group"
                                        >
                                            <span className='text-sm font-medium text-gray-300 hover:underline mx-auto'>
                                                View
                                            </span>
                                        </Link>
                                    </td>
                                </tr>
                        ))}
                        </tbody>
                    </table> 
            </div>   
        {loads.length === 0 && (
            <div className='text-center py-8'>
                <p className="text-gray-500 mt-2">No loads found.</p>
            </div>)}
            
            {/* Refresh Button */}
            <div className="mt-6 flex justify-end">
                <button
                    onClick={fetchLoads}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Refreshing...' : 'Refresh Data'}
                </button>
            </div>
         </div>
    )
}
