"use client";

import React from "react";

interface ButtonProps {
    children: React.ReactNode;
    type: "add" | "general" | "invert",
    className?: string;
    onClick?: () => void;
}

export function Button({ children, type, className, onClick }: ButtonProps) {
    if(type === "add") {
        return (
        <button
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            onClick={onClick}
        >
            +
            {children}
        </button>
    );
    }
    else if (type === "general") {
      return (
        <button
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            onClick={onClick}
        >
            {children}
        </button>
    );  
    }
    // else if 


    
}