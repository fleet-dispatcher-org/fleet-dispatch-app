import { Trailer } from "@prisma/client";
import AssignTrailerClient from "./AssignTrailerClient";
import Link from "next/link";

export default async function AssignTrailerWrapper({ loadId, assignedTrailer }: { loadId: string, assignedTrailer: Trailer | null }) {
    // If driver is assigned, just show the name
    if (assignedTrailer) {
        return (
            <Link
                href={`/admin/trailers/${assignedTrailer.id}`}
                className="group"
            >
                <span>{assignedTrailer.make} {assignedTrailer.model} ({assignedTrailer.year})</span>
            </Link>
        );
    }

    // Otherwise show the select dropdown
    return <AssignTrailerClient loadId={loadId} />;
}