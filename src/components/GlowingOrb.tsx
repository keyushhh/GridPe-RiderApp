import React from "react";

interface GlowingOrbProps {
    color?: string;
    top?: string | number;
    left?: string | number;
    width?: string | number;
    height?: string | number;
    blur?: string | number;
    opacity?: number;
    className?: string;
}

const GlowingOrb: React.FC<GlowingOrbProps> = ({
    color = "#5260FE",
    top = "-20px",
    left = "50%",
    width = "166px",
    height = "40px",
    blur = "60px",
    opacity = 0.8,
    className = ""
}) => {
    return (
        <div
            className={`absolute -translate-x-1/2 rounded-full pointer-events-none z-0 ${className}`}
            style={{
                backgroundColor: color,
                top: typeof top === "number" ? `${top}px` : top,
                left: typeof left === "number" ? `${left}px` : left,
                width: typeof width === "number" ? `${width}px` : width,
                height: typeof height === "number" ? `${height}px` : height,
                filter: `blur(${typeof blur === "number" ? `${blur}px` : blur})`,
                opacity: opacity,
            }}
        />
    );
};

export default GlowingOrb;
