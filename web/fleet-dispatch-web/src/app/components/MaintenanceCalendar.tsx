"use client";

import { useState, useEffect } from "react";
import { DateRange, DayPicker } from "react-day-picker";
import 'react-day-picker/dist/style.css';   

interface MaintenanceCalendarProps {
    maintenance_date: Date;
}

export default function MaintenanceCalendar({ maintenance_date }: MaintenanceCalendarProps) {
    const [selectedDays, setSelectedDays] = useState<DateRange | undefined>();

    // Initialize dates on client side only to prevent hydration mismatch
    useEffect(() => {
        setSelectedDays({
            from: maintenance_date,
            to: new Date(maintenance_date.setDate(maintenance_date.getDate() + 7)),
        });
    }, []);

    return (
        <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-4 gap-4 mb-10 text-gray-300">
            <DayPicker
                mode="range"
                selected={selectedDays}
                onSelect={setSelectedDays}
                disabled={{ before: new Date() }}
            />
        </div>
    );
};