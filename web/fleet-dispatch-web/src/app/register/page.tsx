"use client";

import React from "react";
import { useEffect } from "react";
import { Button } from "../components/Button";
import Logo from "../components/Logo";

export default function Register() {
    useEffect(() => {
        document.title = "Fleet Registration";
      })
    return (
        <main>
            <header className="flex flex-row mx-auto w-[400px] mt-20 justify-center space-x-0">
                <Logo
                          className="mr-3" 
                          path="/fleet-dispatch-logo-no-background.png"
                          alt="Inverted Logo"
                          width={70}
                          height={20}
                          reroute="/"
                        />
            <h1 className="text-4xl font-bold text-center mt-4">Fleet Registration</h1>
            </header>
            <form className="space-y-4 mx-auto w-[400px] mt-20 gap-10">
                <ul className="space-y-8">
                    <li className="flex">
                        <div className="w-[100px] pr-2">
                        <label className="font-bold block pt-[6px]" htmlFor="name">Name:</label>
                        </div>
                        <div className="flex flex-col">
                        <input className="border border-white w-64" id="name" />
                        </div>
                    </li>

                    <li className="flex">
                        <div className="w-[100px] pr-2">
                        <label className="font-bold block pt-[6px]" htmlFor="title">Title: </label>
                        </div>
                        <div className="flex flex-col">
                        <input className="border border-white w-64" id="title" />
                        </div>

                    </li>

                    <li className="flex">
                        <div className="w-[100px] pr-2">
                        <label className="font-bold block pt-[6px]" htmlFor="fleet-name">Fleet Name:</label>
                        </div>
                        <div className="flex flex-col">
                        <input className="border border-white w-64" id="fleet-name" />
                        <p className="text-sm text-gray-400 mt-1">This may change due to availability.</p>
                        </div>
                    </li>

                    <li className="flex">
                        <div className="w-[100px] pr-2">
                        <label className="font-bold block pt-[6px]" htmlFor="company">Company:</label>
                        </div>
                        <div className="flex flex-col">
                        <input className="border border-white w-64" id="company" />
                        </div>
                    </li>

                    <li className="flex">
                        <div className="w-[100px] pr-2">
                        <label className="font-bold block pt-[6px]" htmlFor="email">Email:</label>
                        </div>
                        <div className="flex flex-col">
                        <input className="border border-white w-64" id="email" />
                        <p className="text-sm text-gray-400 mt-1">We'll never share your email.</p>
                        </div>
                    </li>

                    <li className="flex">
                        <div className="w-[100px] pr-2">
                        <label className="font-bold block pt-[6px]" htmlFor="phone">Phone:</label>
                        </div>
                        <div className="flex flex-col">
                        <div className="flex gap-2">
                            <input className="border border-white w-16" id="area" name="area-code" />
                            <input className="border border-white w-40" id="phone" name="phone" />
                        </div>
                            <div className="flex flex-row gap-2">
                                <p className="text-sm text-gray-400 mt-1">Ex. +1 </p>
                                <p className="text-sm text-gray-400 mt-1 ml-10">(123) 456-7890</p>
                            </div>
                        </div>
                    </li>
                    </ul>
                    <Button type="general">Register</Button>
                    </form>
        </main>
    );
}