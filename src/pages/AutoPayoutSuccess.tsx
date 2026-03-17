import React from "react";
import { useNavigate } from "react-router-dom";
import successCheckIcon from "../assets/success-check.svg";

const AutoPayoutSuccess: React.FC = () => {
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate("/earnings");
    };

    return (
        <div className="relative h-[100dvh] w-full flex flex-col items-center bg-white font-satoshi overflow-hidden">
            {/* Standardized Glowing Orb: Green */}
            <div
                className="absolute top-[-20px] left-1/2 -translate-x-1/2 w-[166px] h-[40px] rounded-full pointer-events-none z-0"
                style={{
                    backgroundColor: "#0C7E4B",
                    filter: "blur(60px)",
                    opacity: 0.8,
                }}
            />

            {/* Content Container */}
            <div className="relative z-10 w-full h-full flex flex-col items-center">
                {/* Header Container */}
                <div className="flex-none flex items-center justify-center w-full px-5 pt-12 pb-2">
                    <h1 className="text-black text-[18px] font-semibold">
                        Auto Payout
                    </h1>
                </div>

                {/* Success Icon: matching the reference layout */}
                <div className="w-[62px] h-[62px] shrink-0 mt-[35px] mb-[35px]">
                    <img src={successCheckIcon} alt="Success" className="w-full h-full object-contain" />
                </div>

                {/* Main Heading */}
                <div className="w-full px-4 mb-[14px]">
                    <h2 className="text-[18px] font-bold text-black text-center leading-tight px-6" style={{ letterSpacing: "-0.43px" }}>
                        Auto-Payout preferences updated successfully.
                    </h2>
                </div>

                {/* Subheading: 326px width as requested */}
                <div className="w-[326px] mx-auto mb-[40px]">
                    <p className="text-[#616161] text-[16px] font-medium text-center leading-[1.4]" style={{ letterSpacing: "-0.43px" }}>
                        Your payout schedule and threshold have been saved. Earnings will now be automatically transferred based on your selected schedule.
                    </p>
                </div>

                {/* CTA Button: Secondary styling (white fill, black stroke) */}
                <div className="w-[362px] mx-auto mt-auto mb-[40px]">
                    <button
                        className="w-full h-[48px] rounded-full border border-black bg-white flex items-center justify-center text-[16px] font-medium text-black transition-all active:scale-[0.98] hover:bg-black/5"
                        onClick={handleGoBack}
                        style={{ letterSpacing: "-0.43px" }}
                    >
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AutoPayoutSuccess;
