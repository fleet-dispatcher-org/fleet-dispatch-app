"use client";
import { useEffect } from "react";

export default function Dispatcher() {
    useEffect(() => {
        document.title = "Dispatcher Dashboard";
    })
    return <div>Dispatcher</div>;
}