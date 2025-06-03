"use client";
import { useEffect, useState } from "react";
import Calendar from "../../components/Calendar";
import Button  from "../../components/Button";
import DashboardItem from "@/app/components/DashboardItem";

export default function DummyDriver() {
    const [isVisible, setisVisible] = useState(false);
    const [isVisible2, setisVisible2] = useState(false);
    useEffect(() => {
        document.title = "Driver Home";
      })
    return (
        <div>
            <header className="flex flex-col mx-auto mt-15 justify-center space-x-0">
                <img 
                src="/jake-in-paris.jpg" 
                alt="driver image" 
                width={200} height={200}
                className="rounded-full mx-auto">
                </img>
                <h1 className="text-4xl font-bold text-center mt-6">Jake Zalesny</h1>
                <h2 className="text-1xl font-bold text-center mt-2">San Diego, CA</h2>
            </header>
            <main className="flex flex-row mt-6 space-x-0">
                <div className="flex flex-col ml-10 justify-center" id="timeOff">
                    <h1 className="text-2xl font-bold text-left mt-6">Requested Time Off: </h1>
                    <Button type="text" onClick={() => {
                        setisVisible(prev => !prev);
                        console.log(isVisible);
                    }}>Request Time Off</Button>
                    <Calendar type="range" id="calendarTimeOff" isVisible={isVisible}></Calendar>
                </div>
                <div className="flex flex-col mx-auto justify-center" id="loads">
                    <h1 className="text-2xl mx-auto font-bold text-left mt-6">Loads</h1>
                    <DashboardItem href={["/loads/current-load", "/trucks/current-truck"]} title={["Current Load", "Current Truck"]} gap={10}></DashboardItem>
                    <h1 className="text-2xl mx-auto font-bold text-left mt-8">Previous Loads</h1>
                    <DashboardItem href={["/loads/previous-load", "/trucks/previous-truck"]} title={["Previous Load", "Previous Truck"]} gap={10}></DashboardItem>
                </div>
                <div className="flex flex-col ml-10 justify-center mr-20" id="nextAvailable">
                    <h1 className="text-2xl font-bold text-left mt-6">Next Available: </h1>
                    <Button type="text" onClick={() => {
                        setisVisible2(prev => !prev);
                    }}>Set Next Available</Button>
                    <Calendar type="single" id="calendarNextAvailable" isVisible={isVisible2}></Calendar>
                </div>
            </main>
        </div>

    );
}