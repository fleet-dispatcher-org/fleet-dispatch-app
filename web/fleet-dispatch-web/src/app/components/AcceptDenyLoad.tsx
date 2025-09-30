"use client";

import { useSession } from "next-auth/react";

interface AcceptDenyButtonsProps {
    loadId: string;
    driverId: string; 
    trailerId: string;
    truckId: string;
}

export default function AcceptDenyButtons({ loadId, driverId, trailerId, truckId }: AcceptDenyButtonsProps) {
    const session = useSession().data;
    const handleAccept = async (loadId: string,) => {
    try {
        // Execute all requests concurrently and get responses
        const [loadResponse, driverResponse, truckResponse, trailerResponse] = await Promise.all([
            fetch(`/api/dispatcher/${loadId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: loadId,
                    assigned_driver: driverId,
                    assigned_truck: truckId,
                    assigned_trailer: trailerId,
                    assigned_by: session?.user?.id,
                    status: "PENDING"
                })
            }),
            fetch(`/api/dispatcher/drivers/${driverId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: driverId,
                    driver_status: "ASSIGNED"
                })
            }),
            fetch(`/api/trucks/${truckId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: truckId,
                    truck_status: "ASSIGNED"
                })
            }),
            fetch(`/api/trailers/${trailerId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: trailerId,
                    trailer_status: "ASSIGNED"
                })
            })
        ]);

        // Check load response
        if (!loadResponse.ok) {
            const errorData = await loadResponse.json().catch(() => ({}));
            console.error('Load API Error:', errorData);
            throw new Error(`HTTP ${loadResponse.status}: ${errorData.message || 'Failed to update load'}`);
        }

        // Check driver response
        if (!driverResponse.ok) {
            const errorData = await driverResponse.json().catch(() => ({}));
            console.error('Driver API Error:', errorData);
            throw new Error(`HTTP ${driverResponse.status}: ${errorData.message || 'Failed to update driver'}`);
        }

        // Check truck response
        if (!truckResponse.ok) {
            const errorData = await truckResponse.json().catch(() => ({}));
            console.error('Truck API Error:', errorData);
            throw new Error(`HTTP ${truckResponse.status}: ${errorData.message || 'Failed to update truck'}`);
        }

        // Check trailer response
        if (!trailerResponse.ok) {
            const errorData = await trailerResponse.json().catch(() => ({}));
            console.error('Trailer API Error:', errorData);
            throw new Error(`HTTP ${trailerResponse.status}: ${errorData.message || 'Failed to update trailer'}`);
        }

        // Optionally reload the page or redirect
        window.location.reload();
        
    } catch (err) {
        console.error('Error updating load:', err);
        alert('Failed to update load');
    }
}
    const handleDeny = async (loadId: string) => {
        try {
            const response = await fetch(`/api/dispatcher/${loadId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: loadId,
                    status: "UNASSIGNED",
                    assigned_driver: null,
                    assigned_truck: null,
                    assigned_trailer: null
                })
            })


            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error:', errorData);
                throw new Error(`HTTP ${response.status}: ${errorData.message || 'Failed to update load'}`);
            }
            // Optionally reload the page or redirect
            window.location.reload();
        } catch (err) {
            console.error('Error updating load:', err);
            alert('Failed to update load');
        }
    }

    return (
        <div className="flex gap-4 mb-4">
            <button 
                onClick={() => handleAccept(loadId)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
                Accept
            </button>
            <button 
                onClick={() => handleDeny(loadId)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
                Deny
            </button>
        </div>
    );
}   