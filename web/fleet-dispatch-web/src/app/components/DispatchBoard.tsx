'use client'
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Role } from "@prisma/client";
import Logo from './Logo';
import { Timestamp } from 'next/dist/server/lib/cache-handlers/types';


interface Load {
    id: String,
    origin: String,
    destination: String,
    weight: Number,
    status: String,
    started_at: Timestamp,
    assigned_driver: String,
    assigned_trailer: String,
    assigned_truck: String,
    percent_complete: Number,
    is_active: Boolean
}

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export default function DispatchBoard() {
    const { data: session } = useSession();
    const [loads, setLoads] = useState<Load[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingLoadId, setUpdatingLoadId] = useState<string | null>(null);

    useEffect(() => {
        fetchLoads();
    }, []);

    const fetchLoads = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/dispatcher/loads');

            if (!response.ok) {
                throw new Error('Failed to fetch loads');
            }

            const data = await response.json();
            setLoads(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }

    const updateLoad = async (loadId: string, newStatus: String) => {
        setUpdatingLoadId(loadId);
        try {
            const response = await fetch(`/api/dispatcher/loads/${loadId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: newStatus
                })
            })
            if (!response.ok) {
                throw new Error('Failed to update load');
            }
            setLoads(prevLoads =>
                prevLoads.map(load =>
                    load.id === loadId ? { ...load, status: newStatus } : load
                )
            )
            alert("Load status updated successfully!");

        } catch (err) {
            console.error('Error updating load:', err);
            alert('Failed to update load');
        } finally {
            if (updatingLoadId === loadId) {
                setUpdatingLoadId(null);
            }
        }
        setUpdatingLoadId(null);
    }

    const terminateLoad = async (loadId: string) => {
        setUpdatingLoadId(loadId);
        try {
        const response = await fetch(`/api/dispatcher/loads/${loadId}/terminate`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                status: 'TERMINATED',
                is_active: false
            })
        })
        if (!response.ok) {
            throw new Error('Failed to update load');
        }
        setLoads(prevLoads =>
            prevLoads.map(load =>
                load.id === loadId ? { ...load, is_active: true } : load
            )
        )
        alert("Load terminated successfully!");

        } catch (err) {
            console.error('Error updating load:', err);
            alert('Failed to update load');
        }
        finally {
            setUpdatingLoadId(null);
        }
    }
    
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-lg">Loading dashboard...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="text-red-800">
                        <strong>Error loading dashboard: {error}</strong>
                    </div>
                </div>
            </div>
        );
    }

    if (session && session.user.role === Role.DRIVER) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="text-red-800">
                        <strong>Access denied. You are not authorized to access this page.</strong>
                    </div>
                </div>
            </div>
        );
    }

    return (
         <div className="max-w-7xl mx-auto p-6k">
            {/* Outer Container ^*/}
            {/* Header */}
            <div className="mb-8">
                <div className="flex flex-row mb-2">
                <Logo 
                path="/fleet-dispatch-logo-no-background.png"
                alt="Inverted Logo"
                width={38}
                height={38}
                reroute="/"
            />
                <h1 className="text-3xl mt-0.5 ml-2 font-bold text-gray-400">Dispatcher Dashboard</h1>
            </div>
                <p className="text-gray-500 mt-2">
                    Welcome back, {session?.user?.name}. Manage your drivers and loads here.
                </p>
            </div>
         </div>
    )
}