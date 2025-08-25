import { NextRequest, NextResponse } from 'next/server'
import { assignLoadsToResources } from '../../../agent'

export async function POST(request: NextRequest) {
    try {
        const assignmentData = await request.json()
        
        // Debug: Log the received data
        console.log('Received assignment data:', JSON.stringify(assignmentData, null, 2))
        
        // Validate the structure
        if (!assignmentData || typeof assignmentData !== 'object') {
            return NextResponse.json(
                { error: 'Invalid request body' }, 
                { status: 400 }
            )
        }
        
        // Check if all required fields are present and are arrays
        const requiredFields = ['unassignedDrivers', 'unassignedTrucks', 'unassignedTrailers', 'unassignedLoads']
        for (const field of requiredFields) {
            if (!Array.isArray(assignmentData[field])) {
                console.error(`${field} is not an array:`, assignmentData[field])
                return NextResponse.json(
                    { error: `${field} must be an array, received: ${typeof assignmentData[field]}` }, 
                    { status: 400 }
                )
            }
        }
        
        // Call the agent function with validated data
        const result = await assignLoadsToResources(assignmentData);
        console.log('Assignment result:', result)
        return NextResponse.json(result)
        
    } catch (error) {
        console.error('Assignment process failed:', error)
        return NextResponse.json(
            { error: 'Assignment process failed', details: error instanceof Error ? error.message : 'Unknown error' }, 
            { status: 500 }
        )
    }
}