"use client"; 

import React, { useState } from "react";
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
}

export default function Calendar({height, width, className, x, y, children, type, id, isVisible=false}: CalendarProps) {
    const [selected, setSelected] = useState<Date | undefined>();
    const [range, setRange] = useState<DateRange | undefined>({
            from: new Date(),
            to: new Date(),
        });

      if (type === "single" && isVisible) {
        return (
                <div className="p-4">
                <DayPicker
                    mode="single"
                    selected={selected}
                    onSelect={setSelected}
                    disabled={{ before: new Date() }}
                />
                {selected && (
                    <p className="mt-2 text-sm">
                    You picked {selected.toLocaleDateString()}
                    </p>
                )}
                </div>
            );   
      } else if (type === "range" && isVisible) {
        return (
                <div className="p-4">
                <DayPicker
                    mode="range"
                    selected={range}
                    onSelect={setRange}
                    disabled={{ before: new Date() }}
                />
                {range?.from && range?.to && (
                    <p className="mt-2 text-sm">
                    You picked from {range?.from.toLocaleDateString()} to {range?.to.toLocaleDateString()}
                    </p>
                )}
                </div>
            );   
      }
}