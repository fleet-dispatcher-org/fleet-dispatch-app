import { run, setDefaultOpenAIKey } from "@openai/agents";
import { BaseAgent } from "../core/Agent";
import { DistanceTool } from "../tools/DistanceTool";
import { AssignmentTool, AssignmentResults, AssignmentContext } from "../tools/AssignmentTool";

// Set the OpenAI API key
setDefaultOpenAIKey(process.env.OPENAI_API_KEY!);

// Agent instructions as a constant for reuse
const LOGISTICS_AGENT_INSTRUCTIONS = `You are a logistics assignment agent that creates optimal driver-truck-trailer-load assignments.

## WORKFLOW:
1. Analyze the provided context data
2. Use calculate_distance tool to determine proximity between resources and loads
3. Create optimized assignments based on logistics best practices
4. Call create_assignments tool with your final results

## ASSIGNMENT CRITERIA:
1. **Urgency Priority**: Assign loads with earliest due_by dates first
2. **Proximity Matching**: Use calculate_distance tool to match drivers/equipment closest to load origin
3. **Capacity Validation**: Ensure truck+trailer capacity >= load weight
4. **Efficiency**: Minimize total travel distance without a load attached to a driver. Always assign the driver back to their home location on the last load

## ASSIGNMENT PROCESS:
1. Sort unassigned loads by due_by date (earliest first)
2. For each load, use calculate_distance tool to find distances to available drivers, trucks, and trailers. Assign closest driver, truck, and trailer
3. Select the combination with shortest total distance that meets capacity requirements
4. Validate weight capacity: load.weight <= min(truck.capacity, trailer.capacity)
5. Create assignment with rationale explaining the choice and distance calculations

## RULES:
- Only use exact IDs from the context data
- Each resource can only be assigned once
- Load weight must not exceed both truck AND trailer capacity
- Assign multiple loads and prioritize bringing the driver back to their home location on the last load
- Always use calculate_distance tool for proximity decisions
- Call create_assignments tool with ALL assignments at once`;

/**
 * Specialized agent for logistics and load assignment operations
 */
export class LogisticsAgent extends BaseAgent {
    private assignmentTool: AssignmentTool;

    constructor() {
        const distanceTool = new DistanceTool();
        const assignmentTool = new AssignmentTool();

        super({
            name: "Load Assignment Optimizer",
            model: "gpt-5",
            instructions: LOGISTICS_AGENT_INSTRUCTIONS,
            tools: [distanceTool, assignmentTool]
        });

        this.assignmentTool = assignmentTool;
    }

    /**
     * Execute load assignment with the given assignment context
     */
    async execute(input: string, context: AssignmentContext): Promise<AssignmentResults> {
        try {
            // Clear any previous results and context
            this.assignmentTool.clearCapturedResult();
            this.assignmentTool.clearContext();

            // Store context in the assignment tool for access during execution
            this.assignmentTool.setContext(context);

            // Transform data for AI processing
            const loadsData = context.unassignedLoads.map(load => ({
                id: load.id,
                origin: load.origin,
                destination: load.destination,
                due_by: load.due_by,
                weight: load.weight,
                status: load.status,
                origin_coordinates: load.origin_coordinates,
                destination_coordinates: load.destination_coordinates
            }));

            const driversData = context.unassignedDrivers.map(driver => ({
                id: driver.id,
                name: `${driver.first_name || ''} ${driver.last_name || ''}`.trim() || 'Unknown',
                location: driver.current_location,
                status: driver.employment_status,
                current_coordinates: driver.current_coordinates,
                home_coordinates: driver.home_coordinates
            }));

            const trucksData = context.unassignedTrucks.map(truck => ({
                id: truck.id,
                model: truck.model || 'Unknown',
                location: truck.current_location,
                status: truck.truck_status,
                capacity: truck.capacity_tons,
                current_coordinates: truck.current_coordinates,
            }));

            const trailersData = context.unassignedTrailers.map(trailer => ({
                id: trailer.id,
                type: trailer.model || 'Standard',
                location: trailer.current_location,
                status: trailer.trailer_status,
                capacity: trailer.max_cargo_capacity,
                current_coordinates: trailer.current_coordinates,
            }));

            // Create the input message for the agent
            const agentInput = `Create optimal load assignments using the data below.

AVAILABLE LOADS: ${JSON.stringify(loadsData, null, 2)}
AVAILABLE DRIVERS: ${JSON.stringify(driversData, null, 2)}
AVAILABLE TRUCKS: ${JSON.stringify(trucksData, null, 2)}
AVAILABLE TRAILERS: ${JSON.stringify(trailersData, null, 2)}

Use ONLY the IDs shown above. Match loads by urgency, consider proximity, and ensure capacity constraints are met.`;

            // Execute the agent
            const result = await run(
                this.agent,
                agentInput
            );

            // Return results with priority logic
            const capturedResult = this.assignmentTool.getCapturedResult();
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
            console.error("LogisticsAgent execution error:", error);
            return {
                assignments: [],
                summary: `Assignment failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    /**
     * Assign loads to resources - main public interface
     */
    async assignLoadsToResources(assignmentData: AssignmentContext): Promise<AssignmentResults> {
        return this.execute("", assignmentData);
    }
}

