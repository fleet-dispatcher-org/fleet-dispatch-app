"use client";

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import RoleBadgeColor from './RoleBadgeColor';

interface UserData {
  id: string
  name: string
  email: string
  role: string
}

export default function UserProfileCard() {
    const { data: session } = useSession()
    const [userData, setUserData] = useState<UserData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    
      useEffect(() => {
        const fetchUserData = async () => {
            try {
                    const response = await fetch('/api/me')
                    if (!response.ok) {
                        throw new Error('Failed to fetch user data')
                    }
                
                const data = await response.json()
                setUserData(data.user)
                
            } catch (err) {
                    setError(err instanceof Error ? err.message : 'Unknown error')
                
                } finally {
                    setLoading(false)
                }
        }

        if (session) {
        fetchUserData()
        }
    }, [session])
    if (loading) {
        return (
        <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-600 text-center p-4">
        Error loading profile: {error}
      </div>
    )
  }

  if (!userData) {
    return null
  }

  return (
    <div className=" rounded-lg shadow-md p-6 mx-auto max-w-sm">
      {session?.user?.image && (
        <Image 
          src={session.user.image} 
          alt="User profile" 
          width={200} 
          height={200}
          className="rounded-full mx-auto mb-2"
        />
      )}
      <h1 className="text-2xl font-bold text-center mb-2">{userData.name}</h1>
      <p className=" text-center mb-2">{userData.email}</p>
      <div className="flex justify-center">
        <RoleBadgeColor role={userData.role }></RoleBadgeColor>
      </div>
    </div>
  )
}