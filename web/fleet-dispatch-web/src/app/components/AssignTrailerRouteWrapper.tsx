import { Trailer } from "@prisma/client";
import AssignTrailerRouteClient from "./AssignTrailerRouteClient";

export default async function AssignTrailerWrapper({ routeId, assignedTrailer }: { routeId: string, assignedTrailer: Trailer | null }) {
    // If driver is assigned, just show the name
    const serializedAssignedTrailer = assignedTrailer ? { 
        ...assignedTrailer, 
        max_cargo_capacity: assignedTrailer.max_cargo_capacity?.toNumber() ?? 0,
        current_cargo_weight: assignedTrailer.current_cargo_weight?.toNumber() ?? 0  } : null;
    // Otherwise show the select dropdown
    return <AssignTrailerRouteClient routeId={routeId} assignedTrailer={serializedAssignedTrailer}/>;
}