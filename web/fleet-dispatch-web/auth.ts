import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "../fleet-dispatch-web/prisma/prisma";
 
const adapter = PrismaAdapter(prisma);

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: adapter,
  providers: [GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }), Credentials({
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      
    }
  })],
})