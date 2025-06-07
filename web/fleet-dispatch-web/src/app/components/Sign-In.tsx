
"use client"

import { signIn } from "next-auth/react"
import Button from "./Button"


interface SignInProps {
    className?: string,
    children?: React.ReactNode
}

export default function SignIn({children, className}: SignInProps) {
  return <Button type="sign-in" onClick={() => signIn("google")}> {children} </Button>
}
