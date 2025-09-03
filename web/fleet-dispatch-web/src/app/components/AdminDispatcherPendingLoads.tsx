"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import type { Load } from "@prisma/client";
import Logo from './Logo';
import Image from 'next/image'
import Link from 'next/link';



export default function AdminDispatcherPendingLoads() {
    const { data: session } = useSession();
    const [loads, setLoads] = useState<Load[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
            const pendingLoads = data.filter((load: Load) => load.status === "PENDING");
            setLoads(pendingLoads || []);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }

    if (loads.length === 0) {
        return (
            <div className=" bg-gray-900 flex flex-col items-center border rounded-md border-gray-700 justify-center py-4 px-4 sm:px-6 lg:px-8">
                <Logo />
                <h3 className="mt-2 text-center text-xl text-gray-400 mb-2">Pending Loads</h3>
                <p>No pending loads found.</p>
            </div>
        );
    }

    return (
        <div className=" bg-gray-900 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Pending Loads</h2>
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p>{error}</p>
            ) : loads.length === 0 ? (
                <p>No pending loads found.</p>
            ) : (
                <div className="mt-8 max-w-md w-full space-y-4">
                    {loads.map((load) => (
                        <div key={load.id} className="bg-white shadow-sm rounded-md p-4">
                            <p className="text-gray-800">Origin: {load.origin}</p>
                            <p className="text-gray-800">Destination: {load.destination}</p>
                            <p className="text-gray-800">Assigned By: {load.assigned_by}</p>
                            <p className="text-gray-800">Assigned To: {load.assigned_driver}</p>
                            <p className="text-gray-800">Status: {load.status}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}