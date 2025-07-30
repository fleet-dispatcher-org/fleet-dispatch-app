"use client";

import { Truck } from "@prisma/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AssignTruckClient({loadId}: {loadId: string}) {
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

            const availableTrucks = trucksArray.filter((truck: Truck) => truck.truck_status === "AVAILABLE");
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
            const response = await fetch(`/api/dispatcher/${loadId}/${truckId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
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

    if(loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }


    return (
        <div>
            <select
                value="Unassigned Drivers"
                onChange={(e) => handleAssignTruck(e.target.value)}
                className="block w-full overflow-y-scroll rounded-md border-gray-300 text-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm hover:underline"
            >
                <option value="No Truck">-- No Truck Selected --</option>
                {unassignedTrucks.map((truck) => (
                    <option key={truck.id} value={truck.license_plate || "Unlicensed"}>
                        {`${truck.make || "Unnamed"}, ${truck.model || ""} ${truck.year || ""} ${truck.license_plate || ""}` || "Unnamed"}
                    </option>
                ))}
            </select>
        </div>
    );
}