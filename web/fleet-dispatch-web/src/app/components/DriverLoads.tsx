import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Load, User } from "@prisma/client";

export default function DriverLoads(user: User) {
    const [loads, setLoads] = useState<Load[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const userId = user.id;

    useEffect(() => {
        fetchLoads();
    }, []);

    const fetchLoads = async () => {
        try {
            setLoading(true);
            // Simulating API call with sample data for demo
            
            const response = await fetch(`/api/driver/loads/${userId}`);
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
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white border border-gray-200 rounded-md p-4">
                <h2 className="text-2xl font-bold mb-4">Your Loads</h2>
                {loads.length === 0 ? (
                    <p>No loads found.</p>
                ) : (
                    <ul>
                        {loads.map((load) => (
                            <li key={load.id} className="mb-2">
                                <Link href={`/loads/${load.id}`} className="text-blue-600 hover:underline">
                                    {load.origin} - {load.destination}
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}