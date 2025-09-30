import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/prisma/prisma'

type RouteParams = {
    params: Promise<{
        requestId: string,
    }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const  { requestId } = await params;


        const timeOff = await prisma.timeOffRequest.findMany({ where: { id: requestId } })
        return NextResponse.json(timeOff)
    } catch (error) {
        console.error('Error fetching time off:', error)
        return NextResponse.json({ error: 'Failed to fetch time off' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }
        const { requestId } = await params;
        const deletedTimeOff = await prisma.timeOffRequest.delete({ where: { id: requestId } })
        return NextResponse.json(deletedTimeOff)
    } catch (error) {
        console.error('Error deleting time off:', error)
        return NextResponse.json({ error: 'Failed to delete time off' }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }
        const { requestId } = await params;
        const body = await request.json()
        const updatedTimeOff = await prisma.timeOffRequest.update({ where: { id: requestId }, data: body })
        return NextResponse.json(updatedTimeOff)
    } catch (error) {
        console.error('Error updating time off:', error)
        return NextResponse.json({ error: 'Failed to update time off' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }
        const body = await request.json()
        const newTimeOff = await prisma.timeOffRequest.create({ data: body })
        return NextResponse.json(newTimeOff)
    } catch (error) {
        console.error('Error creating time off:', error)
        return NextResponse.json({ error: 'Failed to create time off' }, { status: 500 })
    }
}