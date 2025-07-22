'use client'
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Role, Status } from "@prisma/client";
import Logo from './Logo';
import { Timestamp } from 'next/dist/server/lib/cache-handlers/types';

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

export default function AIBoard() {
    const { data: session } = useSession();
    const [loads, setLoads] = useState<Load[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingLoadId, setUpdatingLoadId] = useState<string | null>(null);

    useEffect(() => {
        getSuggestions();
    }, []);
    
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
            setLoads(data?.loads || []);
        } catch (err) {
            console.error('Error fetching suggestions:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch loads');
            setLoads([]);
        } finally {
            setLoading(false);
        }
    };

    const acceptLoad = async (loadId: string, newStatus: string, newDriverId: string, newTruckId: string, newTrailerId: string) => {
        try {
            setUpdatingLoadId(loadId);
            
            const response = await fetch(`/api/dispatcher/${loadId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: newStatus,
                    assigned_driver: newDriverId,
                    assigned_truck: newTruckId,
                    assigned_trailer: newTrailerId
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to accept load: ${response.status}`);
            }

            // Refresh the data after successful update
            await getSuggestions();
        } catch (err) {
            console.error('Error accepting load:', err);
            setError(err instanceof Error ? err.message : 'Failed to accept load');
        } finally {
            setUpdatingLoadId(null);
        }
    };

    const rejectLoad = async (loadId: string, newStatus: string) => {
        try {
            setUpdatingLoadId(loadId);
            
            const response = await fetch(`/api/dispatcher/${loadId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: newStatus,
                    assigned_driver: null,
                    assigned_truck: null,
                    assigned_trailer: null
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to reject load: ${response.status}`);
            }

            // Refresh the data after successful update
            await getSuggestions();
        } catch (err) {
            console.error('Error rejecting load:', err);
            setError(err instanceof Error ? err.message : 'Failed to reject load');
        } finally {
            setUpdatingLoadId(null);
        }
    };

    if (loading && loads.length === 0) {
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
                    <h2 className="text-xl font-semibold text-gray-400">AI Suggested Loads</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Accept or Deny suggested loads here
                    </p>
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
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-900 divide-y divide-gray-400">
                        {loads.map((load) => (
                            <tr key={load.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-400">{load.id}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-400">{load.assigned_driver}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-400">{load.assigned_truck}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-400">{load.assigned_trailer}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-400">{load.due_date}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col space-y-2">
                                        <button
                                            className="px-3 py-1 text-xs border border-gray-400 rounded-full bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={updatingLoadId === load.id}
                                            onClick={() => acceptLoad(load.id, "PENDING", load.assigned_driver, load.assigned_truck, load.assigned_trailer)}
                                        >
                                            {updatingLoadId === load.id ? 'Processing...' : 'Accept'}
                                        </button>
                                        <button
                                            className="px-3 py-1 text-xs border border-gray-400 rounded-full bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={updatingLoadId === load.id}
                                            onClick={() => rejectLoad(load.id, "SUGGESTED")}
                                        >
                                            {updatingLoadId === load.id ? 'Processing...' : 'Deny'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {loads.length === 0 && !loading && (
                <div className='text-center py-8'>
                    <p className="text-gray-500 mt-2">No suggested loads found.</p>
                </div>
            )}
            
            {/* Refresh Button */}
            <div className="mt-6 flex justify-end">
                <button
                    onClick={getSuggestions}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Refreshing...' : 'Refresh Data'}
                </button>
            </div>
        </div>
    );
}