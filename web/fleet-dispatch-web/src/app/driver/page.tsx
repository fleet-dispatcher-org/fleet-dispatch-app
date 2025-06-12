"use server";

import { auth } from "../../../auth";
// import { useState } from "react";
import Logo from "../components/Logo";
import Location from "../components/Location";
import Image from "next/image";

export default async function Driver() {
    // const [isVisible, setisVisible] = useState(false);
    // const [isVisible2, setisVisible2] = useState(false);

    const session = await auth();
    console.log(session);
    if (session?.user === null) return <div>Error signing in. Please try again. </div>;

    else if (session?.user === undefined) return <div>Loading...</div>;

    else if (session?.user) {
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
            { session.user.image && (<Image 
            src={session.user.image} 
            alt="driver image" 
            width={200} height={200}
            className="rounded-full mx-auto">
            </Image>)}
            <h1 className="text-4xl font-bold text-center mt-6">Jake Zalesny</h1>
          <Location />
        </header>
    </div>
        
    );
}
    }
    