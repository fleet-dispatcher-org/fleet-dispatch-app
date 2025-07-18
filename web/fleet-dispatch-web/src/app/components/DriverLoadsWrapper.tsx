"use client";

import { useEffect, useState } from 'react';
import DriverLoadsClient from "./DriverLoadsClient";

interface Props {
    userId: string
}

export default function DriverLoadsWrapper({ userId }: Props) {
    const [loads, setLoads] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function getDriverLoads() {
            try {
                const response = await fetch(`/api/driver/loads/${userId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch loads');
                }
                const data = await response.json();
                setLoads(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        getDriverLoads();
    }, [userId]);

    if (loading) return <div>Loading...</div>;
    
    return <DriverLoadsClient loads={loads} />;
}