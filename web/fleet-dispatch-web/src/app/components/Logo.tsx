'use client';

import React from "react";

interface LogoProps {
    className?: string;
    height?: number;
    width?: number;
    path?: string;
    alt?: string;
    reroute?: string

}

const Logo: React.FC<LogoProps> = ({
    className,
    height,
    width,
    path, 
    alt,
    reroute
}) => {
    return (
        <a href={reroute}>
        <img
            className={className}
            src={path}
            alt={alt}
            width={width}
            height={height}
        />
        </a>
    )
}

export default React.memo(Logo, (prevProps, nextProps) => {
    return prevProps.className === nextProps.className
})