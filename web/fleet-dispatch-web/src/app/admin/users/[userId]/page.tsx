import { auth } from "@/auth";
import Logo from "@/src/app/components/Logo";
import { NextResponse } from "next/server";
import AdminUserProfileCard from "@/src/app/components/AdminUserProfileCard";
import AdminUserLoads from "@/src/app/components/AdminUserLoads";
import prisma  from "@/prisma/prisma";
import UpdateDriverEmploymentClient from "@/src/app/components/UpdateDriverEmploymentClient";
import Link from "next/link";
import AdminUserApprovedLoads from "@/src/app/components/AdminUserApprovedLoads";
import AdminDispatcherPendingLoads from "@/src/app/components/AdminDispatcherPendingLoads";
import UnassignedBoardMini from "@/src/app/components/UnassignedBoardMini";


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

    async function getDriver(userId: string) {
        try {
            const driver = await prisma.driver.findUnique({ where: { id: userId } });
            if (!driver) {
                throw new Error('Driver not found');
            }
            return driver;
        } catch (error) {
            console.error('Error fetching driver:', error);
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
                    due_by: true,
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


    
    const { userId } = await params; 
    const [user, loads] = await Promise.all([
        getUser(userId),
        getLoadsbyUser(userId)
    ]);

    console.log("Loads:", loads);
    // const fleetUsers = await getFleetUsers(user?.assigned_fleet || '');

    if (!user) {
        return <div>Error fetching user. Please try again.</div>;
    }

    if (user.role === "DRIVER") {
        const driver = await getDriver(userId);
        return (
        <div className="min-h-screen bg-black">
            <header className="bg-gray-900 shadow-sm border-b border-gray-400 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Logo
                                        path="/fleet-dispatch-logo-no-background.png"
                                        alt="Inverted Logo"
                                        width={38}
                                        height={38}
                                        reroute="/"
                                    />
                                    <h1 className="text-2xl font-bold text-white">Fleet Dispatch</h1>
                                </div>
                                <div className="text-sm text-gray-500">
                                    User ID: {user.id}
                                </div>
                            </div>
                        </header>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                </div>
            <main className="max-w-7xl mx-auto px-6 py-8 bg-gray-900 border border-gray-700 mt-4 rounded-lg">
                <AdminUserProfileCard id={user.id} name={user.name || ''} image={user.image || ''} email={user.email || ''} role={user.role || ''} />
                <AdminUserLoads loads={loads || []}/>
                
                {/* Employment Status */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6 flex flex-col">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg> 
                            </div>
                            <h3 className="text-lg font-semibold text-gray-400">Employment Status</h3>
                        </div>
                        <UpdateDriverEmploymentClient driver={driver!}></UpdateDriverEmploymentClient>
                    </div>
                    {/*  Current Location */}
                    <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600" fill="currentColor" stroke="none" viewBox="0 0 24 24">
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-400">Current Location</h3>
                        </div>
                        <p className="text-gray-400">{driver?.current_location}</p>
                    </div>
                </div>
                <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6 mt-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-red-600" fill="currentColor" stroke="none" viewBox="0 0 24 24">
                                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM9 8.5c0-.83.67-1.5 1.5-1.5S12 7.67 12 8.5 11.33 10 10.5 10 9 9.33 9 8.5zm2.5 5.5H8c0-1.1.9-2 2-2s2 .9 2 2zM20 16H14v-1h6v1zm0-2H14v-1h6v1zm0-2H14v-1h6v1z"/>
                            </svg>
                            </div>
                                <h3 className="text-lg font-semibold text-gray-400">Driver Info.</h3>
                        </div>
                        {driver?.license_class && <p className="text-gray-400">License Class: {driver?.license_class}</p>}
                        {driver?.license_number && <p className="text-gray-400">License Number: {driver?.license_number}</p>}
                        {driver?.certifications && driver.certifications.length > 0 && <p className="text-gray-400">Certifications: {driver.certifications.join(', ')}</p>}
                        {driver?.license_expiration && <p className="text-gray-400">License Expiration: {driver?.license_expiration}</p>}
                </div>
                
                
            </main>
            <footer className="text-gray-600 py-4 flex flex-col items-center justify-center">
                <Link
                    href="/profile">
                    <p className="text-gray-500 hover:underline">Back to Profile</p>
                </Link>
                <p className="text-sm text-gray-400 mt-4">&copy; 2023 Fleet Dispatch. All rights reserved.</p>
            </footer>
        </div>
    )
    }

    if (user.role === "DISPATCHER") {
        return (
        <div className="min-h-screen bg-black">
            <header className="bg-gray-900 shadow-sm border-b border-gray-400 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Logo
                            path="/fleet-dispatch-logo-no-background.png"
                            alt="Inverted Logo"
                            width={38}
                            height={38}
                            reroute="/"
                        />
                        <h1 className="text-2xl font-bold text-white">Fleet Dispatch</h1>
                    </div>
                    <div className="text-sm text-gray-500">
                        User ID: {user.id}
                    </div>
                </div>
            </header>
            
            <main className="max-w-7xl mx-auto px-6 py-8 bg-gray-900 border border-gray-700 mt-4 rounded-lg">
                <AdminUserProfileCard id={user.id} name={user.name || ''} image={user.image || ''} email={user.email || ''} role={user.role || ''} />
                <AdminUserApprovedLoads userId={user.id} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    <AdminDispatcherPendingLoads />
                    <UnassignedBoardMini limit={5}/>
                </div>
            </main>
        </div>
    )
    }

    
}