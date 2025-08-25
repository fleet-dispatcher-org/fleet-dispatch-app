import { tool } from "@openai/agents";
import { z } from "zod";

/**
 * Interface for tool execution context
 */
export interface ToolContext {
    [key: string]: any;
}

/**
 * Abstract base class for all agent tools
 */
export abstract class Tool {
    public name: string;
    public description: string;
    public parameters: z.ZodSchema<any>;
    public strict: boolean;

    constructor(config: {
        name: string;
        description: string;
        parameters: z.ZodSchema<any>;
        strict?: boolean;
    }) {
        this.name = config.name;
        this.description = config.description;
        this.parameters = config.parameters;
        this.strict = config.strict ?? true;
    }

    /**
     * Execute the tool with given arguments and context
     */
    abstract execute(args: any, context?: ToolContext): Promise<any>;

    /**
     * Get the OpenAI tool configuration
     */
    getOpenAITool() {
        return tool({
            name: this.name,
            description: this.description,
            parameters: this.parameters as any, // Cast to any to avoid type issues
            strict: this.strict,
            execute: this.execute.bind(this)
        });
    }

    /**
     * Validate tool arguments against the schema
     */
    validateArgs(args: any): boolean {
        try {
            this.parameters.parse(args);
            return true;
        } catch (error) {
            console.error(`Tool ${this.name} validation error:`, error);
            return false;
        }
    }
}
