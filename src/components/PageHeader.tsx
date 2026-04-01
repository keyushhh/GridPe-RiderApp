import React from "react";
import { useNavigate } from "react-router-dom";
import chevronBackward from "../assets/chevron_backward.svg";

interface PageHeaderProps {
    title: string;
    backPath?: string;
    showBackButton?: boolean;
    onBack?: () => void;
    className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    backPath,
    showBackButton = true,
    onBack,
    className = ""
}) => {
    const navigate = useNavigate();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else if (backPath) {
            navigate(backPath);
        } else {
            navigate(-1);
        }
    };

    return (
        <div className={`flex-none flex items-center w-[362px] px-0 pt-12 pb-2 relative z-10 ${className}`}>
            {showBackButton && (
                <button
                    onClick={handleBack}
                    className="w-[32px] h-[32px] rounded-full bg-white shadow-sm flex items-center justify-center transition-transform active:scale-90"
                >
                    <img src={chevronBackward} alt="Back" className="w-[18px] h-[18px] brightness-0" />
                </button>
            )}

            <div className={`flex-1 flex justify-center ${showBackButton ? "mr-[32px]" : ""}`}>
                <h1 className="text-black text-[22px] font-medium leading-none">
                    {title}
                </h1>
            </div>
        </div>
    );
};

export default PageHeader;
