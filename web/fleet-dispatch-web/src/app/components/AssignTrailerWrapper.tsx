import { Trailer } from "@prisma/client";
import AssignTrailerClient from "./AssignTrailerClient";

export default async function AssignTrailerWrapper({ loadId, assignedTrailer }: { loadId: string, assignedTrailer: Trailer | null }) {
    // If driver is assigned, just show the name
    const serializedAssignedTrailer = assignedTrailer ? { 
        ...assignedTrailer, 
        max_cargo_capacity: assignedTrailer.max_cargo_capacity?.toNumber() ?? 0,
        current_cargo_weight: assignedTrailer.current_cargo_weight?.toNumber() ?? 0  } : null;
    // Otherwise show the select dropdown
    return <AssignTrailerClient loadId={loadId} assignedTrailer={serializedAssignedTrailer}/>;
}