import { Agent, tool, setDefaultOpenAIKey, RunContext, run } from "@openai/agents"
import { z } from "zod"
import { Driver, Load, Trailer, Truck } from "@prisma/client";

setDefaultOpenAIKey(process.env.OPENAI_API_KEY!);

export interface AssignmentContext {
    unassignedDrivers: Driver[],
    unassignedTrucks: Truck[],
    unassignedTrailers: Trailer[],
    unassignedLoads: Load[]
}

export interface Assignment {
    load_id: string,
    driver_id: string,
    truck_id: string,
    trailer_id: string,
    rationale: string,
}

export interface AssignmentResults {
    assignments: Assignment[],
    summary: string
}

// This is the ONLY tool that should return the final result
const createAssignments = tool({
    name: "create_assignments",
    description: "REQUIRED: Create and return the final assignment results. This tool MUST be called to complete the assignment process.",
    parameters: z.object({
        assignments: z.array(z.object({
            load_id: z.string().describe("Exact load ID from the unassigned loads"),
            driver_id: z.string().describe("Exact driver ID from available drivers"),
            truck_id: z.string().describe("Exact truck ID from available trucks"),
            trailer_id: z.string().describe("Exact trailer ID from available trailers"),
            rationale: z.string().describe("Brief explanation for this assignment choice")
        })).describe("Array of load assignments with exact IDs"),
        summary: z.string().describe("Summary of assignment process and results")
    }),
    execute: async (args, runContext?: RunContext<AssignmentContext>): Promise<AssignmentResults> => {
        const context = runContext?.context;
        if (!context) {
            return { 
                assignments: [],  
                summary: "No context available" 
            };
        }
    

        return {
            assignments: args.assignments,
            summary: args.summary
        };
    }
});

export const dispatch_agent = new Agent({
    name: "Assignment Agent",
    model: "gpt-4o",
    instructions: `You are an assignment agent that creates optimal driver-truck-trailer-load assignments.

## CRITICAL REQUIREMENTS:
1. You MUST call the create_assignments tool with your results
2. Use EXACT IDs from the context data - do not make up IDs
3. Only assign loads with status "UNASSIGNED" 
4. Do not assign loads that already have assigned_driver, assigned_truck, or assigned_trailer

## Process:
1. Analyze the context data provided
2. Find truly unassigned loads (status = "UNASSIGNED" AND all assigned fields are null)
3. Match available drivers, trucks, and trailers to these loads
4. Call create_assignments with exact IDs and rationale
5. Do NOT provide a text summary - only call the tool

## Assignment Logic:
- Prioritize loads by due date (earliest first)
- Match closest available resources to minimize travel
- Ensure load weight is within truck/trailer capacity
- Match any special requirements (HAZMAT, etc.)

## Data Access:
The context contains:
- unassignedDrivers: array of available drivers
- unassignedTrucks: array of available trucks  
- unassignedTrailers: array of available trailers
- unassignedLoads: array of loads needing assignment

You have access to all this data directly through the context parameter.

REMEMBER: You must end by calling create_assignments with the exact IDs from the data.`,
    tools: [createAssignments],
});

export async function assignLoadsToResources(assignmentData: AssignmentContext): Promise<AssignmentResults> {
    try {
        console.log('Starting assignment with:', {
            drivers: assignmentData.unassignedDrivers.length,
            trucks: assignmentData.unassignedTrucks.length,
            trailers: assignmentData.unassignedTrailers.length,
            loads: assignmentData.unassignedLoads.length
        });

        // We're already filtering the data. So there's a bit of an expectation of Filtered loads being provided.

        console.log('Truly unassigned loads:', assignmentData.unassignedLoads.length);


        const result = await run(
            dispatch_agent,
            `Create assignments for the unassigned loads using available drivers, trucks, and trailers. 
            
            Available resources:
            - Drivers: ${assignmentData.unassignedDrivers.length}
            - Trucks: ${assignmentData.unassignedTrucks.length}  
            - Trailers: ${assignmentData.unassignedTrailers.length}
            - Truly unassigned loads: ${assignmentData.unassignedLoads.length}
            
            Use the exact IDs from the data and call create_assignments with your results.
            `,
            {
                context: assignmentData
            }
        );

        console.log('Agent result type:', typeof result.finalOutput);
        console.log('Agent result:', result.finalOutput);

        // The tool should return AssignmentResults directly
        if (result.finalOutput && typeof result.finalOutput === 'object' && 'assignments' in result.finalOutput) {
            return result.finalOutput as AssignmentResults;
        }


        // Fallback
        return {
            assignments: [],
            summary: result.finalOutput as string
        };

    } catch (error) {
        console.error('Assignment failed:', error);
        return {
            assignments: [],
            summary: `Assignment failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}