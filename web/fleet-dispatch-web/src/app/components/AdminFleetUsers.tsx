'use client'
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import type { Role, Status } from "@prisma/client";
import Logo from './Logo';
import Image from 'next/image'
import Link from 'next/link';

interface MiniUser {
    id: string;
    name: string | null;
    email: string | null;
    role: Role;
}

interface usersProps {
    fleetUsers: MiniUser[]
}

export default function AdminFleetUsers({fleetUsers}: usersProps) {
    return (
        <div className='overflow-x-auto'>
            <table className="w-full">
                <thead className='bg-gray-800'>
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider border-b border-gray-700">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider border-b border-gray-700">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider border-b border-gray-700">Role</th>
                    </tr>
                </thead>
                <tbody className='bg-gray-900 divide-y divide-gray-700'>
                    {fleetUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-800 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{user.name || 'No name'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{user.email || 'No email'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{user.role || 'No role'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}