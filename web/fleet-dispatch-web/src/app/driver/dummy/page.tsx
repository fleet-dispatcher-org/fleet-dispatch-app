"use client";
import { useEffect } from "react";
import Calendar from "../../components/Calendar";

export default function DummyDriver() {
    useEffect(() => {
        document.title = "Driver Home";
      })
    return (
        <div>
            <Calendar type="range"/>
        </div>

    );
}