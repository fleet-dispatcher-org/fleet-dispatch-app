import { auth } from "../../../auth";
// import { useState } from "react";
import Logo from "../components/Logo";
import Location from "../components/Location";
import CalendarCombo from "../components/CalendarCombo";
import RoleGuard from "../components/RoleGuard";
import UserProfileCard from "../components/UserProfileCard";
import MiniDashboard from "../components/MiniDashboard";
import MiniLoadsBoard from "../components/MiniLoadsBoard";
import MiniTrucksBoard from "../components/MiniTrucksBoard";
import DriverLoadsWrapper from "../components/DriverLoadsWrapper";
import { Metadata } from "next";
import CreateLoadCard from "../components/CreateLoadCard";


export const metadata: Metadata = {
    title: 'Profile',
}

export default async function Profile() {
    const session = await auth();
    
    if (session?.user === null) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-red-400 text-lg">Error signing in. Please try again.</div>
            </div>
        );
    }

    if (session?.user === undefined) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }
   

    const ProfileLayout = ({ children, role }: { children: React.ReactNode; role: string }) => (
        <div className="min-h-screen bg-black">
            {/* Header */}
            <header className="bg-gray-900 shadow-sm border-b border-gray-400 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Logo
                            path="/fleet-dispatch-logo-no-background.png"
                            alt="Inverted Logo"
                            width={38}
                            height={38}
                            reroute="/"
                        />
                        <h1 className="text-2xl font-bold text-white">Fleet Dispatch</h1>
                    </div>
                    <div className="text-sm text-gray-500">
                        Role: {role}
                    </div>
                </div>
            </header>
             {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Profile Header */}
                <div className="mb-8">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
                        <div className="flex items-center justify-center">
                            <div className="text-center">
                                <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
                                <p className="text-lg opacity-90">{role} Dashboard</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* User Profile and Location */}

                    <div className="flex flex-col lg:flex-cols gap-6 mb-8">
                        <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-400 mb-4">Profile Information</h3>
                            <UserProfileCard />
                        </div>
                        <div className="bg-gray-900 rounded-lg items-center justify-center shadow-sm border border-gray-700 p-6 flex flex-row gap-10 ">
                            <div className="items-center justify-center">
                                <h3 className="text-center text-lg font-semibold text-gray-400 mb-4 justify-center">Home Base</h3>
                                <Location className="text-center"/>
                            </div>
                            {role === "DRIVER" && (
                                <div className="items-center justify-center">
                                    <h3 className="text-center text-lg font-semibold text-gray-400 mb-4">Current Location</h3>
                                    <Location />
                                </div>
                            )}
                        </div>
                        
                    </div>

                {/* Dashboard Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Time Off Request */}
                    <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-400">Request Time Off</h3>
                        </div>
                        <CalendarCombo type="range" />
                    </div>

                    {/* Role-specific Content */}
                    {children}
                </div>
            </main>
        </div>
    );

    if (session?.user.role === "ADMIN") {
        return (
            <RoleGuard allowedRoles={['ADMIN']}>
                <ProfileLayout role="ADMIN">
                    {/* Dashboard Overview */}
                    <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-400">System Overview</h3>
                        </div>
                        <MiniDashboard />
                    </div>

                    {/* Loads Management */}
                    <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-400">Loads Management</h3>
                        </div>
                        <MiniLoadsBoard />
                        <CreateLoadCard/>
                    </div>

                </ProfileLayout>
            </RoleGuard>
        );
    }
    else if (session?.user.role === "DISPATCHER") {
        return (
            <RoleGuard allowedRoles={['DISPATCHER']}>
                <ProfileLayout role="DISPATCHER">
                    {/* Loads Overview */}
                    <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-400">Active Loads</h3>
                        </div>
                        <MiniLoadsBoard />
                    </div>

                    {/* Fleet Management */}
                    <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-400">Fleet Status</h3>
                        </div>
                        <MiniTrucksBoard />
                    </div>
                </ProfileLayout>
            </RoleGuard>
        );
    }

    else if (session?.user.role === "DRIVER") {
        return (
            <RoleGuard allowedRoles={['DRIVER']}>
                <ProfileLayout role="DRIVER">
                    {/* My Loads */}
                    <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-400">My Assigned Loads</h3>
                        </div>
                        <DriverLoadsWrapper userId={session.user.id} />
                    </div>

                    {/* Fleet Status */}
                    <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-400">Available Trucks</h3>
                        </div>
                        <MiniTrucksBoard />
                    </div>
                </ProfileLayout>
            </RoleGuard>
        );
    }

    return null; 
}