"use server";

import { signIn, signOut } from "../../../../auth";

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