// LoadStatusWrapper.tsx (Server Component)
import prisma from "@/prisma/prisma";
import LoadStatusClient from "./LoadStatusClient";

interface Props {
    loadId: string;
}

export default async function LoadStatus({ loadId }: Props) {
    async function getLoadStatus(loadId: string) {
        try {
            const status = await prisma.load.findUnique({ 
                where: { id: loadId }, 
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

    const statusResult = await getLoadStatus(loadId);
    const status = statusResult?.status;

    return <LoadStatusClient loadId={loadId} initialStatus={status as string} />;
}