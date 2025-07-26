"use client";

import { Driver, Load } from "@prisma/client";
import { useEffect, useState } from "react";
import Link from 'next/link';

export default function UnassignedDrivers() {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUnassignedDrivers = async () => {
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
            
            const availableDrivers = driversArray.filter((driver: Driver) => driver.is_available);
            setDrivers(availableDrivers);
            setError(null);
        } catch (error) {
            console.error('Error fetching unassigned drivers:', error);
            setError(error instanceof Error ? error.message : 'Unknown error occurred');
            setDrivers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUnassignedDrivers();
    }, []);

    if (loading) {
        return (
            <div className="w-1/2 mx-0 p-6">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-lg">Loading available drivers...</span>
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
                            <strong>Error loading available drivers: {error}</strong>
                        </div>
                        <button 
                            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700" 
                            onClick={fetchUnassignedDrivers}
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-1/2 mx-0 p-6">
            {/* Drivers Table */}
            <div className="bg-gray-900 shadow rounded-lg overflow-hidden">
                {/* Table Header */}
                <div className="px-6 py-4 border-b border-gray-900">
                    <h2 className="text-xl font-semibold text-gray-400">Available Drivers ({drivers.length})</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Drivers ready for assignment
                    </p>
                </div>
            </div>

            {/* Table Body */}
            <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-400">
                    <thead className="bg-gray-800">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Phone
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Info
                            </th>
                        </tr>
                    </thead>

                    <tbody className="bg-gray-800 divide-y divide-gray-200">
                        {drivers.map((driver) => (
                            <tr key={driver.id} className="hover:bg-gray-700">
                                <td className='px-6 py-4 whitespace-nowrap'>
                                    <div className='flex items-center'>
                                        <div className='flex-shrink-0 h-10 w-10'>
                                            <div className='h-10 w-10 rounded-full flex items-center justify-left hover:cursor-pointer hover:underline'>
                                                <span className="text-sm font-medium text-gray-300">
                                                    {`${driver.first_name} ${driver.last_name}`}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    {driver.phone_number}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        driver.is_available 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {driver.is_available ? 'Available' : 'Not Available'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <Link 
                                        href={`/dispatcher/drivers/${driver.id}`}
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

            {drivers.length === 0 && (
                <div className='text-center py-8'>
                    <p className="text-gray-500 mt-2">No available drivers found.</p>
                </div>
            )}
            
            {/* Refresh Button */}
            <div className="mt-6 flex justify-end">
                <button
                    onClick={fetchUnassignedDrivers}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Refreshing...' : 'Refresh Data'}
                </button>
            </div>
        </div>
    );
}