"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import type { Load } from "@prisma/client";
import Logo from './Logo';
import Image from 'next/image'
import Link from 'next/link';

interface params {
    userId: string

}

export default function AdminUserApprovedLoads({ userId }: params) {
    const { data: session } = useSession();
    const [approvedLoads, setApprovedLoads] = useState<Load[] | null>(null);

    const user =  userId;

    const fetchApprovedLoads = async () => {
        try {
            const response = await fetch(`/api/dispatcher/loads`);
            const data = await response.json();
            const filteredData = data.filter((load: Load) => load.assigned_by ===  user);
            setApprovedLoads(filteredData);
        } catch (error) {
            console.error('Error fetching approved loads:', error);
        }
    };

    useEffect(() => {
        fetchApprovedLoads();
    }, []);

    if (!approvedLoads) {
        return <div>Loading...</div>;
    }

    if (approvedLoads.length === 0) {
        return <div className=" flex flex-col max-w-4xl mx-auto p-6 items-center">
            <div className="bg-gray-900 border border-gray-700 rounded-md p-12">
                <h2 className="text-2xl font-bold mb-4 text-white ">Approved Loads</h2>
                <p className="text-gray-300">No loads found.</p>
            </div>
        </div>;
    }
    
    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-gray-900 border border-gray-700 rounded-md p-4">
                <h2 className="text-2xl font-bold mb-4 text-white">Approved Loads</h2>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-600">
                        <thead>
                            <tr className="bg-gray-800">
                                <th className="border border-gray-600 px-4 py-2 text-left text-white">Origin</th>
                                <th className="border border-gray-600 px-4 py-2 text-left text-white">Destination</th>
                                <th className="border border-gray-600 px-4 py-2 text-left text-white">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {approvedLoads.map((load: Load) => (
                                <tr key={load.id}>
                                    <td className="border border-gray-600 px-4 py-2">{load.origin}</td>
                                    <td className="border border-gray-600 px-4 py-2">{load.destination}</td>
                                    <td className="border border-gray-600 px-4 py-2">
                                        <Link href={`/dispatcher/loads/${load.id}`} className="text-blue-500 hover:underline">View</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}