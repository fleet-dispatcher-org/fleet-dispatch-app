"use client";
import { useEffect } from "react";

export default function Admin() {
    useEffect(() => {
        document.title = "Admin Home";
    })
    return <div>Admin</div>;
}