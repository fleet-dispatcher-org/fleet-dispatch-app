import { auth } from "../../../auth";
// import { useState } from "react";
import Logo from "../components/Logo";
import Location from "../components/Location";
import CalendarCombo from "../components/CalendarCombo";
import RoleGuard from "../components/RoleGuard";
import UserProfileCard from "../components/UserProfileCard";
import MiniDashboard from "../components/MiniDashboard";
import MiniLoadsBoard from "../components/MiniLoadsBoard";
import MiniTrucksBoard from "../components/MiniTrucksBoard";
import DriverLoads from "../components/DriverLoadsClient";
import { User } from "@prisma/client";
import DriverLoadsWrapper from "../components/DriverLoadsWrapper";


export default async function Profile() {
    const session = await auth();
    console.log(session);
    if (session?.user === null) return <div>Error signing in. Please try again. </div>;

    else if (session?.user === undefined) return <div>Loading...</div>;

    else if (session?.user.role === "ADMIN") {
        return (
            <RoleGuard allowedRoles={['ADMIN']}>
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
                    <UserProfileCard />
                    <Location />
                </header>
                <main className="grid grid-cols-3 mt-4 gap-10">
                    <div className="flex flex-col mb-10 justify-center" id="timeOff">
                        <div className="border border-gray-700 rounded bg-gray-900">
                            <h1 className="text-2xl ml-10 font-bold text-center mt-6">Request Time Off: </h1>
                            <CalendarCombo type="range"/>
                        </div>
                    </div>
                    <div className="flex flex-col mx-auto mb-10 justify-center" id="users">
                        <MiniDashboard />
                    </div>
                    <div>
                        <MiniLoadsBoard />
                    </div>
                </main>
            </RoleGuard>
        );
    }
    else if (session?.user.role === "DISPATCHER") {
        return (
            <RoleGuard allowedRoles={['DISPATCHER']}>
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
                    <UserProfileCard />
                    <Location />
                </header>
                <main className="grid grid-cols-3 mt-4 gap-10 mr-4 mb-4">
                    <div className="flex flex-col mb-10 justify-center" id="timeOff">
                        <div className="border border-gray-700 rounded bg-gray-900">
                            <h1 className="text-2xl ml-10 font-bold text-center mt-6">Request Time Off: </h1>
                            <CalendarCombo type="range"/>
                        </div>
                    </div>
                    <div className="flex flex-col mx-auto mb-10 justify-center" id="users">
                        <MiniLoadsBoard />
                    </div>
                    <div>
                        <MiniTrucksBoard />
                    </div>
                </main>
            </RoleGuard>
        );
    }

    else if (session?.user.role === "DRIVER") {
        return (
            <RoleGuard allowedRoles={['DRIVER']}>
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
                    <UserProfileCard />
                    <Location />
                </header>
                <main className="grid grid-cols-3 mt-4 gap-10 mr-4 mb-4">
                    <div className="flex flex-col mb-10 justify-center" id="timeOff">
                        <div className="border border-gray-700 rounded bg-gray-900">
                            <h1 className="text-2xl ml-10 font-bold text-center mt-6">Request Time Off: </h1>
                            <CalendarCombo type="range"/>
                        </div>
                    </div>
                    <div className="flex flex-col mx-auto mb-10 justify-center" id="users">
                        <DriverLoadsWrapper userId={session.user.id} />
                    </div>
                    <div>
                        <MiniTrucksBoard />
                    </div>
                </main>
            </RoleGuard>
        );
    }
}