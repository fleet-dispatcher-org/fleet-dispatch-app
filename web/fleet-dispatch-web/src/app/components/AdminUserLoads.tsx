'use client'
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import type { Role, Status } from "@prisma/client";
import Logo from './Logo';
import Image from 'next/image'
import Link from 'next/link';

interface MiniLoad {
    id: string;
    origin: string;
    destination: string;
    status: string;
}

interface MiniLoadsBoardProps {
    loads: MiniLoad[] | null;
}

export default function MiniLoadsBoard({ loads }: MiniLoadsBoardProps) {
    const acutal_loads = loads;


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
                    {acutal_loads?.map((load) => (
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
                                    'bg-gray-800 text-gray-200'
                                }`}>
                                    {load.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            {acutal_loads?.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No loads found
                </div>
            )}
        </div>
    )
}