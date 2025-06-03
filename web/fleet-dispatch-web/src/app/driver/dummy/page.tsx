"use client";
import { useEffect, useState, useRef } from "react";
import Calendar from "../../components/Calendar";
import Button  from "../../components/Button";
import DashboardItem from "@/app/components/DashboardItem";
import Logo from "../../components/Logo";

export default function DummyDriver() {
    const [isVisible, setisVisible] = useState(false);
    const [isVisible2, setisVisible2] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [location, setLocation] = useState('San Diego, CA');
    const [tempValue, setTempValue] = useState(location);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        document.title = "Driver Home";
      })
    
    useEffect(() => {
        if(isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleBlur = () => {
        setLocation(tempValue.trim() || location);
        setIsEditing(false);
    };

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
                <img 
                src="/jake-in-paris.jpg" 
                alt="driver image" 
                width={200} height={200}
                className="rounded-full mx-auto">
                </img>
                <h1 className="text-4xl font-bold text-center mt-6">Jake Zalesny</h1>
                {isEditing ? (
                        <input
                            ref={inputRef}
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            onBlur={handleBlur}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                handleBlur(); // Save on Enter
                                }
                                if (e.key === 'Escape') {
                                setTempValue(location); // Revert
                                setIsEditing(false);
                                }
                            }}
                            className="mx-auto"
                        />
                    ) : (
                        <Button
                            type="text"
                            onClick={() => setIsEditing(true)}
                        >
                        {location}
                        </Button>
                    )}
            </header>
            <main className="flex flex-row mt-4 space-x-0">
                <div className="flex flex-col ml-10 mb-10 justify-center" id="timeOff">
                    <h1 className="text-2xl font-bold text-left mt-6">Requested Time Off: </h1>
                    <Button type="hollow" onClick={() => {
                        setisVisible(prev => !prev);
                        console.log(isVisible);
                    }}>Request Time Off</Button>
                    <Calendar type="range" id="calendarTimeOff" isVisible={isVisible}></Calendar>
                </div>
                <div className="flex flex-col mx-auto mb-10 justify-center" id="loads">
                    <h1 className="text-2xl mx-auto font-bold text-left mt-6">Loads</h1>
                    <DashboardItem href={["/loads/current-load", "/trucks/current-truck"]} title={["Current Load", "Current Truck"]} gap={10}/>
                    <Button type="hollow" onClick={() => {
                        window.location.href = "/loads/load-status";
                    }}>Update Load Status</Button>
                    <h1 className="text-2xl mx-auto font-bold text-left mt-8">Previous Loads</h1>
                    <DashboardItem href={["/loads/previous-load", "/trucks/previous-truck"]} title={["Previous Load", "Previous Truck"]} gap={10}/>
                    <DashboardItem href={["/loads/previous-load", "/trucks/previous-truck"]} title={["Previous Load", "Previous Truck"]} gap={10}/>
                    <DashboardItem href={["/loads/previous-load", "/trucks/previous-truck"]} title={["Previous Load", "Previous Truck"]} gap={10}/>
                    <DashboardItem href={["/loads/previous-load", "/trucks/previous-truck"]} title={["Previous Load", "Previous Truck"]} gap={10}/>
                </div>
                <div className="flex flex-col ml-10 justify-center mb-10 mr-20" id="nextAvailable">
                    <h1 className="text-2xl font-bold text-left mt-6">Next Available: </h1>
                    <Button type="hollow" onClick={() => {
                        setisVisible2(prev => !prev);
                    }}>Set Next Available</Button>
                    <Calendar type="single" id="calendarNextAvailable" isVisible={isVisible2}></Calendar>
                </div>
            </main>
        </div>

    );
}