import React from "react";

interface LoadingSpinnerProps {
    size?: string | number;
    color?: string;
    className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = "32px",
    color = "#5260FE",
    className = ""
}) => {
    return (
        <div 
            className={`border-4 border-t-transparent rounded-full animate-spin ${className}`}
            style={{ 
                width: typeof size === "number" ? `${size}px` : size, 
                height: typeof size === "number" ? `${size}px` : size,
                borderColor: `${color} transparent transparent ${color}`
            }} 
        />
    );
};

export default LoadingSpinner;
