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
      
      // Since you're using PrismaAdapter, you should have access to the user parameter
      if (session.user && user) {
        try {
          // Fetch the full user data including role
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true, id: true, name: true, email: true, assigned_fleet: true }
          });
          
          console.log("DB User found:", dbUser); // Add this log to debug
          
          session.user.role = dbUser?.role || 'USER';
          session.user.id = user.id;
          
          console.log("Session user role set to:", session.user.role); // Add this log
        } catch (error) {
          console.error("Error fetching user role:", error);
          session.user.role = 'USER'; // fallback
          session.user.id = user.id;
        }
      }
      
      return session;
    },

    // With PrismaAdapter, JWT callback might not be necessary, but keeping it for safety
    async jwt({ token, user }) {
      if (user) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true }
          });
          token.role = dbUser?.role || 'USER';
          if (user.id) {
            token.id = user.id;
          }
          console.log("JWT token role set to:", token.role); // Add this log
        } catch (error) {
          console.error("Error in JWT callback:", error);
          token.role = 'USER';
          if (user.id) {
          token.id = user.id;
          }
        }
      }
      return token;
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

    async signOut(params) {
      // Type guard approach
      if ('session' in params && params.session) {
        console.log("SignOut event (database session):", { 
          sessionId: params.session.sessionToken,
          userId: params.session.userId
        });
      } else if ('token' in params && params.token) {
        console.log("SignOut event (JWT token):", { 
          email: params.token.email,
          userId: params.token.id
        });
      } else {
        console.log("SignOut event: No session or token data");
      }
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