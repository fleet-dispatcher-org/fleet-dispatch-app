import {Truck} from "@prisma/client";
import AssignTruckClient from "./AssignTruckClient";
import Link from "next/link";

interface AssignTruckWrapperProps {
    loadId: string;
    assignedTruck: Truck | null;
}

export default async function AssignTruckWrapper({ loadId,  assignedTruck }: AssignTruckWrapperProps) {
    // If driver is assigned, just show the name
    if (assignedTruck) {
        return (
            <Link
                href={`/admin/trucks/${assignedTruck.id}`}
                className="group"
            >
                <span>{assignedTruck.make} {assignedTruck.model} ({assignedTruck.year})</span>
            </Link>
        );
    }

    // Otherwise show the select dropdown
    return <AssignTruckClient loadId={loadId} />;
}