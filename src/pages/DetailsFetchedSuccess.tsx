import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import successCheckIcon from '../assets/success-check.svg';

const DetailsFetchedSuccess: React.FC = () => {
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState(30);

    useEffect(() => {
        if (timeLeft <= 0) {
            navigate('/onboarding/step-2');
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, navigate]);

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
            <div className="relative z-10 w-full h-full flex flex-col items-center pt-12 px-4 pb-10">
                {/* Header */}
                <h1 className="text-[18px] font-semibold text-black mb-[35px]">
                    Details Fetched
                </h1>

                {/* Success Icon */}
                <div className="w-[62px] h-[62px] mb-[35px] flex items-center justify-center">
                    <img src={successCheckIcon} alt="Success" className="w-full h-full object-contain" />
                </div>

                {/* Main Heading */}
                <h2 className="text-[18px] font-bold text-black text-center leading-tight mb-[14px] px-4">
                    Your vehicle details has been fetched successfully
                </h2>

                {/* Subheading */}
                <p className="text-[#616161] text-[16px] font-medium text-center leading-[1.4] max-w-[327px] mb-[40px]">
                    We have successfully fetched your registration details from the database. You're one step closer to getting on the road.
                </p>

                <div className="flex-1" />

                {/* CTA Button */}
                <button
                    onClick={() => navigate('/onboarding/step-2')}
                    className="w-[362px] h-[48px] rounded-full bg-black text-white text-[16px] font-medium transition-opacity hover:opacity-90 active:scale-[0.98] flex items-center justify-center"
                >
                    Continuing in {timeLeft}s...
                </button>
            </div>
        </div>
    );
};

export default DetailsFetchedSuccess;
