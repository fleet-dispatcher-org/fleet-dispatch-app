"use client"; 

import React, { useState, useEffect } from "react";
import { DayPicker, DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css'; // Default styles

interface CalendarProps {
    children?: React.ReactNode;
    type?: "single" | "range";
    id?: string;
    isVisible?: boolean;
    className?: string;
    height?: number;
    width?: number;
    x?: number;
    y?: number;
    onRangeChange?: (range: DateRange | undefined) => void; // Add this prop
    onSingleChange?: (date: Date | undefined) => void; // Add this for single date mode too
}

export default function Calendar({
    type, 
    isVisible=false,
    onRangeChange,
    onSingleChange
}: CalendarProps) {
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

    // Handle single date selection
    const handleSingleSelect = (date: Date | undefined) => {
        setSelected(date);
        if (onSingleChange) {
            onSingleChange(date);
        }
    };

    // Handle range selection
    const handleRangeSelect = (newRange: DateRange | undefined) => {
        setRange(newRange);
        if (onRangeChange) {
            onRangeChange(newRange);
        }
    };

    // Don't render anything until mounted to prevent hydration mismatch
    if (!mounted) {
        return null;
    }

    if (type === "single" && isVisible) {
        return (
            <div className="p-4 mb-4">
                <DayPicker
                    mode="single"
                    selected={selected}
                    onSelect={handleSingleSelect}
                    disabled={{ before: new Date() }}
                />
                {selected && (
                    <p className="mt-2 text-sm">
                        You picked {selected.toLocaleDateString('en-US')}
                    </p>
                )}
            </div>
        );   
    } else if (type === "range" && isVisible) {
        return (
            <div className="p-4 mb-10">
                <DayPicker
                    mode="range"
                    selected={range}
                    onSelect={handleRangeSelect}
                    disabled={{ before: new Date() }}
                />
                {range?.from && range?.to && (
                    <p className="mt-2 text-sm">
                        You picked from {range.from.toLocaleDateString('en-US')} to {range.to.toLocaleDateString('en-US')}
                    </p>
                )}
            </div>
        );   
    }

    // Return null for all other cases to prevent hydration issues
    return null;
}