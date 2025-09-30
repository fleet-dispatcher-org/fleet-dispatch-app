"use client";

import { useSession } from "next-auth/react";
import type { Role } from "@prisma/client";

export default function UserRoleDisplay() {
    const { data: session } = useSession();

    if (!session) return null;

    const getRoleBadgeColor = (role: Role): string => {
        switch (role) {
            case 'ADMIN': return 'bg-red-100 text-red-800'
            case 'DISPATCHER': return 'bg-blue-100 text-blue-800'
            case 'DRIVER': return 'bg-green-100 text-green-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="flex items-center space-x-2">
            <span>{session.user.name}</span>
            <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadgeColor(session.user.role as Role)}`}>
                {session.user.role}
            </span>
        </div>
    )
}