import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import chevronBackward from "../assets/chevron_backward.svg";
import { useAuth } from "../hooks/useAuth";

type ViewState = "initial" | "otp";

const EditEmail = () => {
    const navigate = useNavigate();
    const { email: savedEmail, updateEmail } = useAuth();
    
    // States
    const [viewState, setViewState] = useState<ViewState>("initial");
    const [emailInput, setEmailInput] = useState(savedEmail || "");
    const [isEditing, setIsEditing] = useState(!savedEmail);
    const [error, setError] = useState("");
    const [otp, setOtp] = useState(["", "", "", ""]);
    const otpRefs = [
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
    ];

    // Reset email input if savedEmail changes (e.g. on mount)
    useEffect(() => {
        if (savedEmail && !isEditing) {
            setEmailInput(savedEmail);
        }
    }, [savedEmail, isEditing]);

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleInitialSubmit = () => {
        if (!isEditing) {
            setIsEditing(true);
            return;
        }

        if (validateEmail(emailInput)) {
            setError("");
            setViewState("otp");
        } else {
            setError("please enter a valid email ID");
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) value = value.slice(-1);
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError("");

        // Move to next field
        if (value && index < 3) {
            otpRefs[index + 1].current?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            otpRefs[index - 1].current?.focus();
        }
    };

    const handleUpdate = () => {
        const otpValue = otp.join("");
        if (otpValue === "1234") {
            setError("");
            updateEmail(emailInput);
            navigate('/account-settings', { state: { activeTab: 'Personal Info' } });
        } else {
            setError("Invalid verification code. Please try 1234 for testing.");
        }
    };

    const handleCancel = () => {
        if (savedEmail) {
            setIsEditing(false);
            setEmailInput(savedEmail);
            setError("");
        } else {
            navigate('/account-settings', { state: { activeTab: 'Personal Info' } });
        }
    };

    return (
        <div className="relative w-[393px] h-screen bg-[#F5F5F5] font-satoshi flex flex-col items-center overflow-hidden">
            {/* Purple Glowing Orb */}
            <div
                className="absolute top-[-20px] left-1/2 -translate-x-1/2 w-[166px] h-[40px] rounded-full pointer-events-none z-0"
                style={{
                    backgroundColor: "#5260FE",
                    filter: "blur(60px)",
                    opacity: 0.8,
                }}
            />

            {/* Header Container */}
            <div className="flex-none flex items-center w-[362px] px-0 pt-12 pb-2 relative z-10">
                <button
                    onClick={() => {
                        if (viewState === "otp") setViewState("initial");
                        else navigate(-1);
                    }}
                    className="w-[32px] h-[32px] rounded-full bg-white shadow-sm flex items-center justify-center transition-transform active:scale-90"
                >
                    <img src={chevronBackward} alt="Back" className="w-[18px] h-[18px] brightness-0" />
                </button>

                <div className="flex-1 flex justify-center mr-[32px]">
                    <h1 className="text-black text-[22px] font-medium leading-none">
                        Account Settings
                    </h1>
                </div>
            </div>

            <div className="w-[362px] flex flex-col items-start relative z-10 h-full">
                {/* Title */}
                <h2 className="mt-[25px] text-black font-bold text-[22px] leading-tight">
                    Email ID
                </h2>

                {/* Body Text */}
                <p className="mt-[25px] text-black font-medium text-[16px] leading-[1.4] text-left">
                    {viewState === "initial" 
                        ? "You’ll use this email to receive messages, sign in and recover your account."
                        : `Enter the 4-digit code sent to you at ${emailInput}`
                    }
                </p>

                {viewState === "initial" ? (
                    <>
                        {/* Input Field: 30px below body text */}
                        <div className="mt-[30px] w-full">
                            <input
                                type="email"
                                value={emailInput}
                                disabled={!isEditing}
                                onChange={(e) => {
                                    setEmailInput(e.target.value);
                                    if (error) setError("");
                                }}
                                placeholder="Enter your email ID"
                                className={`w-full h-[48px] rounded-full bg-[#F7F8FA] border px-[18px] py-[14px] text-[14px] font-medium outline-none transition-all
                                    ${emailInput ? 'text-black' : 'text-black/50'}
                                    ${error ? 'border-[#FF3B30]' : 'border-[#E6E8EB]'}
                                    ${!isEditing ? 'opacity-70' : ''}
                                `}
                            />
                            {error && (
                                <p className="mt-[4px] text-[#FF3B30] font-medium text-[12px] leading-none text-left w-full pl-[18px]">
                                    {error}
                                </p>
                            )}
                        </div>

                        {/* Hint Text */}
                        <p className={`${error ? 'mt-[4px]' : 'mt-[8px]'} text-black/60 font-medium text-[14px] leading-none`}>
                            A verification code will be sent to this email
                        </p>

                        {/* CTAs */}
                        <div className="mt-[32px] w-full flex flex-col gap-3">
                            <button
                                onClick={handleInitialSubmit}
                                className={`w-[362px] h-[48px] rounded-full text-white font-medium text-[16px] transition-all flex items-center justify-center
                                    ${(isEditing && !emailInput) ? 'bg-[#5260FE]/30 cursor-not-allowed' : 'bg-[#5260FE] active:scale-95 shadow-[0px_4px_12px_rgba(82,96,254,0.2)]'}
                                `}
                            >
                                {!savedEmail ? "Update" : isEditing ? "Save Changes" : "Edit"}
                            </button>
                            
                            {isEditing && savedEmail && (
                                <button
                                    onClick={handleCancel}
                                    className="w-[362px] h-[48px] rounded-full bg-[#E6E8EB] text-black font-medium text-[16px] transition-all flex items-center justify-center active:scale-95"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        {/* OTP Input: 30px below body */}
                        <div className="mt-[30px] w-full flex justify-between">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={otpRefs[index]}
                                    type="text"
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className={`w-[85px] h-[68px] rounded-[12px] bg-[#F7F8FA] border flex items-center justify-center text-center text-[24px] font-medium outline-none transition-all
                                        ${digit ? 'border-[#5260FE] text-black' : 'border-[#E6E8EB] text-black/50'}
                                    `}
                                />
                            ))}
                        </div>

                        {/* Links/Errors */}
                        <div className="mt-[12px] w-full flex flex-col items-start gap-2">
                             {error && (
                                <p className="text-[#FF3B30] font-medium text-[12px] leading-none text-left w-full px-1">
                                    {error}
                                </p>
                            )}
                            <div className="w-full flex justify-between items-center px-1">
                                <button 
                                    onClick={() => setViewState("initial")}
                                    className="text-[#5260FE] font-medium text-[14px] underline"
                                >
                                    Wrong email? Fix it here.
                                </button>
                                <button className="text-[#5260FE] font-medium text-[14px] underline">
                                    Resend OTP
                                </button>
                            </div>
                        </div>

                        {/* Tip Text */}
                        <p className="mt-[18px] text-black/60 font-medium text-[14px] leading-tight text-left">
                            Tip: Make sure that you check your inbox and spam folders
                        </p>

                        {/* Update CTA */}
                        <button
                            disabled={otp.join("").length < 4}
                            onClick={handleUpdate}
                            className={`mt-[32px] w-[362px] h-[48px] rounded-full text-white font-medium text-[16px] transition-all flex items-center justify-center
                                ${otp.join("").length === 4 ? 'bg-[#5260FE] active:scale-95 shadow-[0px_4px_12px_rgba(82,96,254,0.2)]' : 'bg-[#5260FE]/30 cursor-not-allowed'}
                            `}
                        >
                            Update
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default EditEmail;
