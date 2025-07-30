"use client";

import { Trailer } from "@prisma/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AssignTrailerClient({ loadId }: { loadId: string }) {
    const [trailer, setTrailer] = useState<Trailer | null>(null);
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
            setTrailer(availableTrailers[0]);
            setLoading(false);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
            setLoading(false);
        }
    }
}