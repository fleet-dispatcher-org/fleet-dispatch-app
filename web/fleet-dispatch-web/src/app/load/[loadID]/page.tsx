import { auth } from "@/auth";
import { notFound } from "next/navigation";
import Logo from "@/src/app/components/Logo";
import { NextResponse } from "next/server";
import AdminUserProfileCard from "@/src/app/components/AdminUserProfileCard";
import AdminUserLoads from "@/src/app/components/AdminUserLoads";
import AdminFleetUsers from "@/src/app/components/AdminFleetUsers";
import prisma  from "@/prisma/prisma";

interface LoadViewProps {
    params: Promise<{
        loadId: string;
    }>;
}

export default async function Page({ params }: any) {
    const session = await auth();

    if (session?.user === null) return <div>Error signing in. Please try again. </div>;

    else if (session?.user === undefined) return <div>Loading...</div>;

    async function getLoad(loadId: string) {
        try {
            const load = await prisma.load.findUnique({ where: { id: loadId } });
            if (!load) {
                throw new Error('Load not found');
            }
            return load;
        } catch (error) {
            console.error('Error fetching load:', error);
            return null;
        }
    }

    const { loadId } = await params;
    const load = Promise.all([
        getLoad(loadId),
    ]);
    
    if (!load) {
        return notFound();
    }

    return ( 
        <div>
            <div className="flex flex-row space-x-0">
                <Logo
                    path="/fleet-dispatch-logo-no-background.png"
                    alt="Inverted Logo"
                    width={38}
                    height={38}
                    reroute="/"
                />
                <h4 className="text-3xl mt-0.5 ml-1 font-bold">Fleet Dispatch</h4>
            </div>
        </div>
    )
    

}