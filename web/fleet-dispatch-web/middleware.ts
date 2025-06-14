import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./auth";

const protectedRoutes = ["/driver", "/truck", "/dispatcher"];

export default async function middleware(request: NextRequest) {
        const session = await auth();

        const {pathname} = request.nextUrl;

        const isProtected = protectedRoutes.some((route) =>
            request.nextUrl.pathname.startsWith(route)
        );

        if (isProtected && !session) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        return NextResponse.next();
    }