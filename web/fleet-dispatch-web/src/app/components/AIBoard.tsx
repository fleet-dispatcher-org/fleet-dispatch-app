'use client'
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Role, Status } from "@prisma/client";
import Logo from './Logo';
import { Timestamp } from 'next/dist/server/lib/cache-handlers/types';
import { tr } from 'react-day-picker/locale';

interface Load {
    id: string,
    origin: string,
    destination: string,
    weight: number,
    status: Status,
    started_at: Timestamp,
    assigned_driver: string,
    assigned_trailer: string,
    assigned_truck: string,
    percent_complete: number,
    is_active: boolean,
    due_date: Timestamp
}

export default function AIBoard() {
    const { data: session } = useSession();
        const [loads, setLoads] = useState<Load[]>([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState<string | null>(null);
        const [updatingLoadId, setUpdatingLoadId] = useState<string | null>(null);

    useEffect(() => {
        getSuggestions();
    }, []);
    
    const getSuggestions = async () => {
        const response = await fetch('/api/dispatcher/suggested', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            throw new Error('Failed to fetch loads');
        }

        const data = await response.json();
        setLoads(data?.loads || []);
        setError(null);
    }

    const acceptLoad= async(loadId: string, newStatus: string, newDriverId: string, newTruckId: string, newTrailerId: string) => {
        
    }
    
}