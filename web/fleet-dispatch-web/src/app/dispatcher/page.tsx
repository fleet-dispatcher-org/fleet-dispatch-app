"use client";
import { useEffect } from "react";
import DispatchBoard from "../components/DispatchBoard";

export default function Dispatcher() {
    useEffect(() => {
        document.title = "Dispatcher Dashboard";
    })
    return <DispatchBoard />;
}