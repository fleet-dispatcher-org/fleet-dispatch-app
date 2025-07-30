"use client";
import { Availability_Status, Driver } from "@prisma/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface AssignDriverClientProps {
    loadId: string;
    assignedDriver: Driver | null | undefined;
}

export default function AssignDriverClient({  loadId, assignedDriver }: AssignDriverClientProps) {
    const [unassignedDrivers, setUnassignedDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchUnassignedDrivers();
    }, []);
    const handleAssignDriver = async (assignedDriver: string) => {
        try {
            const response = await fetch(`/api/dispatcher/${loadId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ assigned_driver: assignedDriver }),
            });
            if (!response.ok) {
                throw new Error("Failed to assign driver to load");
            }
            router.refresh();
        } catch (error) {
            console.error("Error assigning driver to load:", error);
        }
    };

    const handleDeleteDriver = async (assignedDriver: string) => {
        try {
            const response = await fetch(`/api/driver/${assignedDriver}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ Availability_Status: "AVAILABLE" }),
            });
            if (!response.ok) {
                throw new Error("Failed to delete driver from load");
            }
            router.refresh();
        } catch (error) {
            console.error("Error deleting driver from load:", error);
        }
        
        try {
            const response = await fetch(`/api/dispatcher/${loadId}/driver/${assignedDriver}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                throw new Error("Failed to delete driver from load");
            }
            router.refresh();
        } catch (error) {
            console.error("Error deleting driver from load:", error);
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

    if (assignedDriver) {
            if (assignedDriver) {
        return (
            <div className="group flex flex-row">
                <Link 
                href={`/admin/users/${assignedDriver.id}`}
                className="group"
                >
                    <span>{`${assignedDriver.first_name} ${assignedDriver.last_name}`}</span>
                </Link>
                <button 
                className="ml-auto text-red-600 hover:text-red-800" onClick={() => handleDeleteDriver(assignedDriver.id)}>X</button>
            </div>
        );
    }
    }

    return (
        <div>
            <select
                value="Unassigned Drivers"
                onChange={(e) => handleAssignDriver(e.target.value)}
                className="block w-full overflow-y-scroll rounded-md border-gray-300 text-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm hover:underline"
            >
                <option value="No Driver">-- No Driver Selected --</option>
                {unassignedDrivers.map((driver) => (
                    <option key={driver.id} value={driver.id || "Unnamed"}>
                        {`${driver.first_name || "Unnamed"} ${driver.last_name || ""}` || "Unnamed"}
                    </option>
                ))}
            </select>
        </div>
    );
}