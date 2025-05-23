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
        <div className="flex gap-4 items-center justify-center flex-col sm:flex-row">
        <button
            className={"rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"}
            onClick={onClick}
        >
            {children}
        </button>
        </div>
    );
    }
    else if (type === "general") {
      return (
        <div className="flex gap-4 items-center justify-center flex-col sm:flex-row">
        <button
            className={"rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"}
            onClick={onClick}
        >
            {children}
        </button>
        </div>
    );  
    }
    // else if 


    
}