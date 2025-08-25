import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/prisma/prisma'

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

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    const body = await request.json()
    const updatedUser = await prisma.user.update({ where: { id: session.user.id }, data: body })
    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user info:', error)
    return NextResponse.json({ error: 'Failed to update user info' }, { status: 500 })
  }
}