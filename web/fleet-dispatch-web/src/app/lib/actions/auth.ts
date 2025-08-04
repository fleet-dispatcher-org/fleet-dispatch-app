"use server";

import { redirect } from "next/navigation";
import { signIn, signOut } from "../../../../auth";
import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticatedRequest, ApiHandler } from "@/types/api";
import { getSession } from "next-auth/react";

export const login = async () => {
    await signIn("google", {
        redirectTo: "/profile",
    });
}
export const logout = async () => 
    {
        await signOut({
            redirectTo: "/",
        });
    };