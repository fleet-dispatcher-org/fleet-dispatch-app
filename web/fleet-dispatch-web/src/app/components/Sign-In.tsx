"use client";

import Button from "./Button"
import { login } from "../lib/actions/auth"


interface SignInProps {
    className?: string,
    children?: React.ReactNode
}

export default function SignIn({children, className}: SignInProps) {
  return <Button className={className} type="none" onClick={() => login()}> {children} </Button>
}
