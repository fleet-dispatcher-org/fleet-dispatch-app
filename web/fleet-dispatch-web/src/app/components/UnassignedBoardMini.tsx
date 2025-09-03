"use client";

import { Load } from "@prisma/client";
import { useEffect, useState } from "react";
import Link from 'next/link';
import Logo from './Logo';

export default function UnassignedBoardMini() {
    const [loads, setLoads] = useState<Load[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUnassignedLoads = async () => {
        try {
            setLoading(true);
            
            const response = await fetch('/api/dispatcher/loads', {
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
            
            if (!Array.isArray(data)) {
                throw new Error('Expected array but got: ' + typeof data);
            }
            
            const unassignedLoads = data.filter((load: Load) => load.status === "UNASSIGNED");
            setLoads(unassignedLoads);
            setError(null);
        } catch (error) {
            console.error('Error fetching unassigned loads:', error);
            setError(error instanceof Error ? error.message : 'Unknown error occurred');
            setLoads([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUnassignedLoads();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-lg">Loading unassigned loads...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="text-red-800">
                        <strong>Error loading unassigned loads: {error}</strong>
                    </div>
                    <button 
                        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700" 
                        onClick={fetchUnassignedLoads}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 mt-4">

            {/* Loads Table */}
            <div className="bg-gray-900 shadow rounded-lg overflow-hidden">
                {/* Table Header */}
                <div className="px-6 py-4 border-b border-gray-900">
                    <h2 className="text-xl font-semibold text-gray-400">Unassigned Loads ({loads.length})</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Loads ready for assignment
                    </p>
                </div>
            </div>

            {/* Table Body */}
            <div className="overflow-x-auto">
                <table className="table-fixed w-full divide-y divide-gray-400">
                    <thead className="bg-gray-800">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Origin
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Destination
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Due Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Info
                            </th>
                        </tr>
                    </thead>

                    <tbody className="bg-gray-800 divide-y divide-gray-200">
                        {loads.map((load) => (
                            <tr key={load.id} className="hover:bg-gray-700">
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='flex items-center'>
                                        <div className='flex-shrink-0 h-10 w-10'>
                                            <div className='h-10 w-10 rounded-full flex items-center justify-start hover:cursor-pointer pr-25'>
                                                <span className="text-sm font-medium text-gray-300">
                                                    {load.origin}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    {load.destination}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {(() => {
                                        if (!load.due_by) return 'No due date';
                                        const date = new Date(load.due_by);
                                        if (isNaN(date.getTime())) return 'Invalid date';
                                        return `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getUTCFullYear()}`;
                                    })()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
                    <p className="text-gray-500 mt-2">No unassigned loads found.</p>
                </div>
            )}
            
            {/* Refresh Button */}
            <div className="mt-6 flex justify-end">
                <button
                    onClick={fetchUnassignedLoads}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Refreshing...' : 'Refresh Data'}
                </button>
            </div>
        </div>
    );
}