
"use client"

import { signIn } from "next-auth/react"
import Button from "./Button"
import { login } from "../lib/actions/auth"


interface SignInProps {
    className?: string,
    children?: React.ReactNode
}

export default function SignIn({children, className}: SignInProps) {
  return <Button type="sign-in" onClick={() => signIn()}> {children} </Button>
}
