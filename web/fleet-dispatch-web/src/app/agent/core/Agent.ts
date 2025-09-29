import { Agent as OpenAIAgent } from "@openai/agents";
import { Tool } from "./Tool";

/**
 * Context type for agent execution
 */
export interface AgentContext {
    [key: string]: unknown;
}

/**
 * Result type for agent execution
 */
export interface AgentResult {
    success: boolean;
    data?: unknown;
    error?: string;
    message?: string;
}

/**
 * Base agent interface that defines the core structure for all agents
 */
export interface IAgent {
    name: string;
    model: string;
    instructions: string;
    tools: Tool[];
    execute(input: string, context?: AgentContext): Promise<AgentResult>;
}

/**
 * Base agent class that provides common functionality
 */
export abstract class BaseAgent implements IAgent {
    public name: string;
    public model: string;
    public instructions: string;
    public tools: Tool[];
    protected agent: OpenAIAgent;

    constructor(config: {
        name: string;
        model: string;
        instructions: string;
        tools: Tool[];
    }) {
        this.name = config.name;
        this.model = config.model;
        this.instructions = config.instructions;
        this.tools = config.tools;
        
        // Create OpenAI agent with tools
        this.agent = new OpenAIAgent({
            name: this.name,
            model: this.model,
            instructions: this.instructions,
            tools: this.tools.map(tool => tool.getOpenAITool())
        });
    }

    /**
     * Execute the agent with given input and context
     */
    abstract execute(input: string, context?: AgentContext): Promise<AgentResult>;

    /**
     * Add a tool to the agent
     */
    addTool(tool: Tool): void {
        this.tools.push(tool);
        // Recreate agent with new tools
        this.agent = new OpenAIAgent({
            name: this.name,
            model: this.model,
            instructions: this.instructions,
            tools: this.tools.map(t => t.getOpenAITool())
        });
    }

    /**
     * Remove a tool from the agent
     */
    removeTool(toolName: string): void {
        this.tools = this.tools.filter(tool => tool.name !== toolName);
        // Recreate agent with updated tools
        this.agent = new OpenAIAgent({
            name: this.name,
            model: this.model,
            instructions: this.instructions,
            tools: this.tools.map(t => t.getOpenAITool())
        });
    }

    /**
     * Get the OpenAI agent instance
     */
    getOpenAIAgent(): OpenAIAgent {
        return this.agent;
    }
}
