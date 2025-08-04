import { NextApiRequest, NextApiResponse } from "next";

export interface AuthenticatedRequest extends NextApiRequest {
    apiKey?: string
}

export type ApiHandler = (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void> | void;

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}