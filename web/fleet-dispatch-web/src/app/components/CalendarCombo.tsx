"use client";

import React, { useState, useEffect } from "react";
import Calendar from "./Calendar";
import Button from "./Button";
import { DayPicker, DateRange } from 'react-day-picker';

interface CalendarProps {
    children?: React.ReactNode
    type?: "single" | "range"
    id?: string
    isVisible?: boolean
    className?: string
    height?: number
    width?: number
    x?: number
    y?: number
}

export default function CalendarCombo({height, width, className, x, y, children, type, id, isVisible=false}: CalendarProps) {
    const [singleVisible, setSingleVisible] = useState(false);
    const [rangeVisible, setRangeVisible] = useState(false);
    const [selected, setSelected] = useState<Date | undefined>();
    const [range, setRange] = useState<DateRange | undefined>();
    const [mounted, setMounted] = useState(false);

    // Initialize dates on client side only to prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
        setRange({
            from: new Date(),
            to: new Date(),
        });
    }, []);

    // Don't render anything until mounted to prevent hydration mismatch
    if (!mounted) {
        return null;
    }

    if (type === "single") {
        return (
            <div>
                <Button type="hollow" onClick={() => {
                    setRangeVisible(prev => !prev);
                    console.log(isVisible);
                }}>Set Next Available</Button>
                <Calendar type="range" id="calendarTimeOff" isVisible={rangeVisible}></Calendar>
            </div> 
        )
    } else if (type === "range") {
        return (
            <div>
                <Button type="hollow" onClick={() => {
                    setSingleVisible(prev => !prev);
                }}>Request Time Off</Button>
                <Calendar type="single" id="calendarNextAvailable" isVisible={singleVisible}></Calendar>
            </div>
        )
    }

    // Return null for all other cases to prevent hydration issues
    return null;
}