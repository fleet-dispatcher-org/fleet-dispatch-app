import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "./prisma/prisma";

const adapter = PrismaAdapter(prisma);

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }), 
  ],
  trustHost: true,
  debug: true,
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("SignIn callback triggered:", { 
        user: user?.email, 
        provider: account?.provider,
        accountId: account?.providerAccountId 
      });
      
      // If this is a Google OAuth sign-in attempt
      if (account?.provider === "google" && user?.email) {
        try {
          // Check if user exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
            include: { accounts: true }
          });

          if (existingUser) {
            console.log("Found existing user:", existingUser.email);
            
            // Check if Google account is already linked
            const existingGoogleAccount = existingUser.accounts.find(
              acc => acc.provider === "google"
            );

            if (existingGoogleAccount) {
              console.log("Google account already linked");
              return true;
            } else {
              console.log("User exists but Google not linked - will create new account link");
              // Let NextAuth handle the account linking
              return true;
            }
          } else {
            console.log("New user - will be created");
            return true;
          }
        } catch (error) {
          console.error("Error in signIn callback:", error);
          return false;
        }
      }
      
      return true;
    },
    
    async session({ session, user }) {
      console.log("Session callback - user:", user?.email || session?.user?.email);
      return session;
    }
  },
  
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log("SignIn event:", { 
        user: user.email, 
        provider: account?.provider, 
        isNewUser 
      });
    },
    async createUser({ user }) {
      console.log("User created:", user.email);
    },
    async linkAccount({ user, account, profile }) {
      console.log("Account linked:", { 
        user: user.email, 
        provider: account.provider 
      });
    }
  }
})