"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Suspense } from 'react';
import AdminDashboardContent from "../../components/DashboardContent";

export default async function AdminDashboard() {
    const session = await auth();
    
    // Handle authentication on the server side
    if (!session?.user) {
        redirect('/login');
    }
    
    // Handle role authorization - only admins can access
    if (session.user.role !== 'ADMIN') {
        redirect('/unauthorized');
    }

    return (
        <Suspense fallback={<div>Loading dashboard...</div>}>
            <AdminDashboardContent />
        </Suspense>
    )
    
}
