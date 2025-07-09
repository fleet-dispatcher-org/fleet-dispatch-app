import { auth } from "@/auth";
import { notFound } from "next/navigation";
import Logo from "@/src/app/components/Logo";
import { NextResponse } from "next/server";
import AdminUserProfileCard from "@/src/app/components/AdminUserProfileCard";
import AdminUserLoads from "@/src/app/components/AdminUserLoads";
import AdminFleetUsers from "@/src/app/components/AdminFleetUsers";
import prisma  from "@/prisma/prisma";

interface User {
    id: string;
    name: string;
    image: string;
    email: string;
    role: string;
}

interface Load {
    id: string;
    origin: string;
    destination: string;
    status: string;
}

interface UserViewProps {
    params: Promise<{
        userId: string;
    }>;
}

export default async function UserView({ params }: UserViewProps) {
    const session = await auth();
    if (session?.user === null) return <div>Error signing in. Please try again. </div>;

    else if (session?.user === undefined) return <div>Loading...</div>;

    else if (session?.user.role != "ADMIN" && session?.user.role != "DISPATCHER") {
        return NextResponse.redirect(new URL('/unauthorized'));
    }

    async function getUser(userId: string) {
        try {
            const user = await prisma.user.findUnique({ where: { id: userId }, 
                select: { id: true, name: true, image: true, email: true, role: true, assigned_fleet: true } });
            if (!user) {
                throw new Error('User not found');
            }
            return user;
            
        } catch (error) {
            console.error('Error fetching user:', error);
            return null;
        }
    }

    async function getLoadsbyUser(userId: string) {
        try {
            const loads = await prisma.load.findMany({
                select: {
                    id: true,
                    origin: true,
                    destination: true,
                    status: true,
                },
                orderBy: {
                    started_at: 'desc'
                },
                where: {
                    assigned_driver: userId
                }
            });
           
            return loads;
        } catch (error) {
            console.error('Error fetching user:', error);
            return null;
        }
    }

    async function getFleetUsers(fleetId: string) {
        try {
            const users = await prisma.user.findMany({ where: { assigned_fleet: fleetId } });
            return users;
        } catch (error) {
            console.error('Error fetching user:', error);
            return null;
        }
    }

    
    const { userId } = await params; 
    const [user, loads] = await Promise.all([
        getUser(userId),
        getLoadsbyUser(userId)
    ]);

    const fleetUsers = await getFleetUsers(user?.assigned_fleet || '');

    if (!user) {
        return <div>Error fetching user. Please try again.</div>;
    }

    if (user.role === "DRIVER") {
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
            <header className="flex flex-col mx-auto mt-15 justify-center space-x-0">
                <AdminUserProfileCard id={user.id} name={user.name || ''} image={user.image || ''} email={user.email || ''} role={user.role || ''} />
            </header>
            <main>
                <AdminUserLoads loads={loads || []}/>
            </main>
            
        </div>
    )
    }

    if (user.role === "DISPATCHER") {
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
            <header className="flex flex-col mx-auto mt-15 justify-center space-x-0">
                <AdminUserProfileCard id={user.id} name={user.name || ''} image={user.image || ''} email={user.email || ''} role={user.role || ''} />
            </header>
            <main>
                <AdminFleetUsers fleetUsers={fleetUsers || []}/>
            </main>
        </div>
    )
    }

    
}