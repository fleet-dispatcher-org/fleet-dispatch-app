"use client";

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import RoleBadgeColor from './RoleBadgeColor';
import Role from '@prisma/client';

interface User {
  id: string
  name: string
  image: string
  email: string
  role: string
}

export default function AdminUserProfileCard(User: User) {
    const [error, setError] = useState<string | null>(null)
    const user = User;


  if (error) {
    return (
      <div className="text-red-600 text-center p-4">
        Error loading profile: {error}
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className=" rounded-lg shadow-md p-6 mx-auto max-w-sm">
      {user?.image ? (
          <Image 
            src={user.image} 
            alt="User profile" 
            width={200} 
            height={200}
            className="rounded-full mx-auto mb-2"
          />
        ) : (
          <div className="w-[200px] h-[200px] rounded-full mx-auto mb-2 bg-gray-500 flex items-center justify-center">
            <span className="text-white text-6xl font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
        )}
      <h1 className="text-2xl font-bold text-center mb-2">{user.name}</h1>
      <p className=" text-center mb-2">{user.email}</p>
      <div className="flex justify-center">
        <RoleBadgeColor role={user.role }></RoleBadgeColor>
      </div>
    </div>
  )
}