import { NextResponse } from 'next/server'
import prisma from "@/prisma/prisma";

export async function POST(request: Request) {
    const { name, email, role } = await request.json()
    const user = await prisma.user.create({
        data: {
            name: name,
            email: email,
            role: role
        }
    })
    return NextResponse.json(user)
}