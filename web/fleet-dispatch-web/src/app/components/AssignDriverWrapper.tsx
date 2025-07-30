import { Driver } from "@prisma/client";
import AssignDriverClient from "./AssignDriverClient";
import Link from "next/link";

interface AssignDriverWrapperProps {
    loadId: string;
    assignedDriver?: Driver | null;
}

export default async function AssignDriverWrapper({ loadId, assignedDriver }: AssignDriverWrapperProps) {
    // If driver is assigned, just show the name
    if (assignedDriver) {
        return (
            <Link 
            href={`/admin/users/${assignedDriver.id}`}
            className="group"
            >
            <span>{`${assignedDriver.first_name} ${assignedDriver.last_name}`}</span>
            </Link>
        );
    }

    // Otherwise show the select dropdown
    return <AssignDriverClient loadId={loadId} />;
}