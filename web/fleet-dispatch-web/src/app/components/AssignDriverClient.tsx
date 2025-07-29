"use client";
import { Driver } from "@prisma/client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface AssignDriverClientProps {
    driverId: string;
    loadId: string;
}

export default function AssignDriverClient({ driverId, loadId }: AssignDriverClientProps) {
    const [assignedDriver, setAssignedDriver] = useState(driverId);
    const [unassignedDrivers, setUnassignedDrivers] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const handleAssignDriver = async () => {
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
    return (
        <div>
            <select
                value={assignedDriver}
                onChange={(e) => setAssignedDriver(e.target.value)}
            >
                {unassignedDrivers.map((driverId) => (
                    <option key={driverId} value={driverId}>
                        {driverId}
                    </option>
                ))}
            </select>
            <button onClick={handleAssignDriver}>Assign Driver</button>
        </div>
    );
}