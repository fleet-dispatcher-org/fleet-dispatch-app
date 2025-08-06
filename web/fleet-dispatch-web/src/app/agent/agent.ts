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

// Agent instructions as a constant for reuse
const AGENT_INSTRUCTIONS = `You are a logistics assignment agent that creates optimal driver-truck-trailer-load assignments.

## WORKFLOW:
1. Analyze the provided context data
2. Create optimized assignments based on logistics best practices
3. Call create_assignments tool with your final results

## ASSIGNMENT CRITERIA:
1. **Urgency Priority**: Assign loads with earliest due_by dates first
2. **Proximity Matching**: Match drivers/equipment closest to load origin
3. **Capacity Validation**: Ensure truck+trailer capacity >= load weight
4. **Efficiency**: Minimize total travel distance

## ASSIGNMENT PROCESS:
1. Sort unassigned loads by due_by date (earliest first)
2. For each load, find the best combination of available resources
3. Validate weight capacity: load.weight <= min(truck.capacity, trailer.capacity)
4. Create assignment with rationale explaining the choice

## RULES:
- Only use exact IDs from the context data
- Each resource can only be assigned once
- Load weight must not exceed both truck AND trailer capacity
- Call create_assignments tool with ALL assignments at once`;

export async function assignLoadsToResources(assignmentData: AssignmentContext): Promise<AssignmentResults> {
    try {
        // Closure variable to capture tool results
        let capturedResult: AssignmentResults | null = null;

        // Transform data for AI processing
        const loadsData = assignmentData.unassignedLoads.map(load => ({
            id: load.id,
            origin: load.origin,
            destination: load.destination,
            due_by: load.due_by,
            weight: load.weight,
            status: load.status
        }));

        const driversData = assignmentData.unassignedDrivers.map(driver => ({
            id: driver.id,
            name: `${driver.first_name || ''} ${driver.last_name || ''}`.trim() || 'Unknown',
            location: driver.current_location,
            status: driver.employment_status
        }));

        const trucksData = assignmentData.unassignedTrucks.map(truck => ({
            id: truck.id,
            model: truck.model || 'Unknown',
            location: truck.current_location,
            status: truck.truck_status,
            capacity: truck.capacity_tons
        }));

        const trailersData = assignmentData.unassignedTrailers.map(trailer => ({
            id: trailer.id,
            type: trailer.model || 'Standard',
            location: trailer.current_location,
            status: trailer.trailer_status,
            capacity: trailer.max_cargo_capacity
        }));

        // Create agent with closure-capturing tool
        const assignmentAgent = new Agent({
            name: "Load Assignment Optimizer",
            model: "gpt-4o",
            instructions: AGENT_INSTRUCTIONS,
            tools: [tool({
                name: "create_assignments",
                description: "Create and return the final assignment results.",
                parameters: z.object({
                    assignments: z.array(z.object({
                        load_id: z.string(),
                        driver_id: z.string(),
                        truck_id: z.string(),
                        trailer_id: z.string(),
                        rationale: z.string()
                    })),
                    summary: z.string()
                }),
                strict: true,
                execute: async (args, runContext?: RunContext<AssignmentContext>): Promise<AssignmentResults> => {
                    const context = runContext?.context;
                    if (!context) {
                        const result = { assignments: [], summary: "Error: No context available" };
                        capturedResult = result;
                        return result;
                    }

                    const validatedAssignments: Assignment[] = [];
                    const errors: string[] = [];

                    for (const assignment of args.assignments) {
                        const load = context.unassignedLoads.find(l => l.id === assignment.load_id);
                        const driver = context.unassignedDrivers.find(d => d.id === assignment.driver_id);
                        const truck = context.unassignedTrucks.find(t => t.id === assignment.truck_id);
                        const trailer = context.unassignedTrailers.find(t => t.id === assignment.trailer_id);

                        if (!load) errors.push(`Load ${assignment.load_id} not found`);
                        if (!driver) errors.push(`Driver ${assignment.driver_id} not found`);
                        if (!truck) errors.push(`Truck ${assignment.truck_id} not found`);
                        if (!trailer) errors.push(`Trailer ${assignment.trailer_id} not found`);

                        if (load && driver && truck && trailer) {
                            validatedAssignments.push(assignment);
                        }
                    }

                    const result = {
                        assignments: validatedAssignments,
                        summary: errors.length > 0 ? `${args.summary} | Issues: ${errors.join('; ')}` : args.summary
                    };
                    
                    capturedResult = result; // Capture the result
                    return result;
                }
            })]
        });

        // Execute the agent
        const result = await run(
            assignmentAgent,
            `Create optimal load assignments using the data below.

AVAILABLE LOADS: ${JSON.stringify(loadsData, null, 2)}
AVAILABLE DRIVERS: ${JSON.stringify(driversData, null, 2)}
AVAILABLE TRUCKS: ${JSON.stringify(trucksData, null, 2)}
AVAILABLE TRAILERS: ${JSON.stringify(trailersData, null, 2)}

Use ONLY the IDs shown above. Match loads by urgency, consider proximity, and ensure capacity constraints are met.`,
            { context: assignmentData }
        );

        // Return results with same priority logic
        if (capturedResult) {
            return capturedResult;
        }

        if (result.finalOutput && typeof result.finalOutput === 'object' && 
            'assignments' in result.finalOutput && 'summary' in result.finalOutput) {
            return result.finalOutput as AssignmentResults;
        }

        return {
            assignments: [],
            summary: "Assignment failed: Agent did not use assignment tool properly"
        };

    } catch (error) {
        return {
            assignments: [],
            summary: `Assignment failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}