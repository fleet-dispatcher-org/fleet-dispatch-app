import { tool } from "@openai/agents";
import { z } from "zod";

/**
 * Interface for tool execution context
 */
export interface ToolContext {
    [key: string]: unknown;
}

/**
 * Generic tool arguments type
 */
export type ToolArgs = Record<string, unknown>;

/**
 * Generic tool result type
 */
export interface ToolResult {
    success: boolean;
    data?: unknown;
    error?: string;
    message?: string;
}

/**
 * Abstract base class for all agent tools
 */
export abstract class Tool {
    public name: string;
    public description: string;
    public parameters: z.ZodSchema<unknown>;
    public strict: boolean;

    constructor(config: {
        name: string;
        description: string;
        parameters: z.ZodSchema<unknown>;
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
    abstract execute(args: ToolArgs, context?: ToolContext): Promise<ToolResult>;

    /**
     * Get the OpenAI tool configuration
     */
    getOpenAITool() {
        return tool({
            name: this.name,
            description: this.description,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            parameters: this.parameters as any,
            strict: this.strict,
            execute: async (input: unknown) => {
                return await this.execute(input as ToolArgs);
            }
        });
    }

    /**
     * Validate tool arguments against the schema
     */
    validateArgs(args: ToolArgs): boolean {
        try {
            this.parameters.parse(args);
            return true;
        } catch (error) {
            console.error(`Tool ${this.name} validation error:`, error);
            return false;
        }
    }
}
