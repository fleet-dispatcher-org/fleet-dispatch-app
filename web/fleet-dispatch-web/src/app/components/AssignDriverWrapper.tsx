import prisma from "@/prisma/prisma";
import AssignDriverClient from "./AssignDriverClient";

interface AssignDriverWrapperProps {
    loadId: string;
    driverId: string;
}

export default async function AssignDriverWrapper({ loadId, driverId }: AssignDriverWrapperProps) {
    async function assignDriver(loadId: string, driverId: string) {
        try {
            await fetch(`/api/dispatcher/${loadId}/${driverId}`, { method: 'PATCH' });
        } catch (error) {
            console.error('Error assigning driver to load:', error);
        }
    }


}