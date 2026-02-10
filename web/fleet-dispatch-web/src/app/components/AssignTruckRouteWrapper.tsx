import {Truck} from "@prisma/client";
import AssignTruckRouteClient from "./AssignTruckRouteClient";

interface AssignTruckWrapperProps {
    routeId: string;
    assignedTruck: Truck | null;
}
export default async function AssignTruckWrapper({ routeId, assignedTruck }: AssignTruckWrapperProps) {
    // Serialize the assigned truck if it exists
    const serializedTruck = assignedTruck ? {
        ...assignedTruck,
        capacity_tons: assignedTruck.capacity_tons?.toNumber() ?? 0, // Default to 0 if null
        // Add any other Decimal/Date fields that need serialization
    } : null;

    return <AssignTruckRouteClient routeId={routeId} assignedTruck={serializedTruck} />;
}