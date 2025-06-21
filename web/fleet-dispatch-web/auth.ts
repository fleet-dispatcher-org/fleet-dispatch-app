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

    
    
    async session({ session, user, token }) {
      console.log("Session callback - user:", user?.email || session?.user?.email);
      
      // Add role and id to session from token or user
      if (session.user) {
        if (token) {
          // Use token data if available (JWT strategy)
          session.user.role = token.role as "ADMIN" | "DRIVER" | "DISPATCHER";
          session.user.id = token.id as string;
        } else if (user) {
          // Use user data if available (database strategy)
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true }
          });
          
          session.user.role = dbUser?.role || 'DRIVER';
          session.user.id = user.id;
        }
      }
      
      return session;
    },

    async jwt({ token, user  }) {
      // Add role to JWT token
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true }
        });
        token.role = dbUser?.role || 'DRIVER';
        token.id = user.id;
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