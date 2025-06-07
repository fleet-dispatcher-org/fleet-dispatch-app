"use client";

import Image from "next/image";
import Logo from "./components/Logo";
import { Helmet } from "react-helmet";
import { useEffect } from "react";
import Button  from "./components/Button";
import Link from "next/link";
import SignIn from "./components/Sign-In";

export default function Home() {
  useEffect(() => {
    document.title = "Fleet Dispatch";
  })
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center justify-center sm-flex:row m:items-start">
        <Logo 
          path="/fleet-dispatch-logo-no-background.png"
          alt="Inverted Logo"
          width={180}
          height={38}
          reroute="/"
        />

        <h1 className="text-4xl sm:text-6xl font-italic font-bold text-center">Fleet Dispatch</h1>

        <div className="flex gap-4 items-center justify-center flex-col sm:flex-row">
          <SignIn
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            
          >
            <Image
              className="light:invert hover:dark:inverted-colors"
              src="/fleet-dispatch-logo-no-background.png"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Login
          </SignIn>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white transition-colors flex items-center justify-center hover:bg-[#f2f2f2] hover:text-black dark:hover:bg-[#f2f2f2] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="/register"
            target="_blank"
            rel="noopener noreferrer"
          >
            Register
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="/report"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Report a Concern
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          About Us
        </a>
      </footer>
    </div>
  );
}
