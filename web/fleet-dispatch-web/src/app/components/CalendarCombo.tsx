"use client";

import React, { useState, useEffect } from "react";
import Calendar from "./Calendar";
import Button from "./Button";
import { DayPicker, DateRange } from 'react-day-picker';
import { time } from "console";
import TimeOffModal from "./TimeOffModal";

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

    // Callback function to receive selected dates from Calendar component
    const handleDateRangeChange = (newRange: DateRange | undefined) => {
        setRange(newRange);
        console.log("Range updated:", newRange);
    };

    // Don't render anything until mounted to prevent hydration mismatch
    if (!mounted) {
        return null;
    }

    if (type === "single") {
        return (
            <div>
                <Button type="hollow"
                className="bg-gray-900 text-white border-white rounded-full border border-solid transition-colors 
                flex items-center justify-center hover:bg-gray-50 hover:text-black mt-3 cursor-pointer 
                gap-2 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
                onClick={() => {
                    setRangeVisible(prev => !prev);
                    console.log(isVisible);
                }}>Set Next Available</Button>
                <Calendar 
                    type="range" 
                    id="calendarTimeOff" 
                    isVisible={rangeVisible}
                    onRangeChange={handleDateRangeChange}
                />
            </div> 
        )
    } else if (type === "range") {
        return (
            <div className="flex flex-col items-center">
                <Button type="hollow" 
                className="bg-gray-900 text-white border-white rounded-full border border-solid transition-colors 
                flex items-center justify-center hover:bg-gray-50 hover:text-black mt-3 cursor-pointer 
                gap-2 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto mx-auto mb-3"
                onClick={() => {
                    setSingleVisible(prev => !prev);
                }}>Create Request: </Button>
                <Calendar 
                    type="range" 
                    id="calendarNextAvailable" 
                    isVisible={singleVisible}
                    onRangeChange={handleDateRangeChange}
                />
                <TimeOffModal range={range} />
                
            </div>
        )
    }

    return null;
}