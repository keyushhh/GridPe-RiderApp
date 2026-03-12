import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import successCheckIcon from "../assets/success-check.svg";

const OnboardingKYCSuccess = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate("/onboarding/identity-info");
        }, 30000); // 30 seconds

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="relative h-[100dvh] w-full flex flex-col items-center bg-white font-satoshi overflow-hidden">
            {/* Glowing Orb */}
            <div
                className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[250px] h-[250px] rounded-full blur-[100px] opacity-30 pointer-events-none z-0 bg-[#0C7E4B]"
            />

            {/* Content Container */}
            <div className="relative z-10 w-full h-full flex flex-col pt-[58px] px-4 pb-10 overflow-y-auto items-center">
                {/* Header */}
                <div className="flex items-center justify-center w-full mb-[21px] shrink-0">
                    <h1 className="text-[22px] font-medium text-black">
                        KYC
                    </h1>
                </div>

                {/* Success Icon: 21px below heading */}
                <div className="w-[62px] h-[62px] shrink-0 mb-[35px]">
                    <img src={successCheckIcon} alt="Success" className="w-full h-full object-contain" />
                </div>

                {/* Main Heading: 35px below icon */}
                <div className="w-full px-4 mb-[14px]">
                    <h2 className="text-[18px] font-bold text-black text-center leading-tight">
                        Your KYC details has been submitted successfully!
                    </h2>
                </div>

                {/* Subheading: 14px below main heading */}
                <div className="w-[327px] mx-auto mb-[40px]">
                    <p className="text-[#616161] text-[16px] font-medium text-center leading-[1.4]">
                        Your KYC documents have been submitted successfully. Verification is in progress and usually completes within 30 minutes.
                    </p>
                </div>

                {/* CTA Button: 443px below sub-heading or pushed to bottom if 443px is too much for the screen */}
                <div className="w-[362px] mx-auto mt-auto lg:mt-[443px]">
                    <button
                        className="w-full h-[48px] rounded-full text-[16px] font-medium bg-black transition-opacity hover:opacity-90 active:scale-[0.98] text-white flex items-center justify-center cursor-pointer"
                        onClick={() => navigate("/onboarding/identity-info")}
                    >
                        You will be redirected automatically.
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnboardingKYCSuccess;
