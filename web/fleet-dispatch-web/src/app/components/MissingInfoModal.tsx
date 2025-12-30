"use client";
import React from 'react'
import { useEffect, useState } from 'react'
import { Truck, Trailer } from '@prisma/client';

interface MissingInfoModalProps {
    id: string | null;
    type: 'truck' | 'trailer';
    open: boolean;
    onClose?: () => void;
}

export default function MissingInfoModal({ id, type, open}: MissingInfoModalProps)  {
    const [missingInfo, setMissingInfo] = useState({});
    const [loading, setLoading] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState<boolean>(open);
    const [object, setObject] = useState<Truck | Trailer | null>(null);
    const [editing, setEditing] = useState<boolean>(false);
    
    async function fetchDetails() {
        if (type === 'truck' && id) {
            setLoading(true);
            try {
                const response = await fetch(`/api/trucks/${id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch truck details');
                }
                const data = await response.json();
                setObject(data as Truck);
                identifyMissingInfo(data);
            } catch (error) {
                console.error('Error fetching truck details:', error);
            }
    }
        else if (type === 'trailer' && id) {
            setLoading(true);
            try {
                const response = await fetch(`/api/trailers/${id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch trailer details');
                }
                const data = await response.json();
                setObject(data as Trailer);
                identifyMissingInfo(data);
            } catch (error) {
                console.error('Error fetching trailer details:', error);
            }
        }
        setLoading(false);
    }

    async function saveNewInfo() {
        if(type === "truck") {
            setLoading(true);
            try {
                const response = await fetch(`api/trucks/${id}`, {
                    method: "PATCH",
                    headers: {
                    'Content-Type': 'application/json',
                },
                    body: JSON.stringify(missingInfo),
                })
                if (!response.ok) {
                    console.log("Error sending info to DB")
                }
            } catch (error) {
                console.log(`Error updating info for type: ${type}; Error: `, error)
            }
        } 
        else if(type === "trailer") {
            setLoading(true);
            try {
                const response = await fetch(`api/trailers/${id}`, {
                    method: "PATCH",
                    headers: {
                    'Content-Type': 'application/json',
                },
                    body: JSON.stringify(missingInfo),
                })
                if (!response.ok) {
                    console.log("Error sending info to DB")
                }
            } catch (error) {
                console.log(`Error updating info for type: ${type}; Error: `, error)
            }
        }
    }

    function handleChange(e: React.FormEvent<HTMLInputElement>, key: string) {
        setEditing(true)
        const newMissingInfo = {...missingInfo, key: e.currentTarget.value};
        setMissingInfo(newMissingInfo);
        setEditing(false)
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if(e.key === 'enter') {
            setEditing(false)
        } else if (e.key === 'escape') {
            setEditing(false)
        }
    }

    function identifyMissingInfo(data: Truck | Trailer) {
        const missing: { [key: string]: string } = {};
        for (const [key, value] of Object.entries(data)) {
            if (value === null || value === '') {
                missing[key] = 'Missing';
            }
        }
        setMissingInfo(missing);
    }
    useEffect(() => {
        setIsOpen(open);
        if (open) {
            fetchDetails();
        }
    }, [open, id, type]);

    return (
        <>
        {isOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 max-w-3xl w-full">
                    <div className="flex flex-row justify-between items-center mb-4">
                        <h4 className="text-lg font-semibold text-gray-300 mb-4">Missing Information:</h4>
                        <h4 className="text-lg font-semibold text-gray-300 mb-4 cursor-pointer" onClick={() => setIsOpen(!open)}>X</h4>
                    </div>
                    <form className='flext flext-col text-gray-400 justify-center align-center'>
                        {
                            Object.keys(missingInfo).map((key, value) => (
                                <div className='justify-between' key={key}>
                                    <label className='justify-between'>
                                        {key}: <input className='border rounded' onKeyDown={handleKeyDown} onChange={(e) => {handleChange(e, key)}} type="text" />
                                    </label>
                                </div>
                            ))
                        }
                        <label onClick={saveNewInfo}>
                           Save <input hidden={true} type="submit" />
                        </label>
                    </form>
                </div>
            </div>
        )}
        </>
    );

}