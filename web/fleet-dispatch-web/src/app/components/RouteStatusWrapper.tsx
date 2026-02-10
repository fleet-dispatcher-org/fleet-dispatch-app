// LoadStatusWrapper.tsx (Server Component)
import prisma from "@/prisma/prisma";
import RouteStatusClient from "./RouteStatusClient";

interface Props {
    routeId: string;
}

export default async function LoadStatus({ routeId }: Props) {
    async function getRouteStatus(routeId: string) {
        try {
            const status = await prisma.route.findUnique({ 
                where: { id: routeId }, 
                select: { status: true } 
            });
            if (!status) {
                throw new Error('Load status not found');
            }
            return status; 
        } catch (error) {
            console.error('Error fetching load status:', error);
            return null;
        }
    }

    const statusResult = await getRouteStatus(routeId);
    const status = statusResult?.status;

    return <RouteStatusClient routeId={routeId} initialStatus={status as string} />;
}