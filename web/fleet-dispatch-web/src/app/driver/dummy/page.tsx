"use client";
import { useEffect } from "react";

export default function DummyDriver() {
    useEffect(() => {
        document.title = "Driver Home";
      })
    return (
        <div>Dummy Driver</div>
    );
}