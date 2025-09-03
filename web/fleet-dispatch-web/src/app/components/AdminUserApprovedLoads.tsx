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
        return <div className='overflow-x-auto'>
                
            <div className="flex flex-col bg-gray-900 border border-gray-700 rounded-md p-4 items-center mt-2">
                <div className='flex items-center space-x-3 mb-4'>
                    <div className="w-10 h-10 bg-green-100 rounded-full flex flex-row items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-400">Approved Loads</h3>
                </div>
                <p className="text-gray-300">No loads found.</p>
            </div>
        </div>;
    }
    
    return (
        <div className='overflow-x-auto'>
            <Link href="/dispatcher" className='text-white hover:underline mb-2'>See All Loads &rarr;</Link>
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div className="flex flex-col bg-gray-900 border border-gray-700 rounded-md p-4 items-center mt-2">
                <h2 className="text-2xl font-bold mb-4 text-white ">Approved Loads</h2>
            </div>
            <table className="table-auto w-full border-collapse border border-gray-600">
                <thead className="bg-gray-800">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider border-b border-gray-700">
                            Origin
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider border-b border-gray-700">
                            Destination
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider border-b border-gray-700">
                            Due By
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider border-b border-gray-700">
                            Status
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-700">
                    {approvedLoads?.map((load) => (
                        <tr key={load.id} className="hover:bg-gray-800 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                                {load.origin}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                                {load.destination}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                                {load.due_by && new Date(load.due_by).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    load.status === 'DELIVERED' ? 'bg-green-800 text-green-200' :
                                    load.status === 'IN_PROGRESS' ? 'bg-blue-800 text-blue-200' :
                                    load.status === 'PENDING' ? 'bg-yellow-800 text-yellow-200' :
                                    load.status === 'TERMINATED' ? 'bg-red-800 text-red-200' :
                                    'bg-gray-800 text-gray-200'
                                }`}>
                                    {load.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
        </div>
    );
}