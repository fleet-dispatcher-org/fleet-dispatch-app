// Core exports
export { BaseAgent } from "./core/Agent";
export { Tool } from "./core/Tool";
export type { IAgent } from "./core/Agent";
export type { ToolContext } from "./core/Tool";

// Tool exports
export { DistanceTool } from "./tools/DistanceTool";
export { AssignmentTool } from "./tools/AssignmentTool";
export type { Assignment, AssignmentResults, AssignmentContext } from "./tools/AssignmentTool";

// Agent exports
export { LogisticsAgent } from "./agents/LogisticsAgent";

// Import types and classes for function signature
import type { AssignmentContext, AssignmentResults } from "./tools/AssignmentTool";
import { LogisticsAgent } from "./agents/LogisticsAgent";

// Convenience function for backward compatibility
export async function assignLoadsToResources(assignmentData: AssignmentContext): Promise<AssignmentResults> {
    try {
        const logisticsAgent = new LogisticsAgent();
        return await logisticsAgent.assignLoadsToResources(assignmentData);
    } catch (error) {
        console.error("Error in assignLoadsToResources:", error);
        return {
            assignments: [],
            summary: `Assignment failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}
