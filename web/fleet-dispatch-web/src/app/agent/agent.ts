import { Agent, tool, setDefaultOpenAIKey, RunContext, run } from "@openai/agents"
import { AuthenticatedRequest } from "@/types/api";
import { boolean, z } from "zod"
import { Availability_Status, Driver, Fleet, Load, Trailer, Truck } from "@prisma/client";

setDefaultOpenAIKey(process.env.OPENAI_API_KEY!);

export interface AssignmentContext {
    unassignedDrivers: Driver[],
    unassignedTrucks: Truck[],
    unassignedTrailers: Trailer[],
    unassignedLoads: Load[]
}

// Assignment result interface
export interface Assignment {
    load_id: string,
    driver_id: string,
    truck_id: string,
    trailer_id: string,
    rationale: string,
    estimated_distance?: number,
    estimated_duration?: number
}

export interface AssignmentResults {
    assignments: Assignment[],
    unassignedLoads: Load[],
    summary: string
}

const getUnassignedLoads = tool({
    name: "get_unassigned_loads",
    description: "Get all unassigned loads that need driver, truck, and trailer assignments",
    parameters: z.object({}),
    execute: async (_args, runContext?: RunContext<AssignmentContext>): Promise<Load[] | undefined> => {
        return runContext?.context?.unassignedLoads || [];
    }
})

const getAvailableTrucks = tool({
    name: "get_available_trucks",
    description: "Get all available trucks that can be assigned to loads",
    parameters: z.object({}),
    execute: async (_args, runContext?: RunContext<AssignmentContext>): Promise<Truck[]> => {
        return runContext?.context?.unassignedTrucks || [];
    }
});

const getAvailableDrivers = tool({
    name: "get_available_drivers",
    description: "Get all available drivers that can be assigned to loads",
    parameters: z.object({}),
    execute: async (_args, runContext?: RunContext<AssignmentContext>): Promise<Driver[]> => {
        return runContext?.context?.unassignedDrivers || [];
    }
})

const getAvailableTrailers = tool({
    name: "get_available_trailers",
    description: "Get all available trailers that can be assigned to loads",
    parameters: z.object({}),
    execute: async (_args, runContext?: RunContext<AssignmentContext>): Promise<Trailer[]> => {
        return runContext?.context?.unassignedTrailers || [];
    }
}) 

const makeOptimalAssignments = tool({
    name: "make_optimal_assignments",
    description: "Create optimal assignments of drivers, trucks, and trailers to loads. This tool must be called to complete the assignment process.",
    parameters: z.object({
        assignments: z.array(z.object({
            load_id: z.string().describe("The ID of the load being assigned"),
            driver_id: z.string().describe("The ID of the driver being assigned"),
            truck_id: z.string().describe("The ID of the truck being assigned"),
            trailer_id: z.string().describe("The ID of the trailer being assigned"),
            rationale: z.string().describe("Explanation for why this assignment is optimal"),
        })).describe("Array of load assignments"),
        summary: z.string().describe("Overall summary of the assignment process and results")
    }),
    execute: async (args, runContext?: RunContext<AssignmentContext>): Promise<AssignmentResults> => {
        const context = runContext?.context;
        if (!context) {
            return { 
                assignments: [], 
                unassignedLoads: [], 
                summary: "No context available for assignments." 
            };
        }
        
        const assignedLoadIds = new Set(args.assignments.map(assignment => assignment.load_id));
        const unassignedLoads = context.unassignedLoads.filter(load => !assignedLoadIds.has(load.id));

        return {
            assignments: args.assignments,
            unassignedLoads,
            summary: args.summary
        };
    }
})

export const dispatch_agent = new Agent({
    name: "Fleet Dispatch Assignment Agent",
    model: "gpt-4o",
    instructions: `You are a fleet dispatch assignment agent responsible for creating optimal assignments of drivers, trucks, and trailers to loads.

## Your Task:
1. Analyze available drivers, trucks, trailers, and unassigned loads
2. Create optimal assignments that match resources to loads efficiently
3. ALWAYS call the make_optimal_assignments tool with your assignments
4. Provide rationale for each assignment decision

## Assignment Criteria (in priority order):
1. **Resource Availability**: Only assign available drivers, trucks, and trailers
2. **Location Efficiency**: Minimize travel distance from resource location to load origin
3. **Load Requirements**: Match trailer type and capacity to load specifications
4. **Delivery Deadlines**: Prioritize loads with earlier due dates
5. **Driver Qualifications**: Match driver certifications to load requirements (HAZMAT, etc.)
6. **Equipment Compatibility**: Ensure truck and trailer are compatible

## Process:
1. First, use the get_* tools to retrieve available resources and loads
2. Analyze the data to identify optimal matches
3. Create assignments based on the criteria above
4. MUST call make_optimal_assignments with your results - this is required to complete the task
5. Include detailed rationale for each assignment

## Assignment Strategy:
- Start with the most constrained loads (earliest due dates, special requirements)
- Assign the closest available resources to minimize empty miles
- Consider load weight and trailer capacity
- Ensure driver certifications match load requirements
- Factor in delivery time constraints

## Response Format:
You must always end by calling the make_optimal_assignments tool with:
- An array of assignments (load_id, driver_id, truck_id, trailer_id, rationale)
- A summary of the assignment process and any unassigned loads

Remember: Your job is to make actual assignments, not just provide recommendations. Always call the make_optimal_assignments tool to complete the process.`,
    tools: [
        getAvailableDrivers,
        getAvailableTrucks, 
        getAvailableTrailers,
        getUnassignedLoads,
        makeOptimalAssignments,
    ],
})

export async function assignLoadsToResources(assignmentData: AssignmentContext): Promise<AssignmentResults> {
    try {
        const result = await run(
            dispatch_agent,
            `Create optimal assignments for the available resources and loads. 
            Analyze the data and make assignments that minimize travel time and ensure all requirements are met.
            You must call the make_optimal_assignments tool with your results.`,
            {
                context: assignmentData
            }
        );

        // Check if the agent used the tool and returned structured data
        if (result.finalOutput && typeof result.finalOutput === 'object' && 'assignments' in result.finalOutput) {
            return result.finalOutput as AssignmentResults;
        }
        
        // Fallback if the agent didn't use the tool properly
        console.warn('Agent did not return structured assignment data');
        return {
            assignments: [],
            unassignedLoads: assignmentData.unassignedLoads,
            summary: typeof result.finalOutput === 'string' ? result.finalOutput : 'Assignment process completed but no structured data returned'
        };
    } catch (error) {
        console.error('Assignment process failed:', error);
        return {
            assignments: [],
            unassignedLoads: assignmentData.unassignedLoads,
            summary: `Assignment failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}