import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/prisma/prisma'
export const dynamic = 'force-dynamic'
export async function GET() {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }
        const timeOff = await prisma.timeOffRequest.findMany()
        return NextResponse.json(timeOff)
    } catch (error) {
        console.error('Error fetching time off:', error)
        return NextResponse.json({ error: 'Failed to fetch time off' }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }
        const body = await request.json()
        const updatedTimeOff = await prisma.timeOffRequest.update({ where: { id: body.id }, data: body })
        return NextResponse.json(updatedTimeOff)
    } catch (error) {
        console.error('Error updating time off:', error)
        return NextResponse.json({ error: 'Failed to update time off' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }
        const body = await request.json()
        const deletedTimeOff = await prisma.timeOffRequest.delete({ where: { id: body.id } })
        return NextResponse.json(deletedTimeOff)
    } catch (error) {
        console.error('Error deleting time off:', error)
        return NextResponse.json({ error: 'Failed to delete time off' }, { status: 500 })
    }
}