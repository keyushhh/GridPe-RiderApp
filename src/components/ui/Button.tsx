import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'black';
    isLoading?: boolean;
    className?: string;
    children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
    variant = 'black',
    isLoading = false,
    className = "",
    children,
    disabled,
    ...props
}) => {
    const baseStyles = "h-[52px] rounded-full flex items-center justify-center transition-all active:scale-95 shrink-0 shadow-sm font-bold font-satoshi text-[16px]";
    
    const variants = {
        primary: "bg-[#5260FE] text-white",
        secondary: "bg-[#EAEDFF] text-[#5260FE]",
        outline: "bg-transparent border border-[#EDEDED] text-black",
        black: "bg-black text-white"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className} ${(disabled || isLoading) ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
                children
            )}
        </button>
    );
};

export default Button;
