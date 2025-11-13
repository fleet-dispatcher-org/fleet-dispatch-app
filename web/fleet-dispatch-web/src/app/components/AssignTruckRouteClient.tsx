"use client";

import { Truck } from "@prisma/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface AssignTruckRouteClientProps {
    routeId: string;
    assignedTruck: {
        id: string;
        license_plate: string;
        make: string;
        model: string;
        year: number | null;
        capacity_tons: number | null; // Changed to number
        mileage: number | null;
        is_active: boolean | null;
        current_location: string | null;
        // ... add all other fields, converting Decimal types to number
    } | null;
}


export default function AssignTruckRouteClient({routeId, assignedTruck}: AssignTruckRouteClientProps) {
    const [unassignedTrucks, setUnassignedTrucks] = useState<Truck[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchUnassignedTrucks();
    }, []);

    async function fetchUnassignedTrucks() {
        try {
            const response = await fetch("/api/trucks", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();


            // Handle both array and object responses
            let trucksArray;
            if (Array.isArray(data)) {
                trucksArray = data;
            } else if (data && Array.isArray(data.trucks)) {
                trucksArray = data.trucks;
            } else {
                throw new Error("Invalid response format: expected array or object with trucks property");
            }

            let availableTrucks = trucksArray.filter((truck: Truck) => truck.truck_status === "AVAILABLE");
            availableTrucks = availableTrucks.map((truck: { capacity_tons: number; }) => {
                return {
                    ...truck, 
                    capacity_tons: Number(truck.capacity_tons),
                }
            });
            setUnassignedTrucks(availableTrucks);
            setLoading(false);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
            setLoading(false);
        }
    }

    async function handleAssignTruck(truckId: string) {
        try {
            const response = await fetch(`/api/dispatcher/routes/${routeId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ assigned_truck: truckId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }
            router.refresh();
        } catch (err) {
            console.error("Error assigning truck to load:", err);
        }
    }

    async function handleDeleteTruck(truckId: string) {
    try {
        const [truckResponse, routeResponse] = await Promise.all([
            fetch(`/api/trucks/${truckId}`, { // Fixed: trucks instead of truck
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ truck_status: "AVAILABLE" }),
            }),
            fetch(`/api/dispatcher/routes/${routeId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ assigned_truck: null }),
            })
        ]);

        if (!truckResponse.ok) {
            throw new Error(`Failed to update truck availability: ${truckResponse.status} ${truckResponse.statusText}`);
        }

        if (!routeResponse.ok) {
            throw new Error(`Failed to remove truck from route: ${routeResponse.status} ${routeResponse.statusText}`);
        }

        // Check if responses have content before parsing JSON
        const truckText = await truckResponse.text();
        const loadText = await routeResponse.text();

        // Only parse as JSON if there's content
        if (truckText) {
            const truckData = JSON.parse(truckText);
            console.log("Truck update response:", truckData);
        }

        if (loadText) {
            const loadData = JSON.parse(loadText);
            console.log("Load update response:", loadData);
        }

        // Only refresh if both operations succeeded
        router.refresh();
        
    } catch (err) {
        console.error("Error deleting truck:", err);
    }
}
    if(loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

        if (assignedTruck) {
        return (
            <div className="group flex flex-row">
                <Link
                    href={`/admin/trucks/${assignedTruck.id}`}
                    className="group"
                >
                    <span>{assignedTruck.make} {assignedTruck.model} ({assignedTruck.year})</span>
                </Link>
                <button 
                className="ml-auto text-gray-400 hover:text-gray-500" onClick={() => handleDeleteTruck(assignedTruck.id)}>x</button>
            </div>
        );
    }


    return (
        <div>
            <select
                value="Unassigned Drivers"
                onChange={(e) => handleAssignTruck(e.target.value)}
                className="block w-full overflow-y-scroll rounded-md border-gray-300 text-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm hover:underline"
            >
                <option value="No Truck">-- No Truck Selected --</option>
                {unassignedTrucks?.map((truck) => (
                    <option key={truck.id} value={truck.id || "Unlicensed"}>
                        {`${truck.make || "Unnamed"}, ${truck.model || ""} ${truck.year || ""} ${truck.license_plate || ""}` || "Unnamed"}
                    </option>
                ))}
            </select>
        </div>
    );
}