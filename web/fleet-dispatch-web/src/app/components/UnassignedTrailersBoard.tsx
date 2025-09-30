"use client";

import { Trailer } from "@prisma/client";
import { useEffect, useState } from "react";
import Link from 'next/link';

export default function UnassignedTrailersBoard() {
    const [trailers, setTrailers] = useState<Trailer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const apiUrl = process.env.NEXT_PUBLIC_BASE_URL;

    const fetchUnassignedTrailers = async () => {
        try {
            setLoading(true);
            
            const response = await fetch(`${apiUrl}/api/trailers`, {
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
            let trailersArray;
            if (Array.isArray(data)) {
                trailersArray = data;
            } else if (data && Array.isArray(data.trailers)) {
                trailersArray = data.trailers;
            } else {
                throw new Error('Invalid response format: expected array or object with trailers property');
            }
            
            const availableTrailers = trailersArray.filter((trailer: Trailer) => trailer.trailer_status === "AVAILABLE");
            setTrailers(availableTrailers);
            setError(null);
        } catch (error) {
            console.error('Error fetching unassigned trailers:', error);
            setError(error instanceof Error ? error.message : 'Unknown error occurred');
            setTrailers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUnassignedTrailers();
    }, []);

    if (loading) {
        return (
            <div className="w-1/2 mx-0 p-6">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-lg">Loading available trailers...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-1/2 mx-0 p-6">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="text-red-800">
                            <strong>Error loading available trailers: {error}</strong>
                        </div>
                        <button 
                            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700" 
                            onClick={fetchUnassignedTrailers}
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full mx-0 p-6">
            {/* Trailers Table */}
            <div className="bg-gray-900 shadow rounded-lg overflow-hidden">
                {/* Table Header */}
                <div className="px-6 py-4 border-b border-gray-900">
                    <h2 className="text-xl font-semibold text-gray-400">Available Trailers ({trailers.length})</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Trailers ready for assignment
                    </p>
                </div>
            </div>

            {/* Table Body */}
            <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-400">
                    <thead className="bg-gray-800">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                License Plate
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Make, Model, Year
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Capacity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Info
                            </th>
                        </tr>
                    </thead>

                    <tbody className="bg-gray-800 divide-y divide-gray-200">
                        {trailers.map((trailer) => (
                            <tr key={trailer.id} className="hover:bg-gray-700">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    {trailer.license_plate}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    {`${trailer.make}, ${trailer.model}, ${trailer.year}`}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    {`${trailer.max_cargo_capacity} lbs`}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <Link 
                                        href={`/trailer/${trailer.id}`}
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

            {trailers.length === 0 && (
                <div className='text-center py-8'>
                    <p className="text-gray-500 mt-2">No available trailers found.</p>
                </div>
            )}
            
            {/* Refresh Button */}
            <div className="mt-6 flex justify-end">
                <button
                    onClick={fetchUnassignedTrailers}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Refreshing...' : 'Refresh Data'}
                </button>
            </div>
        </div>
    );
}