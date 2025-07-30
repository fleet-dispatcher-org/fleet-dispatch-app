"use client";
import { Driver } from "@prisma/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AssignDriverClientProps {
    loadId: string;
}

export default function AssignDriverClient({  loadId }: AssignDriverClientProps) {
    const [unassignedDrivers, setUnassignedDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchUnassignedDrivers();
    }, []);
    const handleAssignDriver = async (assignedDriver: string) => {
        try {
            const response = await fetch(`/api/dispatcher/${loadId}/${assignedDriver}`, {
                method: "PATCH",
            });
            if (!response.ok) {
                throw new Error("Failed to assign driver to load");
            }
            router.refresh();
        } catch (error) {
            console.error("Error assigning driver to load:", error);
        }
    };

    const fetchUnassignedDrivers = async () => {
            try {
                setLoading(true);
                
                const response = await fetch('/api/dispatcher/drivers', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    cache: 'no-store'
                });
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                
                // Handle both array and object responses
                let driversArray;
                if (Array.isArray(data)) {
                    driversArray = data;
                } else if (data && Array.isArray(data.drivers)) {
                    driversArray = data.drivers;
                } else {
                    throw new Error('Invalid response format: expected array or object with drivers property');
                }
                
                const availableDrivers = driversArray.filter((driver: Driver) => driver.is_available);
                setUnassignedDrivers(availableDrivers);
                setError(null);
            } catch (error) {
                console.error('Error fetching unassigned drivers:', error);
                setError(error instanceof Error ? error.message : 'Unknown error occurred');
                setUnassignedDrivers([]);
            } finally {
                setLoading(false);
            }
        };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <select
                value="Unassigned Drivers"
                onChange={(e) => handleAssignDriver(e.target.value)}
                className="block w-full overflow-y-scroll rounded-md border-gray-300 text-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
                <option value="No Driver">-- No Driver Selected --</option>
                {unassignedDrivers.map((driver) => (
                    <option key={driver.id} value={driver.first_name || "Unnamed"}>
                        {`${driver.first_name || "Unnamed"} ${driver.last_name || ""}` || "Unnamed"}
                    </option>
                ))}
            </select>
        </div>
    );
}