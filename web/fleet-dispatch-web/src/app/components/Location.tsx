"use client";

import React from "react";
import { useEffect, useState, useRef } from "react";
import Button from "./Button";

export default function Location() {
    const [isEditing, setIsEditing] = useState(false);
    const [location, setLocation] = useState('San Diego, CA');
    const [tempValue, setTempValue] = useState(location);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if(isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleBlur = () => {
        setLocation(tempValue.trim() || location);
        setIsEditing(false);
    };

    return <div className="mx-auto">
                    {isEditing ? (
                            <input
                                ref={inputRef}
                                value={tempValue}
                                onChange={(e) => setTempValue(e.target.value)}
                                onBlur={handleBlur}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                    handleBlur(); // Save on Enter
                                    }
                                    if (e.key === 'Escape') {
                                    setTempValue(location); // Revert
                                    setIsEditing(false);
                                    }
                                }}
                                className="mx-auto"
                            />
                        ) : (
                            <Button
                                type="text"
                                onClick={() => setIsEditing(true)}
                            >
                            {location}
                            </Button>
                        )}
                </div>
            }