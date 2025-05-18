'use client';

import React from "react";

interface LogoProps {
    className?: string;
    height?: number;
    width?: number;
    path?: string;
    x?: number;
    y?: number;
    alt?: string;

}

const Logo: React.FC<LogoProps> = ({
    className,
    height = 38,
    width = 180,
    path, 
    alt
}) => {
    return (
        <img
            className={className}
            src={path}
            alt={alt}
            width={width}
            height={height}
        />
    )
}

export default React.memo(Logo, (prevProps, nextProps) => {
    return prevProps.className === nextProps.className
})