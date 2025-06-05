"use client";

import React from "react";
import { useEffect } from "react";
import Calendar from "../../components/Calendar";
import Button  from "../../components/Button";
import Dashboard from "@/app/components/Dashboard";
import DashboardItem from "@/app/components/DashboardItem";
import Logo from "../../components/Logo";

export default function DummyDispatcher() {
    useEffect(() => {
            document.title = "Dispatcher Dashboard";
          })
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
            <div className="flex flex-col space-x-0">
                <Dashboard title="Dispatcher Dashboard" className="border-2 rounded border-white flex flex-col">
                    <DashboardItem href={["/driver", "/driver/route", "/dispatcher/driver"]} title={["Jake Zalesny", "Route", "Truck"]} gap={10} mt={10} ml={12}/>
                </Dashboard>
            </div>
        </div>
    );}