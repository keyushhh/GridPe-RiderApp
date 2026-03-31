import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import successCheckIcon from "../assets/success-check.svg";

const OrderDelivered = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [timeLeft, setTimeLeft] = useState(30);

    // Get real earnings data from route state
    const { earnings = 0, tip = 0, totalEarned = 0 } = location.state || {};

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate("/dashboard", { state: { orderCompleted: true } });
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate]);

    const handleManualRedirect = () => {
        navigate("/dashboard", { state: { orderCompleted: true } });
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
            <div className="relative z-10 w-full h-full flex flex-col pb-10 overflow-y-auto items-center">
                {/* Header Container */}
                <div className="flex-none flex items-center justify-center w-full px-5 pt-12 pb-2 relative z-10">
                    <h1 className="text-black text-[18px] font-semibold">
                        Order Delivered
                    </h1>
                </div>

                {/* Success Icon: 35px below heading */}
                <div className="w-[62px] h-[62px] shrink-0 mt-[35px] mb-[35px]">
                    <img src={successCheckIcon} alt="Success" className="w-full h-full object-contain" />
                </div>

                {/* Main Heading: 14px below icon */}
                <div className="w-full px-4 mb-[14px]">
                    <h2 className="text-[18px] font-bold text-black text-center leading-tight">
                        Delivery confirmed successfully
                    </h2>
                </div>

                {/* Subheading: 20px below main heading */}
                <div className="w-[327px] mx-auto mb-[20px] flex flex-col items-center">
                    <p className="text-[#616161] text-[16px] font-medium text-center leading-[1.4]">
                        Great job! The order was delivered on time.
                    </p>
                    
                    <div className="mt-8 w-full flex flex-col gap-3">
                        <div className="flex justify-between items-center w-full px-4">
                            <span className="text-black/50 text-[14px] font-medium">Order Earnings:</span>
                            <span className="text-black text-[14px] font-bold font-satoshi">INR {earnings}</span>
                        </div>
                        {tip > 0 && (
                            <div className="flex justify-between items-center w-full px-4 text-[#0C7E4B]">
                                <span className="text-[14px] font-medium">Customer Tip:</span>
                                <span className="text-[14px] font-bold font-satoshi">+INR {tip}</span>
                            </div>
                        )}
                        <div className="mt-2 pt-4 border-t border-[#EDEDED] flex justify-between items-center w-full px-4">
                            <span className="text-black text-[16px] font-bold">Total Earned:</span>
                            <span className="text-black text-[16px] font-bold font-satoshi">INR {totalEarned}</span>
                        </div>
                    </div>
                </div>

                {/* CTA Button: mt-auto to push to bottom */}
                <div className="w-[362px] mx-auto mt-auto mb-10">
                    <button
                        className="w-full h-[48px] rounded-full text-[16px] font-medium bg-black transition-opacity hover:opacity-90 active:scale-[0.98] text-white flex items-center justify-center cursor-pointer"
                        onClick={handleManualRedirect}
                    >
                        Redirecting Home in {timeLeft}s..
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDelivered;
