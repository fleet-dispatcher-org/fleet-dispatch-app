// LoadStatusClient.tsx (Client Component)
'use client';

import { useState } from 'react';

interface Props {
    loadId: string;
    initialStatus: string | null;
}

export default function LoadStatusClient({ loadId, initialStatus }: Props) {
    const [status, setStatus] = useState(initialStatus);

    async function updateLoadStatus(loadId: string, newStatus: string) {
        try {
            const response = await fetch(`/api/dispatcher/${loadId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (!response.ok) {
                throw new Error('Failed to update load status');
            }
            const data = await response.json();
            setStatus(newStatus); // Update local state
            return data;
        } catch (error) {
            console.error('Error updating load status:', error);
            return null;
        }
    }

    return (
    <div className="inline-block bg-gray-900 border border-gray-700 rounded-lg p-4 hover:bg-gray-700 transition-colors">
        <div className="flex flex-col space-y-2">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
            </h3>
            <select 
                name="status" 
                value={status as string}
                className={`text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed w-full
                    ${
                        status === 'DELIVERED' ? 'bg-green-800 text-green-200' :
                        status === 'IN_PROGRESS' ? 'bg-blue-800 text-blue-200' :
                        status === 'SUGGESTED' ? 'bg-purple-800 text-purple-200' :
                        status === 'PENDING' ? 'bg-yellow-800 text-yellow-200' :
                        status === 'UNASSIGNED' ? 'bg-gray-800 text-gray-200' :
                        status === 'TERMINATED' ? 'bg-red-800 text-red-200' : 
                        'bg-gray-800 text-gray-200'}`}
                onChange={(e) => updateLoadStatus(loadId, e.target.value)}>
                    <option value="PENDING" className="bg-white text-black">Pending</option>
                    <option value="IN_PROGRESS" className="bg-white text-black">In Progress</option>
                    <option value="TERMINATED" className="bg-white text-black">Terminated</option>
                    <option value="DELIVERED" className="bg-white text-black">Delivered</option>
                    <option value="SUGGESTED" className='bg-white text-black'>Suggested</option>
                    <option value="UNASSIGNED" className='bg-white text-black'>Unassigned</option>
            </select>
        </div>
    </div>
);
}