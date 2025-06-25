'use client'
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Role, Status } from "@prisma/client";
import Logo from './Logo';
import { Timestamp } from 'next/dist/server/lib/cache-handlers/types';
import { tr } from 'react-day-picker/locale';


interface Load {
    id: string,
    origin: string,
    destination: string,
    weight: number,
    status: Status,
    started_at: Timestamp,
    assigned_driver: string,
    assigned_trailer: string,
    assigned_truck: string,
    percent_complete: number,
    is_active: boolean,
    due_date: Timestamp
}

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

    useEffect(() => {
        fetchLoads();
    }, []);

    const fetchLoads = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/dispatcher/loads');

            if (!response.ok) {
                throw new Error('Failed to fetch loads');
            }

            const data = await response.json();
            setLoads(data?.loads || []);
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
            const response = await fetch(`/api/dispatcher/loads/${loadId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: newStatus
                })
            })
            if (!response.ok) {
                throw new Error('Failed to update load');
            }
            setLoads(prevLoads =>
                prevLoads.map(load =>
                    load.id === loadId ? { ...load, status: newStatus as Status } : load
                )
            )
            alert("Load status updated successfully!");

        } catch (err) {
            console.error('Error updating load:', err);
            alert('Failed to update load');
        } finally {
            if (updatingLoadId === loadId) {
                setUpdatingLoadId(null);
            }
        }
        setUpdatingLoadId(null);
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
                    <h2 className="text-xl font-semibold text-gray-400">All Users</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Manage user roles and permissions
                    </p>
                </div>
            </div>

            {/* Table Body */}
            <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-400">
                        <thead className="bg-gray-800">
                             <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Load ID
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
                            </tr>
                        </thead>

                        {/* Table Body */}
                        <tbody className="bg-gray-800 divide-y divide-gray-200">
                            {loads.map((load) => (
                                <tr key={load.id} className="hover:bg-gray-50">
                                    <td className='px-6 py-4 whitespace-nowrap'>
                                        <div className='flex items-center'>
                                            <div className='flex-shrink-0 h-10 w-10'>
                                                <div className='h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center'>
                                                    <span>
                                                        {load.id}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        { load.assigned_driver?.charAt(0).toUpperCase() ?? "No Driver Assigned"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        { load.assigned_truck?.charAt(0).toUpperCase() ?? "No Truck Assigned"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        { load.assigned_trailer?.charAt(0).toUpperCase() ?? "No Trailer Assigned"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        { new Date(load.due_date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center space-x-3">
                                            <select 
                                                value={load.status}
                                                onChange={(e) => updateLoad(load.id, e.target.value)}
                                                className='text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
                                            >
                                                <option value="TERMINATED">TERMINATED</option>
                                                <option value="IN_PROGRESS">IN PROGRESS</option>
                                                <option value="PENDING">PENDING</option>    
                                            </select>

                                            {updatingLoadId === load.id && (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                                )}
                                        </div>
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
