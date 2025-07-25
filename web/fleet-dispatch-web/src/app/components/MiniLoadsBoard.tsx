'use client'
import { useState, useEffect } from 'react';

interface Load {
    id: string;
    origin: string;
    destination: string;
    status: string;
}

export default function MiniLoadsBoard() {
    const [loads, setLoads] = useState<Load[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchLoads();
    }, []);

    const fetchLoads = async () => {
        try {
            setLoading(true);
            // Simulating API call with sample data for demo
            
            const response = await fetch('/api/dispatcher/loads/limited?limit=4&random=true');
            if (!response.ok) {
                throw new Error('Failed to fetch loads');
            }
            const data = await response.json();
            
            console.log('Fetched data:', data);
            setLoads(data || []);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
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
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="text-red-800">
                        <strong>Error loading dashboard:</strong> {error}
                    </div>
                    <button 
                        onClick={fetchLoads}
                        className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className='overflow-x-auto'>
            <a href="/dispatcher" className='text-white hover:underline mb-2'>See All Loads &rarr;</a>
            <table className="table-auto w-full border-collapse">
                <thead className="bg-gray-800">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider border-b border-gray-700">
                            Origin
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider border-b border-gray-700">
                            Destination
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider border-b border-gray-700">
                            Status
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-700">
                    {loads.map((load) => (
                        <tr key={load.id} className="hover:bg-gray-800 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                                {load.origin}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                                {load.destination}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    load.status === 'DELIVERED' ? 'bg-green-800 text-green-200' :
                                    load.status === 'IN_PROGRESS' ? 'bg-blue-800 text-blue-200' :
                                    load.status === 'PENDING' ? 'bg-yellow-800 text-yellow-200' :
                                    load.status === 'TERMINATED' ? 'bg-red-800 text-red-200' :
                                    load.status === 'SUGGESTED' ? 'bg-purple-800 text-purple-200' :
                                    load.status === 'REQUESTED' ? 'bg-pink-800 text-pink-200' :
                                    'bg-gray-800 text-gray-200'
                                }`}>
                                    {load.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            {loads.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No loads found
                </div>
            )}
        </div>
    )
}