import {Truck} from "@prisma/client";
import AssignTruckClient from "./AssignTruckClient";
import Link from "next/link";

interface AssignTruckWrapperProps {
    loadId: string;
    assignedTruck: Truck | null;
}
export default async function AssignTruckWrapper({ loadId, assignedTruck }: AssignTruckWrapperProps) {
    // Serialize the assigned truck if it exists
    const serializedTruck = assignedTruck ? {
        ...assignedTruck,
        capacity_tons: assignedTruck.capacity_tons?.toNumber() ?? 0, // Default to 0 if null
        // Add any other Decimal/Date fields that need serialization
    } : null;

    return <AssignTruckClient loadId={loadId} assignedTruck={serializedTruck} />;
}