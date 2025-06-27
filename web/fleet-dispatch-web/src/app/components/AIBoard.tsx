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
        const response = await fetch('/api/dispatcher/suggested', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            throw new Error('Failed to fetch loads');
        }

        const data = await response.json();
        setLoads(data?.loads || []);
        setError(null);
    }

    const acceptLoad= async(loadId: string, newStatus: string, newDriverId: string, newTruckId: string, newTrailerId: string) => {
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
        })
    }

    const rejectLoad= async(loadId: string, newStatus: string) => {
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
        })
    }

    return (
        <div className="max-w-7xl mx-auto p-6k mt-4">
            <div className="bg-gray-900 shadow rounded-lg overflow-hidden">
                    {/* Table Header */}
                    <div className="px-6 py-4 border-b border-gray-900">
                        <h2 className="text-xl font-semibold text-gray-400">AI Suggested Loads</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Accept or Deny suggested loads here
                        </p>
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
                                    Accept
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
                                <td className="px-6 py-4 whitespace-nowrap flex flex-col">
                                    <div className="text-sm border border-gray-400 rounded-full bg-green-300 text-gray-400" onClick={
                                        () => acceptLoad(load.id, "PENDING", load.assigned_driver, 
                                        load.assigned_truck, load.assigned_trailer)}>
                                            Accept</div>
                                    <div className="text-sm border border-gray-400 rounded-full bg-red-300 text-gray-400 mt-2" onClick={() => 
                                        rejectLoad(load.id, "SUGGESTED")}>
                                        Deny</div>
                                </td>
                            </tr>
                        ))
                        
                        }
                        </tbody>
                    </table>
            </div>
            {loads.length === 0 && (
            <div className='text-center py-8'>
                <p className="text-gray-500 mt-2">No suggested loads found.</p>
            </div>)}
            
            {/* Refresh Button */}
            <div className="mt-6 flex justify-end">
                <button
                    onClick={getSuggestions}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Refreshing...' : 'Refresh Data'}
                </button>
            </div>
        </div>
    )
    
}