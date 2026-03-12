import { useNavigate } from "react-router-dom";
import faceIdIcon from "../assets/face-id.svg";

const IdentityVerificationInfo = () => {
    const navigate = useNavigate();

    return (
        <div className="relative h-[100dvh] w-full flex flex-col items-center bg-white font-satoshi overflow-hidden">
            {/* Standardized Glowing Orb: Purple */}
            <div
                className="absolute top-[-20px] left-1/2 -translate-x-1/2 w-[166px] h-[40px] rounded-full pointer-events-none z-0"
                style={{
                    backgroundColor: "#5260FE",
                    filter: "blur(60px)",
                    opacity: 0.8,
                }}
            />

            {/* Content Container */}
            <div className="relative z-10 w-full h-full flex flex-col pb-10 overflow-y-auto items-center">
                {/* Header Container */}
                <div className="flex-none flex items-center justify-center w-full px-5 pt-12 pb-2 relative z-10">
                    <h1 className="text-black text-[18px] font-semibold">
                        Identity Verification Required
                    </h1>
                </div>

                {/* Icon: 15px below heading */}
                <div className="w-[66px] h-[66px] shrink-0 mb-[15px]">
                    <img src={faceIdIcon} alt="Identity Verification" className="w-full h-full object-contain" />
                </div>

                {/* Container: 15px below icon */}
                <div className="w-[362px] h-auto min-h-[309px] rounded-[12px] border border-[#E9EAEB] bg-white p-[17px] pl-4 shrink-0 mx-auto">
                    <h2 className="text-[16px] font-bold text-black mb-[4px]">
                        Identity Verification
                    </h2>
                    <p className="text-[14px] font-medium text-[#616161] leading-[1.4] mb-[15px]">
                        For safety and to prevent impersonation, Grid.pe verifies your identity before cash handovers.
                    </p>

                    {/* Divider: 15px below subheading, 338px width, centered */}
                    <div className="w-[330px] h-[1px] bg-[#E6E8EB] mx-auto mb-[19px]" />

                    {/* Body Text 1: 19px below divider */}
                    <div className="mb-[24px]">
                        <p className="text-[14px] font-medium text-[#616161] mb-2">
                            We’ll verify your face at these steps:
                        </p>
                        <ul className="list-none space-y-1">
                            {["Before OTP entry at the customer’s doorstep", "Before handing over cash", "If suspicious activity is detected"].map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                    <span className="w-1 h-1 rounded-full bg-[#616161] mt-2 shrink-0" />
                                    <span className="text-[14px] font-medium text-[#616161] leading-[1.23]">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Body Text 2: 24px below first body text */}
                    <div>
                        <p className="text-[14px] font-medium text-[#616161] mb-2">
                            Why is this required?
                        </p>
                        <ul className="list-none space-y-1">
                            {["Prevents rider substitution", "Protects your earnings", "Ensures customer trust", "Strengthens overall platform security"].map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                    <span className="w-1 h-1 rounded-full bg-[#616161] mt-2 shrink-0" />
                                    <span className="text-[14px] font-medium text-[#616161] leading-[1.23]">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Security Disclaimer: 10px below container, 272px width */}
                <div className="w-[362px] mx-auto mt-[10px] items-start flex">
                  <p className="text-[12px] font-medium text-black text-left w-[272px] leading-snug">
                    Your face scan is matched securely with your KYC. <br />
                    No raw images are stored.
                  </p>
                </div>

                {/* Purple CTA: 220px below disclaimer (using mt-auto to ensure it stays at bottom if content grows) */}
                <div className="w-[362px] mx-auto mt-auto lg:mt-[220px]">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="w-full h-[48px] rounded-full text-[16px] font-medium bg-[#5260FE] transition-opacity hover:opacity-90 active:scale-[0.98] text-white flex items-center justify-center cursor-pointer"
                    >
                        Got it, Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IdentityVerificationInfo;
