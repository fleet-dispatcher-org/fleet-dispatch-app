"use client";

import { Trailer } from "@prisma/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type SerializedTrailer = {
    id: string;
    assigned_truck_id: string | null;
    current_location: string | null;
    has_registration: boolean | null;
    make: string | null;
    model: string | null;
    year: number | null;
    bureaucratically_sound: boolean | null;
    correct_equipment_working: boolean | null;
    max_cargo_capacity: number | null; // Changed from Decimal to number
    current_cargo_weight: number | null; // Changed from Decimal to number
    insurance_valid: boolean | null;
    // Add any other fields from your trailer model here
    // Convert any other Decimal fields to number | null
} | null;

interface AssignTrailerClientProps {
    loadId: string;
    assignedTrailer: SerializedTrailer | null;
}

export default function AssignTrailerClient({ loadId, assignedTrailer }: AssignTrailerClientProps) {
    const [trailers, setTrailers] = useState<Trailer[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchUnassignedTrailers();
    }, []);

    async function fetchUnassignedTrailers() {
        try {
            const response = await fetch("/api/trailers", {
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
            let trailersArray;
            if (Array.isArray(data)) {
                trailersArray = data;
            } else if (data && Array.isArray(data.trailers)) {
                trailersArray = data.trailers;
            } else {
                throw new Error("Invalid response format: expected array or object with trailers property");
            }

            const availableTrailers = trailersArray.filter((trailer: Trailer) => trailer.trailer_status === "AVAILABLE");
            setTrailers(availableTrailers);
            setLoading(false);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
            setLoading(false);
        }
    }

    async function handleAssignTrailer(trailerId: string) {
        try {
            const response = await fetch(`/api/dispatcher/${loadId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ assigned_trailer: trailerId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }
            router.refresh();
        } catch (err) {
            console.error("Error assigning trailer to load:", err);
        }
    }

    async function handleDeleteTrailer(trailerId: string) {
        try {
            const [trailerResponse, loadResponse] = await Promise.all([
                fetch(`/api/trailers/${trailerId}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ trailer_status: "AVAILABLE" }),
                }),
                fetch(`/api/dispatcher/${loadId}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ assigned_trailer: null }),
                }),
            ]);

            if (!trailerResponse.ok) {
                throw new Error("Failed to update trailer availability");
            }
            if (!loadResponse.ok) {
                throw new Error("Failed to remove trailer from load");
            }
            router.refresh();
        } catch (err) {
            console.error("Error deleting trailer:", err);
        }
    }

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

        if (assignedTrailer) {
        return (
            <div className="group flex flex-row">
                <Link
                    href={`/admin/trailers/${assignedTrailer.id}`}
                    className="group"
                >
                    <span>{assignedTrailer.make} {assignedTrailer.model} ({assignedTrailer.year})</span>
                </Link>
                <button 
                className="ml-auto text-gray-400 hover:text-gray-500" onClick={() => handleDeleteTrailer(assignedTrailer.id)}>x</button>
            </div>
        );
    }

    return (
        <div>
            <select value="Unassigned Trailers"
                onChange={(e) => handleAssignTrailer(e.target.value)}
                className="block w-full overflow-y-scroll rounded-md border-gray-300 text-gray-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm hover:underline">
                    <option value="No Trailer">-- No Trailer Assigned --</option>
                    {trailers?.map((trailer) => (
                        <option value={trailer.id} key={trailer.id}>{`${trailer.make} ${trailer.model} ${trailer.year} ${trailer.license_plate}`}</option>
                    ))}
                </select>
        </div>
    );
}