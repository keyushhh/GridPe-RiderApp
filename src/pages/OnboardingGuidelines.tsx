import React from 'react';
import { useNavigate } from 'react-router-dom';

import cancellationIcon from '../assets/cancellation.svg';
import cashIcon from '../assets/cash.svg';
import otpIcon from '../assets/otp.svg';

const OnboardingGuidelines: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="relative h-[100dvh] w-full flex flex-col items-center bg-white font-satoshi overflow-hidden">
            {/* Glowing Orb */}
            <div
                className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[250px] h-[250px] rounded-full blur-[100px] opacity-30 pointer-events-none z-0 bg-[#5260FE]"
            />

            {/* Content Container */}
            <div className="relative z-10 w-full h-full flex flex-col items-center pt-[58px] px-4 pb-6">
                {/* Heading */}
                <h1 className="text-[22px] font-medium text-black">
                    Onboarding
                </h1>

                {/* Step Container */}
                <div className="mt-[29px] w-[362px] h-[75px] rounded-[12px] bg-white border border-[#E9EAEB] relative shrink-0">
                    <span className="absolute left-[12px] top-[15px] text-[14px] font-medium text-black">
                        Step 4/5
                    </span>
                    <span className="absolute right-[14px] top-[15px] text-[14px] font-medium text-black">
                        Guidelines
                    </span>

                    {/* Progress Bar */}
                    <div className="absolute left-[12px] bottom-[11px] w-[338px] h-[10px] bg-[#EBEBEB] rounded-full overflow-hidden">
                        <div className="h-full w-4/5 bg-[#5260FE] rounded-full" />
                    </div>
                </div>

                {/* Subheading */}
                <h2 className="mt-[14px] w-[362px] text-left text-[16px] font-bold text-black">
                    Guidelines
                </h2>
                <p className="mt-[8px] w-[362px] text-left text-[14px] font-medium text-[#616161]">
                    Please go through these very important steps to be eligble.
                </p>

                {/* Guidelines Container */}
                <div className="mt-[24px] w-[362px] h-[249px] rounded-[12px] border border-[#5260FE] bg-white relative shrink-0">

                    {/* First Guideline: OTP Verification */}
                    <div className="absolute top-[22px] left-[10px] flex">
                        <img src={otpIcon} alt="OTP Verification" className="w-[41px] h-[24px] shrink-0" />
                        <div className="ml-[9px] flex flex-col">
                            <h3 className="text-[14px] font-bold text-black leading-tight">
                                OTP Verification
                            </h3>
                            <p className="mt-[4px] text-[14px] font-medium text-[#616161] leading-tight">
                                Always verify OTP code before handing cash.
                            </p>
                        </div>
                    </div>

                    {/* Second Guideline: Cancellation */}
                    <div className="absolute top-[88px] left-[17px] flex">
                        <img src={cancellationIcon} alt="Cancellation" className="w-[24px] h-[24px] shrink-0" />
                        <div className="ml-[9px] flex flex-col">
                            <h3 className="text-[14px] font-bold text-black leading-tight">
                                Cancellation
                            </h3>
                            <p className="mt-[4px] text-[14px] font-medium text-[#616161] leading-tight">
                                Cancellations after acceptance will affect earnings.
                            </p>
                        </div>
                    </div>

                    {/* Third Guideline: Cash Settlements */}
                    <div className="absolute top-[170px] left-[17px] flex">
                        <img src={cashIcon} alt="Cash Settlements" className="w-[24px] h-[24px] shrink-0" />
                        <div className="ml-[9px] flex flex-col">
                            <h3 className="text-[14px] font-bold text-black leading-tight">
                                Cash Settlements
                            </h3>
                            <p className="mt-[4px] text-[14px] font-medium text-[#616161] leading-tight">
                                Cash settlements must be completed at hub daily.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex-1" />

                {/* Continue CTA */}
                <button
                    onClick={() => navigate('/onboarding/kyc')}
                    className="w-[362px] h-[48px] bg-[#5260FE] rounded-full flex items-center justify-center shrink-0 transition-opacity hover:opacity-90 active:scale-[0.98] mt-[226px]"
                >
                    <span className="text-white text-[16px] font-medium">I Understand & Accept</span>
                </button>
            </div>
        </div>
    );
};

export default OnboardingGuidelines;
