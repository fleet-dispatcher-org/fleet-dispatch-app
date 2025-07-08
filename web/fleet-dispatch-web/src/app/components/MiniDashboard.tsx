'use client'
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import type { Role } from "@prisma/client";
import Logo from './Logo';
import Image from 'next/image'

interface User {
  id: string;
  name: string;
  email: string;
  image: string;
  role: Role;
  createdAt: string;
}

export default function MiniDashboard() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users/limited?limit=4&random=true');

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: Role) => {
        setUpdatingUserId(userId);
        try {
            const response = await fetch(`/api/admin/users/${userId}/role`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ role: newRole }),
            });

            if (!response.ok) {
                throw new Error('Failed to update user role');
            }

            const data = await response.json();
            
            // Update the local state
            setUsers(prevUsers => 
                prevUsers.map(user => 
                    user.id === userId ? { ...user, role: data.user.role } : user
                )
            );
            
            alert('User role updated successfully!');
        } catch (err) {
            console.error('Error updating user role:', err);
            alert('Failed to update user role');
        } finally {
            setUpdatingUserId(null);
        }
    };

  const getRoleBadgeColor = (role: Role): string => {
        switch (role) {
            case 'ADMIN': return 'bg-red-100 text-red-800 border-red-200';
            case 'DISPATCHER': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'DRIVER': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

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
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="text-red-800">
                        <strong>Error loading dashboard:</strong> {error}
                    </div>
                    <button 
                        onClick={fetchUsers}
                        className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className='max-w-4xl mx-auto p-6'>
            <a href="/admin/dashboard" className="flex items-center px-1 pt-1 font-medium hover:underline">See All Users &rarr;</a>
            <div className="grid grid-cols-2 gap-4">
            {users.map((user) => (
                <div key={user.id} className="bg-gray-900 border border-gray-700 rounded-lg p-6 hover:bg-gray-700 transition-colors">
                {/* User Section */}
                <div className="mb-4">
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    User
                    </h3>
                    <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-gray-800 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-300">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </span>
                    </div>
                    <div className="ml-3">
                        <span className="text-sm font-medium text-gray-300">
                        {user.name || 'Unknown User'}
                        </span>
                    </div>
                    </div>
                </div>

                {/* Role Section */}
                <div>
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Role
                    </h3>
                    <div className="flex items-center space-x-3">
                    <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user.id, e.target.value as Role)}
                        disabled={updatingUserId === user.id}
                        className="text-sm bg-gray-800 border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 hover:cursor-pointer px-3 py-1"
                    >
                        <option value="DRIVER">Driver</option>
                        <option value="DISPATCHER">Dispatcher</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                    
                    {updatingUserId === user.id && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    )}
                    </div>
                </div>
                </div>
            ))}
            </div>
        </div>
    )
}