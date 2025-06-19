'use client'
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import type { Role } from '@prisma/client';

interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
}

    const { data: session } = useSession();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

export async function fetchUsers() { 
    try {
        setLoading(true);
        const response = await fetch('/api/admin/users');

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

}

export async function updateUserRole(userId: string, newRole: Role) {
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
        setUsers(users.map(user=> 
            user.id == userId ? {...user, role: newRole} : user
        )
        );
        alert('User role updated successfully');
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
        setUpdatingUserId(null);
    }
}

export default async function getUserStats() {
    const stats = users.reduce((acc, user) => {
            acc[user.role] = (acc[user.role] || 0) + 1;
            return acc;
        }, {} as Record<Role, number>);
    
    return {
        total: users.length,
        admins: stats.ADMIN || 0,
        drivers: stats.DRIVER || 0,
        dispatchers: stats.DISPATCHER || 0
    };
}