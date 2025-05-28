"use client";

import React from "react";
import { Button } from "./Button";
import { title } from "process";

interface ModalProps {
    open: boolean;
    className?: string;
    onClose: () => void;
    title: string;
    submit?: () => void;
    children: React.ReactNode;
}

export default function Modal({open, className, onClose, title, submit, children}: ModalProps) {
    return <div className= {className}>
        <h1>{title}</h1>

        {children}
        <Button type="general" onClick={onClose}>Close</Button>
    </div>;
}