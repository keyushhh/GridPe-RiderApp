import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import successCheckIcon from "../assets/success-check.svg";
import downloadIcon from "../assets/download.svg";

// Forced re-save to trigger index update
const WithdrawSuccess: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const amount = location.state?.amount || 0;
    const [timeLeft, setTimeLeft] = useState(30);

    useEffect(() => {
        if (timeLeft === 0) {
            handleRedirect();
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const handleRedirect = () => {
        navigate("/wallet", { state: { withdrawnAmount: amount }, replace: true });
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

            <div className="relative z-10 w-full h-full flex flex-col items-center">
                {/* Header */}
                <div className="flex-none flex items-center justify-center w-full px-5 pt-12 pb-2">
                    <h1 className="text-black text-[18px] font-semibold">
                        Cash Withdrawn
                    </h1>
                </div>

                {/* Success Icon */}
                <div className="w-[62px] h-[62px] shrink-0 mt-[35px] mb-[35px]">
                    <img src={successCheckIcon} alt="Success" className="w-full h-full object-contain" />
                </div>

                {/* Main Heading */}
                <div className="w-full px-4 mb-[14px]">
                    <h2 className="text-[18px] font-bold text-black text-center leading-tight px-6" style={{ letterSpacing: "-0.43px" }}>
                        Instant Cash Withdraw Successful!
                    </h2>
                </div>

                {/* Description */}
                <div className="w-[326px] mx-auto mb-[40px]">
                    <p className="text-[#616161] text-[16px] font-medium text-center leading-[1.4]" style={{ letterSpacing: "-0.43px" }}>
                        You have successfully withdrawn ₹{amount.toLocaleString()}. Here's your transaction number for future reference purposes: #GRDPE-RDR-PYOUT12345
                    </p>
                </div>

                {/* CTA Buttons */}
                <div className="w-[362px] mx-auto mt-auto mb-[40px] flex flex-col gap-[12px]">
                    <button
                        className="w-full h-[48px] rounded-full bg-black flex items-center justify-center gap-2 text-[16px] font-medium text-white transition-all active:scale-[0.98]"
                    >
                        Download Invoice
                        <img src={downloadIcon} alt="Download" className="w-[18px] h-[18px]" />
                    </button>
                    <button
                        className="w-full h-[48px] rounded-full border border-black bg-white flex items-center justify-center text-[16px] font-medium text-black transition-all active:scale-[0.98]"
                        onClick={handleRedirect}
                    >
                        Redirecting Back in {timeLeft}s...
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WithdrawSuccess;
