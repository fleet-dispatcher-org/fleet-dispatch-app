import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    return NextResponse.json({ 
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role
      }
    })
  } catch (error) {
    console.error('Error fetching user info:', error)
    return NextResponse.json({ error: 'Failed to fetch user info' }, { status: 500 })
  }
}