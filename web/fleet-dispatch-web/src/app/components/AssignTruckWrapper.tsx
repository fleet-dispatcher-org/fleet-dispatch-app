import {Truck} from "@prisma/client";
import AssignTruckClient from "./AssignTruckClient";
import Link from "next/link";

interface AssignTruckWrapperProps {
    loadId: string;
    assignedTruck: Truck | null;
}

export default async function AssignTruckWrapper({ loadId,  assignedTruck }: AssignTruckWrapperProps) {
    // If driver is assigned, just show the name

    // Otherwise show the select dropdown
    return <AssignTruckClient loadId={loadId} assignedTruck={assignedTruck}/>;
}