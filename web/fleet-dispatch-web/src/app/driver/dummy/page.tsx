"use client";
import { useEffect } from "react";
import Calendar from "../../components/Calendar";

export default function DummyDriver() {
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
            <main className="flex flex-row mt-15 space-x-0">
                <div className="flex flex-col ml-10 justify-center">
                    <h1 className="text-2xl font-bold text-left mt-6">Requested Time Off</h1>
                    <Calendar type="range"></Calendar>
                </div>
            </main>
        </div>

    );
}