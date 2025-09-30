"use client";

import { Truck } from "@prisma/client";
import { useEffect, useState } from "react";
import Link from 'next/link';


export default function UnassignedTrucksBoard() {
    const [trucks, setTrucks] = useState<Truck[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const apiUrl = process.env.NEXT_PUBLIC_BASE_URL;

    useEffect(() => {
        fetchTrucks();
    }, []);

    async function fetchTrucks() {
        try {
            const response = await fetch(`${apiUrl}/api/trucks`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                cache: 'no-store',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch trucks');
            }
            const data = await response.json();
            const unassignedTrucks = data.filter((truck: Truck) => truck.truck_status === "AVAILABLE");
            setTrucks(unassignedTrucks);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch trucks');
        } finally {
            setLoading(false);
        }
    }

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
                        onClick={fetchTrucks}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-2/4 mx-0 p-6">

            {/* Loads Table */}
            <div className="bg-gray-900 shadow rounded-lg overflow-hidden">
                {/* Table Header */}
                <div className="px-6 py-4 border-b border-gray-900">
                    <h2 className="text-xl font-semibold text-gray-400">Unassigned Trucks ({trucks.length})</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Trucks ready for assignment
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
                                Capacity (Tons)
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Mileage
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Current Location
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Info
                            </th>
                        </tr>
                    </thead>

                    <tbody className="bg-gray-800 divide-y divide-gray-200">
                        {trucks.map((truck) => (
                            <tr key={truck.id} className="hover:bg-gray-700">
                                <td>
                                    <div className='flex items-center'>
                                        <div className='flex-shrink-0 h-10 w-10'>
                                            <div className='px-6 py-4 h-10 w-10 rounded-full flex items-center justify-left hover:cursor-pointer'>
                                                <span className="text-sm font-medium text-gray-300">
                                                    {truck.license_plate}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='flex items-center'>
                                        <div className='flex-shrink-0 h-10 w-10'>
                                            <div className='h-10 w-10 rounded-full flex items-center justify-start hover:cursor-pointer'>
                                                <p className="text-sm font-medium text-gray-300">
                                                    {truck.capacity_tons ? Number(truck.capacity_tons).toString() : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    {truck.mileage}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {truck.current_location}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <Link 
                                        href={`/truck/${truck.id}`}
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

            {trucks.length === 0 && (
                <div className='text-center py-8'>
                    <p className="text-gray-500 mt-2">No unassigned loads found.</p>
                </div>
            )}
            
            {/* Refresh Button */}
            <div className="mt-6 flex justify-end">
                <button
                    onClick={fetchTrucks}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Refreshing...' : 'Refresh Data'}
                </button>
            </div>
        </div>
    ); 
}