"use client";

import React from "react";
import { useEffect, useState, useRef } from "react";
import Button from "./Button";
import  LocationFinder from "../components/LocationFinder";
import { useCityState } from "../hooks/useCityState";
import { useSession } from "next-auth/react";

interface LocationProps {
    className?: string
}

export default function Location({className}: LocationProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [location, setLocation] = useState('');
    const [tempValue, setTempValue] = useState(location);
    const inputRef = useRef<HTMLInputElement>(null);
    const { data: session } = useSession();
    const { getCoordinates } = useCityState();

    async function getLocationdb() {
        const location = await fetch(`/api/dispatcher/drivers/${session?.user?.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        const locationJson = await location.json();
        setLocation(locationJson.current_location);
    }

    

    useEffect(() => {
        if(isEditing && inputRef.current) {
            inputRef.current.focus();
        }
        getLocationdb();
    }, [isEditing]);

    const handleBlur = () => {
        setLocation(tempValue.trim() || location);
        setIsEditing(false);
    };

    return <div className={className}>
                    {isEditing ? (
                            <input
                                ref={inputRef}
                                value={tempValue}
                                onChange={(e) => setTempValue(e.target.value)}
                                onBlur={handleBlur}
                                onKeyDown={ async (e) => {
                                    if (e.key === 'Enter') {
                                    handleBlur(); // Save on Enter
                                    await getCoordinates(tempValue);
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
                   <LocationFinder />     
                </div>
            }