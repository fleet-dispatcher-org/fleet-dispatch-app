"use client";

import React from "react";

interface DashboardProps {
    title?: string,
    height: number,
    width: number,
    className?: string,
    x?: number,
    y?: number,
    children: React.ReactNode;
}

export default function Dashboard({title, height, width, className, x, y, children}: DashboardProps) {
    return <div className={`${className} h-${height} w-${width} left-${x} top-${y}`} >
            {children}
        </div>;
}