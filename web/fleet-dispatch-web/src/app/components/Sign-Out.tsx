"use client";

import Button from "./Button"
import { logout } from "../lib/actions/auth"


interface SignOutProps {
    className?: string,
    children?: React.ReactNode
}

export default function SignOut({children, className}: SignOutProps) {
  return <Button className={className} type="none" onClick={() => logout()}> {children} </Button>
}
