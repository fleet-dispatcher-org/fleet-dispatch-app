"use client";

import React from "react";

interface DashboardItemProps {
    href: string[];
    title: string[];
    gap?: number;
    mt?: number;
    ml?: number;
    children?: React.ReactNode;
}

export default function DashboardItem({ href, children , title, gap}: DashboardItemProps) {
    
    return (
    <div className={`flex flex-row gap-${gap} mt-2`}>
      {href.map((link, i) => (
        <a className="hover:underline" key={link} href={link}>
          {title ? title[i] : children}
        </a>
      ))}
    </div>
  );
}