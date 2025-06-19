"use client";

import { auth } from "@/auth";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from "next/navigation";
import { fetchUsers } from "../../lib/functions/userFunctions";
import getUserStats from "../../lib/functions/userFunctions"
import DashboardLoading from "../../components/DashboardLoading";
import DashboardError from "../../components/DashboardError";
import Logo from "../../components/Logo";

export default async function AdminDashboard() {
    // Make sure user is authenticated
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
    const { data: session } = useSession();
    
    // If user is not authenticated, redirect to login
    if (!session) redirect("/login");

    // If user is not an admin, redirect to unauthorized page
    if (session.user.role !== "ADMIN") redirect("/unauthorized");

    //
    useEffect(() => {
        fetchUsers();
    }, []);

    // If user is authenticated, show admin dashboard
    if (loading) {
        <DashboardLoading />
    }

    if (error) {
        DashboardError(error, fetchUsers());
    }

    const stats = await getUserStats();

    return (
        <>
        <div className="flex flex-row space-x-0">
            <Logo 
                path="/fleet-dispatch-logo-no-background.png"
                alt="Inverted Logo"
                width={38}
                height={38}
                reroute="/"
            />
            <h4 className="text-3xl mt-0.5 ml-1 font-bold">Fleet Dispatch</h4>
        </div>
        {/* Main Header */}
        <div className="max-w-7xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-gray-600 mt-2">
                    Welcome back, {session?.user?.name}. Manage your fleet users and roles.
                </p>
        </div>


    </>
    );
    
}
