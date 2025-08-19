// types/next-auth.d.ts
import NextAuth from "next-auth"

// Augmentations for "next-auth"

// This is for Role based routing. Needed extensions so that auth would read the additions to existing types.
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      name?: string | null
      email?: string | null
      image?: string | null
      assigned_fleet?: string | null
    }
  }

  interface User {
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    id: string
  }
}