import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import checkboxOutline from "../assets/checkbox-outline.svg";
import checkboxSelected from "../assets/checkbox-selected.svg";
import { format } from "date-fns";

const OnboardingKYCReview = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [agreed, setAgreed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { images, documentNumber, fullName, dob, documentType, selfie } = location.state || {};

    const documentLabels: Record<string, string> = {
        aadhar: "Aadhar Card",
        voter: "Voter ID",
        dl: "Driver's License",
        pan: "PAN Card"
    };

    const maskIdNumber = (num: string) => {
        if (!num) return "N/A";
        const cleanNum = num.replace(/\s/g, "");
        if (cleanNum.length >= 10) return `${cleanNum.slice(0, 4)} XXXX ${cleanNum.slice(-4)}`;
        return cleanNum;
    };
    const getLastFour = (num: string) => num ? num.replace(/\s/g, "").slice(-4) : "";

    const handleConfirm = async () => {
        setIsSubmitting(true);
        // Simulate submission flow
        setTimeout(() => {
            setIsSubmitting(false);
            navigate("/onboarding/kyc-success");
        }, 1500)
    };

    return (
        <div className="relative h-[100dvh] w-full flex flex-col items-center bg-white font-satoshi overflow-hidden">
            {/* Standardized Glowing Orb: Blue */}
            <div
                className="absolute top-[-20px] left-1/2 -translate-x-1/2 w-[166px] h-[40px] rounded-full pointer-events-none z-0"
                style={{
                    backgroundColor: "#5260FE",
                    filter: "blur(60px)",
                    opacity: 0.8,
                }}
            />

            {/* Content Container */}
            <div className="relative z-10 w-full h-full flex flex-col pb-6 overflow-y-auto">
                {/* Header Container */}
                <div className="flex-none flex items-center justify-between px-5 pt-12 pb-2 relative z-10">
                    {/* Back Button */}
                    <button 
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full border border-[#E6E8EB] bg-white flex items-center justify-center transition-colors hover:bg-gray-50"
                    >
                        <ChevronLeft className="w-5 h-5 text-black" />
                    </button>
                    {/* Page Title */}
                    <h1 className="text-black text-[18px] font-semibold">
                        Onboarding
                    </h1>
                    {/* Spacer (to keep Title centered) */}
                    <div className="w-10" /> 
                </div>

                {/* Step Container */}
                <div className="w-[362px] h-[75px] rounded-[12px] bg-white border border-[#E9EAEB] relative shrink-0 mx-auto">
                    <span className="absolute left-[12px] top-[15px] text-[14px] font-medium text-black">
                        Step 4/4
                    </span>
                    <span className="absolute right-[14px] top-[15px] text-[14px] font-medium text-black">
                        Review
                    </span>

                    {/* Progress Bar */}
                    <div className="absolute left-[12px] bottom-[11px] w-[338px] h-[10px] bg-[#EBEBEB] rounded-full overflow-hidden">
                        <div className="h-full w-full bg-[#5260FE] rounded-full" />
                    </div>
                </div>

                <div className="w-[362px] mx-auto mt-[14px] mb-[16px] shrink-0">
                    <h2 className="font-bold text-[16px] text-black">Review & Submit</h2>
                    <p className="mt-[8px] font-medium text-[14px] text-[#616161] leading-snug">
                        Please review your uploaded details and documents before submitting.
                    </p>
                </div>

                {/* Info Card Block */}
                <div className="w-[362px] mx-auto rounded-[13px] bg-white border border-[#E9EAEB] shrink-0">
                    <div className="pt-[17px] px-4">
                        <h3 className="font-bold text-[16px] text-black">Your KYC Details</h3>
                        <p className="font-normal text-[14px] text-[#A0A0A0] mt-1">Please check all the documents before submitting</p>
                    </div>

                    <div className="mx-auto mt-2.5 h-[1px] w-[330px] bg-[#E6E8EB]" />

                    <div className="px-4 mt-6 space-y-4 pb-4">
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col gap-1">
                                <span className="font-medium text-[12px] text-[#616161]">ID Document</span>
                                <span className="font-medium text-[14px] text-black">{documentLabels[documentType] || "N/A"} ending {getLastFour(documentNumber)}</span>
                            </div>
                            <div className="flex gap-2">
                                {images?.front && <div className="w-[38px] h-[38px] rounded-[6px] border border-[#E9EAEB] overflow-hidden"><img src={images.front} alt="Front" className="w-full h-full object-cover" /></div>}
                                {images?.back && <div className="w-[38px] h-[38px] rounded-[6px] border border-[#E9EAEB] overflow-hidden"><img src={images.back} alt="Back" className="w-full h-full object-cover" /></div>}
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <span className="font-medium text-[12px] text-[#616161]">ID Number</span>
                            <span className="font-medium text-[14px] text-black">{maskIdNumber(documentNumber)}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="font-medium text-[12px] text-[#616161]">Full Name</span>
                            <span className="font-medium text-[14px] text-black">{fullName || "N/A"}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="font-medium text-[12px] text-[#616161]">Date of Birth</span>
                            <span className="font-medium text-[14px] text-black">{dob ? format(new Date(dob), "dd MMM yyyy") : "N/A"}</span>
                        </div>
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col gap-1">
                                <span className="font-medium text-[12px] text-[#616161]">Selfie Verification</span>
                                <span className="font-medium text-[14px] text-black">Selfie Verified</span>
                            </div>
                            <div>
                                {selfie && <div className="w-[38px] h-[38px] rounded-[6px] border border-[#E9EAEB] overflow-hidden"><img src={selfie} alt="Selfie" className="w-full h-full object-cover" /></div>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-[362px] mx-auto mt-[30px] flex items-start gap-3 shrink-0 cursor-pointer" onClick={() => setAgreed(!agreed)}>
                    {agreed ? (
                        <img src={checkboxSelected} alt="Checked" className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    ) : (
                        <img src={checkboxOutline} alt="Unchecked" className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    )}
                    <label className="text-black text-[14px] font-medium leading-relaxed cursor-pointer pointer-events-none">
                        I agree, all information provided are correct and accurate to best of my knowledge.
                    </label>
                </div>

                {/* Continue CTA */}
                <div className="w-[362px] mx-auto mt-auto mt-[40px] shrink-0">
                    <button
                        disabled={!agreed || isSubmitting}
                        className={`w-[362px] h-[48px] rounded-full text-[16px] font-medium transition-opacity flex items-center justify-center
                            ${agreed && !isSubmitting
                                ? 'bg-[#5260FE] hover:opacity-90 active:scale-[0.98] text-white'
                                : 'bg-[#EBEBEB] text-[#A0A0A0] cursor-not-allowed border border-[#E9EAEB]'
                            }`}
                        onClick={handleConfirm}
                    >
                        {isSubmitting ? "Submitting..." : "Submit KYC"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnboardingKYCReview;
