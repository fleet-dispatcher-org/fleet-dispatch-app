'use client';

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import type { Role } from '@prisma/client';
import UserRoleDisplay from './UserRoleDisplay';

export default function RoleBasedNavigation() {
    const { data: session } = useSession();

    if(!session) return null;

    const role: Role = session.user.role as Role;

    (
    <nav className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            <Link href="/" className="flex items-center px-1 pt-1 text-sm font-medium">
              Home
            </Link>
            
            {/* Driver Routes */}
            {(role === 'DRIVER' || role === 'ADMIN') && (
              <>
                <Link href="/driver/dashboard" className="flex items-center px-1 pt-1 text-sm font-medium">
                  Driver Dashboard
                </Link>
                <Link href="/driver/routes" className="flex items-center px-1 pt-1 text-sm font-medium">
                  My Routes
                </Link>
              </>
            )}
            
            {/* Dispatcher Routes */}
            {(role === 'DISPATCHER' || role === 'ADMIN') && (
              <>
                <Link href="/dispatcher/dashboard" className="flex items-center px-1 pt-1 text-sm font-medium">
                  Dispatch Center
                </Link>
                <Link href="/dispatcher/assign" className="flex items-center px-1 pt-1 text-sm font-medium">
                  Assign Routes
                </Link>
              </>
            )}
            
            {/* Admin Routes */}
            {role === 'ADMIN' && (
              <>
                <Link href="/admin/dashboard" className="flex items-center px-1 pt-1 text-sm font-medium">
                  Admin Panel
                </Link>
                <Link href="/admin/users" className="flex items-center px-1 pt-1 text-sm font-medium">
                  Manage Users
                </Link>
              </>
            )}
          </div>
          
          <div className="flex items-center">
            <UserRoleDisplay />
          </div>
        </div>
      </div>
    </nav>
  )
}
