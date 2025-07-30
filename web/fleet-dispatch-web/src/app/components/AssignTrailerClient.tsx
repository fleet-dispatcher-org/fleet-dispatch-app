"use client";

import { Trailer } from "@prisma/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AssignTrailerClient({ loadId }: { loadId: string }) {
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
                method: "POST",
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

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

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