'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import type { Role } from "@prisma/client";

interface RoleGuardProps {
    allowedRoles: Role[];
    children: ReactNode;
    fallback?: ReactNode
}

export default function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "loading") return;

        if (!session) {
            router.push("/login");
            return;
        }

        if(!allowedRoles.includes(session.user.role as Role)) {
            router.push("/unauthorized");
            return;
        }
    }, [session, status, router, allowedRoles]);

    if (status === "loading") return <div>Loading...</div>;

    if (!session) {
        return <>{fallback ?? <div>Redirecting to login...</div>}</>
    }

    if (!allowedRoles.includes(session.user.role as Role)) {
        return <>{fallback ?? <div>Unauthorized</div>}</>
    }

    return <>{children}</>;
}