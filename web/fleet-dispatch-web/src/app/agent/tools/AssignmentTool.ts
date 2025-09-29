import { z } from "zod";
import { Tool, ToolContext, ToolArgs, ToolResult } from "../core/Tool";
import { Driver, Load, Trailer, Truck } from "@prisma/client";

/**
 * Assignment data structure
 */
export interface Assignment {
    load_id: string;
    driver_id: string;
    truck_id: string;
    trailer_id: string;
    rationale: string;
}

/**
 * Assignment results structure
 */
export interface AssignmentResults {
    assignments: Assignment[];
    summary: string;
}

/**
 * Assignment context that should be passed to this tool
 */
export interface AssignmentContext {
    unassignedDrivers: Driver[];
    unassignedTrucks: Truck[];
    unassignedTrailers: Trailer[];
    unassignedLoads: Load[];
}

/**
 * Tool for creating and validating load assignments
 */
export class AssignmentTool extends Tool {
    private capturedResult: AssignmentResults | null = null;
    private storedContext: AssignmentContext | null = null;

    constructor() {
        super({
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
            strict: true
        });
    }

    async execute(args: ToolArgs, context?: ToolContext): Promise<ToolResult> {
        try {
            // Type assertion to get the expected arguments
            const { assignments, summary } = args as {
                assignments: Assignment[];
                summary: string;
            };
            
            // Use stored context first, then fallback to parameter context
            const assignmentContext = this.storedContext || (context as unknown as AssignmentContext);
            
            if (!assignmentContext) {
                const result = { 
                    assignments: [], 
                    summary: "Error: No assignment context available. Context must be set before tool execution." 
                };
                this.capturedResult = result;
                return {
                    success: false,
                    error: result.summary
                };
            }

            // Validate context structure
            if (!assignmentContext.unassignedLoads || !Array.isArray(assignmentContext.unassignedLoads)) {
                const result = { 
                    assignments: [], 
                    summary: "Error: Invalid context - unassignedLoads must be an array" 
                };
                this.capturedResult = result;
                return {
                    success: false,
                    error: result.summary
                };
            }

            if (!assignmentContext.unassignedDrivers || !Array.isArray(assignmentContext.unassignedDrivers)) {
                const result = { 
                    assignments: [], 
                    summary: "Error: Invalid context - unassignedDrivers must be an array" 
                };
                this.capturedResult = result;
                return {
                    success: false,
                    error: result.summary
                };
            }

            if (!assignmentContext.unassignedTrucks || !Array.isArray(assignmentContext.unassignedTrucks)) {
                const result = { 
                    assignments: [], 
                    summary: "Error: Invalid context - unassignedTrucks must be an array" 
                };
                this.capturedResult = result;
                return {
                    success: false,
                    error: result.summary
                };
            }

            if (!assignmentContext.unassignedTrailers || !Array.isArray(assignmentContext.unassignedTrailers)) {
                const result = { 
                    assignments: [], 
                    summary: "Error: Invalid context - unassignedTrailers must be an array" 
                };
                this.capturedResult = result;
                return {
                    success: false,
                    error: result.summary
                };
            }

            const validatedAssignments: Assignment[] = [];
            const errors: string[] = [];

            // Validate each assignment
            for (const assignment of assignments) {
                const load = assignmentContext.unassignedLoads.find(l => l.id === assignment.load_id);
                const driver = assignmentContext.unassignedDrivers.find(d => d.id === assignment.driver_id);
                const truck = assignmentContext.unassignedTrucks.find(t => t.id === assignment.truck_id);
                const trailer = assignmentContext.unassignedTrailers.find(t => t.id === assignment.trailer_id);

                if (!load) errors.push(`Load ${assignment.load_id} not found`);
                if (!driver) errors.push(`Driver ${assignment.driver_id} not found`);
                if (!truck) errors.push(`Truck ${assignment.truck_id} not found`);
                if (!trailer) errors.push(`Trailer ${assignment.trailer_id} not found`);

                // Additional validation: capacity check
                if (load && truck && trailer) {
                    const loadWeight = load.weight || 0;
                    const truckCapacity = truck.capacity_tons || 0;
                    const trailerCapacity = trailer.max_cargo_capacity || 0;
                    
                    if (loadWeight > truckCapacity || loadWeight > trailerCapacity) {
                        errors.push(`Load ${assignment.load_id} weight (${loadWeight}) exceeds capacity (truck: ${truckCapacity}, trailer: ${trailerCapacity})`);
                    }
                }

                if (load && driver && truck && trailer) {
                    validatedAssignments.push(assignment);
                }
            }

            const result = {
                assignments: validatedAssignments,
                summary: errors.length > 0 ? `${summary} | Issues: ${errors.join('; ')}` : summary
            };
            
            this.capturedResult = result;
            return {
                success: true,
                data: result,
                message: result.summary
            };

        } catch (error) {
            console.error("Error creating assignments:", error);
            
            // Provide more detailed error information
            let errorMessage = 'Unknown error';
            if (error instanceof Error) {
                errorMessage = error.message;
                if (error.stack) {
                    console.error("Error stack:", error.stack);
                }
            }
            
            const errorResult = {
                assignments: [],
                summary: `Assignment failed: ${errorMessage}. Check context data and assignment parameters.`
            };
            this.capturedResult = errorResult;
            return {
                success: false,
                error: errorResult.summary
            };
        }
    }

    /**
     * Get the last captured result (useful for closure-based execution)
     */
    getCapturedResult(): AssignmentResults | null {
        return this.capturedResult;
    }

    /**
     * Clear the captured result
     */
    clearCapturedResult(): void {
        this.capturedResult = null;
    }

    /**
     * Set the assignment context for this tool
     */
    setContext(context: AssignmentContext): void {
        this.storedContext = context;
    }

    /**
     * Clear the stored context
     */
    clearContext(): void {
        this.storedContext = null;
    }
}

