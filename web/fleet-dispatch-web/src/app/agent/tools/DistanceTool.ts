import { z } from "zod";
import { Tool, ToolContext } from "../core/Tool";

/**
 * Calculate the distance between two points on Earth using the Haversine formula
 * @param lat1 Latitude of first point in degrees
 * @param lon1 Longitude of first point in degrees
 * @param lat2 Latitude of second point in degrees
 * @param lon2 Longitude of second point in degrees
 * @returns Distance in miles
 */
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

/**
 * Tool for calculating distances between geographic points using the Haversine formula
 */
export class DistanceTool extends Tool {
    constructor() {
        super({
            name: "calculate_distance",
            description: "Calculate the distance between two geographic points using the Haversine formula. Returns distance in miles.",
            parameters: z.object({
                lat1: z.number().describe("Latitude of first point in degrees"),
                lon1: z.number().describe("Longitude of first point in degrees"),
                lat2: z.number().describe("Latitude of second point in degrees"),
                lon2: z.number().describe("Longitude of second point in degrees")
            }),
            strict: true
        });
    }

    async execute(args: {
        lat1: number;
        lon1: number;
        lat2: number;
        lon2: number;
    }, context?: ToolContext): Promise<{ distance_miles: number }> {
        try {
            const distance = calculateHaversineDistance(args.lat1, args.lon1, args.lat2, args.lon2);
            return { distance_miles: Math.round(distance * 100) / 100 }; // Round to 2 decimal places
        } catch (error) {
            console.error("Error calculating distance:", error);
            throw new Error(`Failed to calculate distance: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}

