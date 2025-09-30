"use client";

import React from "react";
import Button from "./Button";

interface ModalProps {
    open: boolean;
    className?: string;
    onClose: () => void;
    title: string;
    submit?: () => void;
    children: React.ReactNode;
}

export default function Modal({ className, onClose, title, children}: ModalProps) {
    return <div className= {className}>
        <h1>{title}</h1>

        {children}
        <Button type="general" onClick={onClose}>Close</Button>
    </div>;
}