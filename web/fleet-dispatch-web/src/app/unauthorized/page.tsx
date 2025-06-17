import React from "react";
import Logo from "../components/Logo";

export default function Done() {
    return (<div className="flex flex-col mx-auto w-[400px] mt-10 justify-center space-x-0 font-bold text-center">
            <Logo 
                                  path="/fleet-dispatch-logo-no-background.png"
                                  alt="Inverted Logo"
                                  width={70}
                                  height={70}
                                  reroute="/"
                                  className="mx-auto"
                                />
            <h1 className="font-bold text-center mt-4">Unauthorized Access please use a different account or Login</h1>
            <h1 className="font-bold text-center mt-4">If you beleive this is a mistake please contact support</h1>
            <a className="mt-4 hover:underline" href="/">Back to Home</a>
        </div>);
}