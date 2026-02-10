import { Driver } from "@prisma/client";
import AssignDriverRouteClient from "./AssignDriverRouteClient";

interface AssignDriverRouteWrapperProps {
    routeId: string;
    assignedDriver?: Driver | null;
}

export default async function AssignDriverRouteWrapper({ routeId, assignedDriver }: AssignDriverRouteWrapperProps) {
    // If driver is assigned, just show the name

    // Otherwise show the select dropdown
    return <AssignDriverRouteClient routeId={routeId} assignedDriver={assignedDriver}/>;
}