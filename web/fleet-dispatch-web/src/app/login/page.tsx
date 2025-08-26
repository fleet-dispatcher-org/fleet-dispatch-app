"use server";

import React from "react";
import Button from "../components/Button";
import Logo from "../components/Logo";
import SignIn from "../components/Sign-In";
import { login } from "../lib/actions/auth";
import { Input } from "@material-tailwind/react";
import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login",
    
};

export default async function Login() {
    return (
        <div className="flex flex-col mx-auto w-[400px] mt-10 justify-center space-x-0 font-bold text-center">
            <Logo 
                      path="/fleet-dispatch-logo-no-background.png"
                      alt="Inverted Logo"
                      className="mx-auto"
                      width={140}
                      height={40}
                      reroute="/"
                    />
            <h1 className="font-bold text-center text-2xl mt-4">Login</h1>
            <div className="relative mt-4">
            <input type="text" id="floating_filled" className="block rounded-t-lg px-2.5 pb-2.5 pt-5 w-full text-sm text-gray-900 bg-gray-50 dark:bg-black border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
            <label htmlFor="floating_filled" className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] start-2.5 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">Email: </label>
            </div>
            <div className="relative mt-6">
            <input type="text" id="floating_filled" className="block rounded-t-lg px-2.5 pb-2.5 pt-5 w-full text-sm text-gray-900 bg-gray-50 dark:bg-black border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
            <label htmlFor="floating_filled" className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] start-2.5 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">Password: </label>
            </div>
            <a className="text-sm text-gray-500 dark:text-gray-400 hover:underline mt-0.5" href="/signup"><Button type="none">Don't have an account? Sign Up here!</Button></a>
            <div className="flex flex-col gap-2 mt-6">
                    <div className="flex flex-row border border-white rounded-full items-center justify-center">
                        <Logo 
                        path="/fleet-dispatch-logo-no-background.png"
                        alt="Inverted Logo"
                        className="mx-auto"
                        width={40}
                        height={40}
                        />
                        <Button type="text">Login</Button>
                    </div>
                <h1 className="text-sm text-gray-500 dark:text-gray-400 mt-4">Or with:</h1>
                <div className="flex flex-row mx-auto gap-4 mt-3">
                    <SignIn>
                        <img 
                        src="/web_dark_rd_na@1x.png"
                        alt="Vercel logomark"/>
                    </SignIn>
                </div>
            </div>
        </div>
    );
}