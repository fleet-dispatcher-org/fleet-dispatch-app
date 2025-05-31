"use client";
import { useEffect } from "react";

export default function Driver() {
    useEffect(() => {
        document.title = "Driver Home";
      })
    return (
        <div>
            <a href="/log-hours">Log hours</a>
            <a href="/dummy">Dummy</a>
        </div>
    );
}