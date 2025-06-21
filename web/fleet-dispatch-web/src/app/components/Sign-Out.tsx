"use client";

import { signOut } from "next-auth/react"
import Button from "./Button"
import { logout } from "../lib/actions/auth"


interface SignOutProps {
    className?: string,
    children?: React.ReactNode
}

export default function SignOut({children, className}: SignOutProps) {
  return <Button type="none" onClick={() => logout()}> {children} </Button>
}
