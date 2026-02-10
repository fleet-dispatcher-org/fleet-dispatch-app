"use client";
import { Truck } from '@prisma/client';
import React from 'react'
import { useEffect, useState } from 'react'

interface ReassignStatusProps {
    truck: string | null;
}

export default function ReassignTruckStatus(ReassignStatusProps: ReassignStatusProps) {
    const [dropDown, setDropDown] = useState<boolean>(false);
    const [truckDetails, setTruckDetails] = useState<Truck | null>(null);
    const { truck } = ReassignStatusProps;
    const AVAILABILITY_STATUSES = [ 
        "AVAILABLE",
        "ASSIGNED",
        "HAS_EMERGENCY",
        "UNAVAILABLE",
        "SUGGESTED",
        "SECONDARY_DUTY"];

    useEffect(() => {
        if (truck) {
            fetchTruckDetails(truck).then((data) => {
                setTruckDetails(data);
            });
        }
    }, [truck]);
    
    async function fetchTruckDetails(truckId: string): Promise<Truck | null> {
        try {
            const response = await fetch(`/api/trucks/${truckId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch truck details');
            }
            const data = await response.json();
            return data as Truck;
        } catch (error) {
            console.error('Error fetching truck details:', error);
            return null;
        }
    }

    
    async function updateTruckStatus(truckId: string, newStatus: string) {
        if (truck) {
            await fetch(`/api/trucks/${truckId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    truck_status: newStatus,
                }),
            });
        }
        setDropDown(false);
        // Refresh truck details after update
        const updatedTruck = await fetchTruckDetails(truckId);
        setTruckDetails(updatedTruck);

    }
    return (
        <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6">
            <div className="flex items-center space-x-3 mb-4">
                <div className='relative'>
                    <div className='flex flex-col items-center'>
                        <span className="text-gray-400 text-lg font-semibold mb-2">Truck Status: </span>
                        <button 
                            onClick={() => setDropDown(!dropDown)}
                            className="text-gray-400 text-sm px-4 py-2 border border-gray-600 rounded hover:bg-gray-800 hover:cursor-pointer transition-colors"
                        >
                            {truckDetails?.truck_status} ▼
                        </button>
                    </div>
                    { dropDown &&
                        <div className="absolute z-10 mt-2 w-48 bg-gray-800 border border-gray-700 rounded shadow-lg hover:cursor-pointer transition-colors">
                            {AVAILABILITY_STATUSES.map((status) => (
                                <div 
                                    key={status}
                                    className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
                                    onClick={() => updateTruckStatus(truckDetails!.id, status)}
                                >
                                    {status}
                                </div>
                            ))}
                        </div>
                    }
                </div>
            </div>                            
        </div>
    )
}