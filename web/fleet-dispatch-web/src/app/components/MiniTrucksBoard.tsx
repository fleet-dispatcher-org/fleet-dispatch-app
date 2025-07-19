'use client'
import { useState, useEffect } from 'react';
import { Truck } from '@prisma/client';
import { useSession } from 'next-auth/react';


export default function MiniTrucksBoard() {
    const [trucks, setTrucks] = useState<Truck[]>([]);
    const [trucksLoading, setTrucksLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const session = useSession();

    useEffect(() => {
        fetchTrucks();
    }, []);

    const fetchTrucks = async () => {
        try {
            const response = await fetch('/api/trucks/limited?limit=4&random=true');
            if (!response.ok) {
                throw new Error('Failed to fetch trucks');
            }
            const data = await response.json();
            console.log('Fetched data:', data);
            
            setTrucks(data.trucks || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setTrucksLoading(false);
        }
    };

    if (trucksLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-lg">Loading dashboard...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="text-red-800">
                        <strong>Error loading dashboard:</strong> {error}
                    </div>
                    <button 
                        onClick={fetchTrucks}
                        className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Since capacity tons is a Decimal it needs to be converted to a typesafe number. 
    const formattedTrucks  = trucks
        ? trucks.map(truck => ({
            ...truck,
            capacity_tons: truck.capacity_tons ? Number(truck.capacity_tons) : 0,
            }))
        : [];
    
    return (
        <div className='overflow-x-auto'>
            { session.data?.user.role != 'DRIVER' && 
                <a href="/trucks" className='text-white hover:underline mb-2'>See all trucks &rarr;</a>
            }
            
            <table className="table-auto w-full border-collapse">
                <thead className="bg-gray-800">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider border-b border-gray-700">
                            License
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider border-b border-gray-700">
                            Year Make, Model
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider border-b border-gray-700">
                            Capacity Tons
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-700">
                    {formattedTrucks.map((truck) => (
                        <tr key={truck.id} className="hover:bg-gray-800 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                                {truck.license_plate}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-200`}>
                                {`${truck.year} ${truck.make}, ${truck.model}`}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                                {truck.capacity_tons}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}