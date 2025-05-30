"use client";

import React from "react";
import { useEffect } from "react";
import { Button } from "../components/Button";

export default function Register() {
    useEffect(() => {
        document.title = "Fleet Registration";
      })
    return (
        <main>
            <header className="flex flex-row justify-around">
            <h1 className="text-4xl font-bold text-center">Fleet Registration</h1>
            </header>
            <form>
                <ol className="list-none p-0 m-0 space-y-2 flex flex-col gap-10  justify-center align-middle items-center mt-20 margin-auto ">
                    <li className="flex flex-row">
                        <label className="font-bold mr-2 w-[100px]" htmlFor="name">Name: </label>
                        <input className="border border-solid border-white" id="name" name="name" type="text" />
                        
                    </li>
                    
                    <li className="flex flex-row">
                        <label className="font-bold mr-2 w-[100px]" htmlFor="title">Title: </label>
                        <input className="border border-solid border-white" id="title" name="title" type="text" />
                    </li>
                    <li className="flex flex-row">
                        <label className="font-bold mr-2 w-[100px]" htmlFor="company">Company: </label>
                        <input className="border border-solid border-white" id="company" name="company" type="text" />
                    </li>
                    <li className="flex flex-row">
                        <label className="font-bold mr-2 w-[100px]" htmlFor="email">Email: </label>
                        <input className="border border-solid border-white" id="email" name="email" type="email" />
                    </li>
                    <li className="flex flex-row">
                        <label className="font-bold mr-2" htmlFor="phone">Phone: </label>
                        <div className="flex gap-2">
                            <input className="border border-white w-16" id="area" name="area-code" />
                            <input className="border border-white w-40" id="phone" name="phone" />
                        </div>
                    </li>
                    <li>
                        <Button type="general">
                            Register
                        </Button>
                    </li>
                </ol>
            </form>
        </main>
    );
}