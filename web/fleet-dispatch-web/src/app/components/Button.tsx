"use client";

import React from "react";

interface ButtonProps {
    children: React.ReactNode;
    type: "add" | "general" | "hollow" | "text";
    className?: string;
    onClick?: () => void;
}

export default function Button({ children, type, className, onClick }: ButtonProps) {
    if(type === "add") {
        return (
        <button
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto cursor-pointer"
            onClick={onClick}
        >
            
            {children}
        </button>
    );
    }
    else if (type === "general") {
      return (
        <button
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto cursor-pointer"
            onClick={onClick}
        >
            {children}
        </button>
    );  
    }
    else if (type === "hollow") {
      return (
        <button
            className=" bg-black text-white border-white rounded-full border border-solid transition-colors flex items-center justify-center hover:bg-gray-50 hover:text-black mt-3 cursor-pointer gap-2 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            onClick={onClick}
        >
            {children}
        </button>
        );
    }

    else if (type === "text") {
      return (
        <button
            className="text-foreground hover:text-[#383838] dark:hover:text-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto cursor-pointer"
            onClick={onClick}
        >
            {children}
        </button>
        );
    }


    
}