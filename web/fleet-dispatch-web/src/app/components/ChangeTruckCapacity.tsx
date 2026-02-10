"use client";
import { Truck } from '@prisma/client';
import React from 'react'
import { useEffect, useState } from 'react'

interface ReassignStatusProps {
    truck: string | null;
}

export default function ReassignTruckStatus(ReassignStatusProps: ReassignStatusProps) {
    const [editing, setEditing] = useState<boolean>(false);
    const [truckDetails, setTruckDetails] = useState<Truck | null>(null);
    const [truckCapacity, setTruckCapacity] = useState<number>(0); 
    const { truck } = ReassignStatusProps;

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

    
    async function updateTruckStatus(truckId: string, newCapacity: string) {
        if (truck) {
            await fetch(`/api/trucks/${truckId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    capacity_tons: newCapacity,
                }),
            });
        }
        setEditing(false);
        // Refresh truck details after update
        const updatedTruck = await fetchTruckDetails(truckId);
        setTruckDetails(updatedTruck);

    }
    return (
        <div className="bg-gray-900 rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-4">
                <div className='relative'>
                    <div className='flex flex-col items-center'>
                        <button 
                            onClick={() => setEditing(!editing)}
                            hidden={ editing }
                            className="text-gray-400 text-sm px-4 py-2 hover:bg-gray-800 hover:cursor-pointer transition-colors"
                        >
                            { truckDetails ? 'Edit Capacity' : 'Loading...' }
                            {truckDetails?.capacity_tons?.toNumber()} Tons
                        </button>
                    </div>
                    { editing &&
                        <div className='flex flex-col items-center'>
                            <input
                                type="number"
                                defaultValue={truckDetails?.capacity_tons?.toNumber()}
                                onChange={(e) => setTruckCapacity(parseFloat(e.target.value))}
                                className="text-gray-400 text-sm px-4 py-2 border border-gray-600 rounded hover:bg-gray-800 hover:cursor-pointer transition-colors"
                            />
                            <button 
                                onClick={() => updateTruckStatus(truckDetails!.id, truckCapacity.toString())}
                                className="text-gray-400 text-sm px-4 py-2 border border-gray-600 rounded hover:bg-gray-800 hover:cursor-pointer transition-colors"
                            >
                                Save
                            </button>
                        </div>
                    }
                </div>
            </div>                            
        </div>
    )
}