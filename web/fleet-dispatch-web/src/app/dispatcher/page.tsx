"use client";
import { useEffect } from "react";
import DispatchBoard from "../components/DispatchBoard";
import AIBoard from "../components/AIBoard";

export default function Dispatcher() {
    useEffect(() => {
        document.title = "Dispatcher Dashboard";
    })
    return (
    <main>
    <DispatchBoard />
    <AIBoard
    />
    </main>
);
}