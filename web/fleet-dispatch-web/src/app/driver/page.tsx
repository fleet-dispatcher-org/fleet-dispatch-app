"use server";

import { auth } from "../../../auth";
// import { useState } from "react";
import Logo from "../components/Logo";
import Location from "../components/Location";
import CalendarCombo from "../components/CalendarCombo";
import Image from "next/image";
import RoleGuard from "../components/RoleGuard";
import UserProfileCard from "../components/UserProfileCard";
import SignOut from "../components/Sign-Out";

export default async function Driver() {
    // const [isVisible, setisVisible] = useState(false);
    // const [isVisible2, setisVisible2] = useState(false);

    const session = await auth();
    console.log(session);
    if (session?.user === null) return <div>Error signing in. Please try again. </div>;

    else if (session?.user === undefined) return <div>Loading...</div>;

    else if (session?.user) {
        return (
    // This is the parent div, don't mess with it.
    <RoleGuard allowedRoles={['DRIVER', 'ADMIN']}>
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
        <main className="flex flex-row mt-4 space-x-0">
            <div className="flex flex-col ml-10 mb-10 justify-center" id="timeOff">
                <h1 className="text-2xl font-bold text-left mt-6">Requested Time Off: </h1>
                <CalendarCombo type="range"/>
            </div>
            <div className="flex flex-col mx-auto mb-10 justify-center" id="loads">
                    <h1 className="text-2xl mx-auto font-bold text-left">Loads</h1>
            </div>
            <div className="flex flex-col ml-10 justify-center mb-10 mr-20" id="nextAvailable">
                <h1 className="text-2xl font-bold text-left mt-6">Next Available: </h1>
                <CalendarCombo type="single"/>

            </div>
        </main>
    </RoleGuard>
        
    );
}
    }
    