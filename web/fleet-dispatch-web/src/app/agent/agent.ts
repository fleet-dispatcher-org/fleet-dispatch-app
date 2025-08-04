import { Agent, tool, setDefaultOpenAIKey, RunContext } from "@openai/agents"
import { AuthenticatedRequest } from "@/types/api";
import { boolean, z } from "zod"
import { Availability_Status } from "@prisma/client";
import { run } from "node:test";

// Set your OpenAI API key
setDefaultOpenAIKey(process.env.OPENAI_API_KEY!);

 interface Truck {
        id: string, 
        license_plate:   string,
        make:            string,
        model:            string,    
        year:             number,
        capacity_tons:    number,
        mileage:          number,
        is_active:        boolean,
        current_location: string | undefined,
        truck_status:     Availability_Status, 
        assigned_driver:  boolean,
        driver_id:        string,
        assigned_trailer: boolean,
        trailer_id:       string | undefined,
        created_at:       Date,
        driver:           Driver[]
        trailer:          Trailer[]
        load:             Load[]
        assigned_fleet_id: string | undefined,
        fleet:   Fleet | null
    }

interface Driver {
    id: string,
    first_name: string,
    last_name: string,
    email: string,
    phone_number: string,
    license_number: string,
    available: boolean,
    created_at: Date,
    updated_at: Date,
    driver_status: Availability_Status,
    assigned_fleet_id: string | undefined,
    fleet: Fleet | null
}

interface Trailer {
    id: string,
    assigned_truck_id: string | null,
    current_location: string | null,
    has_registration: boolean | null,
    make: string | null,
    model: string | null,
    year: number | null,
    bureaucratically_sound: boolean | null,
    correct_equipment_working: boolean | null,
    max_cargo_capacity: number | null,
    current_cargo_weight: number | null,
    insurance_valid: boolean | null,
    trailer_status: Availability_Status,
    assigned_fleet_id: string | undefined,
    fleet: Fleet | null
}

interface Fleet {
    id: string,
    name: string,
    drivers: Driver[],
    trucks: Truck[],
    trailers: Trailer[],
    created_at: Date,
    updated_at: Date
}

interface Load {
    id: string,
    load_type: string,
    weight: number,
    description: string,
    assigned_truck_id: string | null,
    assigned_driver_id: string | null,
    assigned_trailer_id: string | null,
    created_at: Date,
    updated_at: Date
}

interface AssignmentContext {
    unassignedDrivers: Driver[],
    unassignedTrucks: Truck[],
    unassignedTrailers: Trailer[],
    unassignedLoads: Load[]
}

// Assignment result interface
interface Assignment {
    load_id: string,
    driver_id: string,
    truck_id: string,
    trailer_id: string,
    rationale: string,
    estimated_distance?: number,
    estimated_duration?: number
}

interface AssignmentResults {
    assignments: Assignment[],
    unassignedLoads: Load[],
    summary: string
}


const getUnassignedLoads = tool({
    name: "get_unassigned_loads",
    description: `Assign Unassigned Drivers, Trucks, and Trailers to Loads. 
    Do so in a fashion that makes certain that the Drivers, 
    Trucks and Trailers are close in location to where the Load originates`,
    parameters: z.object({}),
    execute: async (_args, runContext?: RunContext<AssignmentContext>): Promise<Load[] | undefined> => {
        return runContext?.context?.unassignedLoads || [];
    }
})

// Tool to get available trucks for assignment
const getAvailableTrucks = tool({
    name: "get_available_trucks",
    description: "Get all available trucks from the context that can be assigned to loads",
    parameters: z.object({}),
    execute: async (_args, runContext?: RunContext<AssignmentContext>): Promise<Truck[]> => {
        return runContext?.context?.unassignedTrucks || [];
    }
});

const getAvailableDrivers = tool({
    name: "get_available_drivers",
    description: "Get all available drivers from the context that can be assigned to loads",
    parameters: z.object({}),
    execute: async (_args, runContext?: RunContext<AssignmentContext>): Promise<Driver[]> => {
        return runContext?.context?.unassignedDrivers || [];
    }
})

const getAvailableTrailers = tool({
    name: "get_available_trailers",
    description: "Get all available trailers from the context that can be assigned to loads",
    parameters: z.object({}),
    execute: async (_args, runContext?: RunContext<AssignmentContext>): Promise<Trailer[]> => {
        return runContext?.context?.unassignedTrailers || [];
    }
}) 


