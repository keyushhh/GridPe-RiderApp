import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Check, ChevronLeft, X } from "lucide-react";

import aadharIcon from "../assets/aadhar.png";
import panIcon from "../assets/pan.png";
import voterIcon from "../assets/voter.png";
import radioNotSelected from "../assets/radio-not-selected.svg";
import radioSelected from "../assets/radio-selected.svg";

const OnboardingKYC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Default to aadhar selected initially to match other screens, or null.
    const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

    const documents = [
        { id: "aadhar", name: "Aadhar Card", icon: aadharIcon },
        { id: "pan", name: "PAN Card", icon: panIcon },
        { id: "dl", name: "Driver's License", icon: panIcon }, // User requested pan.png for DL
        { id: "voter", name: "Voter ID", icon: voterIcon },
    ];

    const requirements = [
        { text: "Original full-size, unedited document", valid: true },
        { text: "Place documents against a single-coloured background", valid: true },
        { text: "Readable, well-lit, coloured images", valid: true },
        { text: "No black and white images", valid: false },
    ];

    return (
        <div className="relative h-[100dvh] w-full flex flex-col items-center bg-white font-satoshi overflow-hidden">
            {/* Glowing Orb */}
            <div
                className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[250px] h-[250px] rounded-full blur-[100px] opacity-30 pointer-events-none z-0 bg-[#5260FE]"
            />

            {/* Header / Top Navigation inside Content Container */}
            <div className="relative z-10 w-full flex flex-col items-center pt-[58px] px-4 pb-6 h-full">

                <div className="w-full flex items-center justify-between">
                    <button
                        onClick={() => navigate('/onboarding/guidelines')}
                        className="w-10 h-10 rounded-full border border-[#E6E8EB] bg-white flex items-center justify-center transition-colors hover:bg-gray-50"
                    >
                        <ChevronLeft className="w-5 h-5 text-black" />
                    </button>
                    <h1 className="text-[22px] font-medium text-black">
                        Onboarding
                    </h1>
                    <div className="w-10" /> {/* Spacer */}
                </div>

                {/* Step Container */}
                <div className="mt-[29px] w-[362px] h-[75px] rounded-[12px] bg-white border border-[#E9EAEB] relative shrink-0">
                    <span className="absolute left-[12px] top-[15px] text-[14px] font-medium text-black">
                        Step 5/5
                    </span>
                    <span className="absolute right-[14px] top-[15px] text-[14px] font-medium text-black">
                        KYC
                    </span>

                    {/* Progress Bar */}
                    <div className="absolute left-[12px] bottom-[11px] w-[338px] h-[10px] bg-[#EBEBEB] rounded-full overflow-hidden">
                        <div className="h-full w-5/5 bg-[#5260FE] rounded-full" />
                    </div>
                </div>

                {/* Subheading */}
                <h2 className="mt-[14px] w-[362px] text-left text-[16px] font-bold text-black">
                    Choose a document
                </h2>
                <p className="mt-[8px] w-[362px] text-left text-[14px] font-medium text-[#616161]">
                    Use a valid government-issued ID for verification.
                </p>

                {/* Document Grid */}
                <div className="mt-[24px] w-[362px] grid grid-cols-2 gap-[10px] shrink-0">
                    {documents.map((doc) => {
                        const isSelected = selectedDoc === doc.id;
                        return (
                            <div
                                key={doc.id}
                                onClick={() => setSelectedDoc(doc.id)}
                                className={`w-[176px] h-[104px] rounded-[12px] border relative cursor-pointer flex-shrink-0 transition-colors ${isSelected ? 'border-[#5260FE]' : 'border-[#E9EAEB]'
                                    }`}
                            >
                                <img
                                    src={doc.icon}
                                    alt={doc.name}
                                    className="absolute top-[10px] left-[10px] w-8 h-8 object-contain"
                                />
                                <img
                                    src={isSelected ? radioSelected : radioNotSelected}
                                    alt={isSelected ? "Selected" : "Not Selected"}
                                    className="absolute top-[8px] right-[8px] w-[24px] h-[24px]"
                                />
                                <span className="absolute left-[10px] bottom-[12px] text-[14px] font-medium text-black">
                                    {doc.name}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Requirements */}
                <div className="mt-[24px] w-[362px] flex flex-col gap-[12px]">
                    {requirements.map((req, index) => (
                        <div key={index} className="flex items-start gap-[12px]">
                            <div className="mt-[2px] shrink-0">
                                {req.valid ? (
                                    <Check className="w-[16px] h-[16px] text-[#5260FE]" />
                                ) : (
                                    <X className="w-[16px] h-[16px] text-[#5260FE]" />
                                )}
                            </div>
                            <p className="text-[#616161] text-[13px] font-medium leading-snug">
                                {req.text}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="flex-1" />

                {/* Privacy Text */}
                <p className="w-[362px] text-[#616161] text-[14px] font-medium text-left mb-[16px] leading-relaxed">
                    This information is used for identity verification only, and will be kept secure by GridPe
                </p>

                {/* Continue CTA */}
                <button
                    onClick={() => navigate(`/onboarding/kyc-upload?doc=${selectedDoc}`, { state: { ...location.state, documentType: selectedDoc } })}
                    disabled={!selectedDoc}
                    className={`w-[362px] h-[48px] rounded-full flex items-center justify-center shrink-0 transition-opacity mt-auto mb-[24px] ${selectedDoc
                            ? 'bg-[#5260FE] hover:opacity-90 active:scale-[0.98] cursor-pointer'
                            : 'bg-[#AAnnnn] opacity-50 cursor-not-allowed border border-[#E9EAEB] bg-gray-200'  /* Need exact disabled color if specified, using grayscale fallback */
                        }`}
                    style={{ backgroundColor: selectedDoc ? '#5260FE' : '#EBEBEB' }}
                >
                    <span className={`text-[16px] font-medium ${selectedDoc ? 'text-white' : 'text-[#616161]'}`}>Continue</span>
                </button>
            </div>
        </div>
    );
};

export default OnboardingKYC;
