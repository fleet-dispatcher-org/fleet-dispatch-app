import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./auth";
import { match } from "assert";

const protectedRoutes = ["/driver", "/truck", "/dispatcher"];

export default async function middleware(request: NextRequest) {
        const session = await auth();

        const {pathname} = request.nextUrl;

        const adminRoutes = ['/admin', '/admin/.*'];
        const driverRoutes = ['/driver', '/driver/.*'];
        const dispatcherRoutes = ['/dispatcher', '/dispatcher/.*'];

        if (!session) {
            if(pathname.startsWith('/admin') || pathname.startsWith('/dispatcher') || pathname.startsWith('/driver')) {
                return NextResponse.redirect(new URL('/login', request.url));
            }
            return NextResponse.next();
        }

        
         const userRole = session.user?.role

        if (adminRoutes.some(pattern => new RegExp(pattern).test(pathname))) {
            if (userRole !== 'ADMIN') {
                return NextResponse.redirect(new URL('/unauthorized', request.url));
            }
        }

        if (driverRoutes.some(pattern => new RegExp(pattern).test(pathname))) {
            if (userRole !== 'DRIVER' && userRole !== 'ADMIN' && userRole !== 'DISPATCHER') {
                return NextResponse.redirect(new URL('/unauthorized', request.url));
            }
        }

        if (dispatcherRoutes.some(pattern => new RegExp(pattern).test(pathname))) {
            if (userRole !== 'DISPATCHER' && userRole !== 'ADMIN') {
                return NextResponse.redirect(new URL('/unauthorized', request.url));
            }
        }

        const isProtected = protectedRoutes.some((route) =>
            request.nextUrl.pathname.startsWith(route)
        );

        if (isProtected && !session) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        console.log("Middleware Triggered");

        return NextResponse.next();
    }

    export const config = {
        matcher: [
            // Match all routes except static files and API routes
            '/((?!api|_next/static|_next/image|favicon.ico).*)',
        ],
    }

// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export default function middleware(request: NextRequest) {
//     // This should cause a visible error if middleware runs
//     throw new Error("MIDDLEWARE IS RUNNING - FORCED ERROR TEST");
    
//     return NextResponse.next();
// }

// // No config - should run on all requests