const makeOptimalAssignments = tool({
    name: "make_optimal_assignments",
    description: "Get all available trailers from the context that can be assigned to loads",
    parameters: z.object({
        assignments: z.array(z.object({
            load_id: z.string(),
            driver_id: z.string(),  
            truck_id: z.string(),
            trailer_id: z.string(),
            rationale: z.string(),
        })),
    }),
    execute: async (_args, runContext?: RunContext<AssignmentContext>): Promise<AssignmentResults> => {
        const context = runContext?.context;
        if(!context) return { assignments: [], unassignedLoads: [], summary: "No assignments needed." };
        
        const assignedLoadIds = new Set(_args.assignments.map(assignment => assignment.load_id));
        const unassignedLoads = context.unassignedLoads.filter(load => !assignedLoadIds.has(load.id));

        return {
            assignments: _args.assignments,
            unassignedLoads,
            summary: "Optimal assignments made."
        }
    }
})

export const dispatch_agent = new Agent({
    name: "Fleet Dispatch Assistant",
    model: "gpt-4o",
    instructions: `You are a professional fleet dispatch assistant specializing in optimal driver selection and route planning. 
    Your primary responsibility is to analyze available drivers and recommend the 5 best candidates for 
    specific transportation assignments based on driving time efficiency and regulatory compliance.\n
    
    ## IMPORTANT: Context Data Access\n
        You will receive complete driver data through the context parameter. This data contains a 'drivers' array
        with all available driver information. DO NOT ask for driver data - it is already provided to you.
        "Immediately analyze the provided driver data to make your recommendations.\n\n
        
    ## Core Responsibilities:\n
        1. Driver Analysis: Evaluate driver availability, location, certifications, and compliance status\n
        2. Route Optimization: Calculate optimal driving times between locations\n
        3. Regulatory Compliance: Ensure all recommendations comply with DOT Hours of Service regulations\n
        4. Order Management: Handle transportation orders and summaries\n\n
    
    ## Driver Selection Criteria (Priority Order):\n
        1. **Availability Status**: is_available=true, driver_status='AVAILABLE', driver_reports_ready=true\n
        2. **Compliance**: drug_test_current=true, employment_status='HIRED', valid license\n
        3. **Location Efficiency**: in_range=true drivers first, closest to pickup point\n
        4. **Certification Match**: Required certifications (HAZMAT, PASSENGER, SCHOOL_BUS, DOUBLE_TRIPLE)\n
        5. **Experience**: Hire date and license validity\n\n
    
    ## Driver Data Structure:\n
        The context contains JSON with drivers array containing: id, first_name, last_name, license_number,
        license_expiration, license_class, current_location, in_range, is_available, driver_reports_ready,
        driver_status, assigned_truck_id, phone_number, emergency_contact info, certifications array,
        drug_test_current, employment_status, hire_date\n\n

    ## DOT Compliance Requirements:\n
        - Maximum 11 hours driving per day\n
        - 30-minute break after 8 hours\n
        - 10-hour rest period between shifts\n
        - Only recommend fully compliant drivers\n\n
        
    ## Driver Recommendation Format:\n
        **Driver #[1-5]: [First Name] [Last Name]**\n
        - Location: [Current Location]\n
        - Distance to Pickup: [Estimated distance/time]\n
        - Certifications: [List relevant certifications]\n
        - License: Class [X], expires [date]\n
        - Contact: [phone_number]\n
        - Rationale: [Why this driver is optimal]\n\n
        
        Available tools:\n
        - hrs_min_sec: Convert decimal hours to HH:MM:SS format\n
        - trip_schedule: Calculate DOT-compliant trip schedules with required breaks\n\n      
        
        ## Trip Scheduling Guidelines:\n
        - Use trip_schedule tool to calculate DOT-compliant schedules\n
        - Consider start time (decimal hours), distance (miles), and average speed (mph)\n
        - Factor in mandatory 30-minute breaks after 8 hours and 10-hour rest periods\n
        - Use hrs_min_sec to format time displays for better readability\n\n
        
        ## Communication Style:\n
        - Professional and industry-appropriate\n
        - Clear, actionable recommendations\n
        - Organized responses with numbered sections\n
        - Never compromise on safety or compliance\n
        - If insufficient qualified drivers available, clearly explain shortage and suggest alternatives\n\n
        
        ## Response Protocol:\n
        When you receive a request for driver recommendations:\n
        1. Immediately access and analyze the driver data from context\n
        2. Filter drivers based on availability and compliance criteria\n
        3. Rank remaining drivers by location efficiency and qualifications\n
        4. Present top 5 recommendations in the specified format\n
        5. DO NOT ask for additional driver information - use what's provided\n\n
        
        Always begin your analysis immediately using the provided context data.
        Prioritize safety and DOT compliance in all driver recommendations.
    `,
    tools: [
        getAvailableDrivers,
        getAvailableTrucks, 
        getAvailableTrailers,
        getUnassignedLoads,
        makeOptimalAssignments,
    ],
})

