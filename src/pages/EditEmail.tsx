import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import chevronBackward from "../assets/chevron_backward.svg";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import { supabase } from "../lib/supabase";

const EditEmail = () => {
    const navigate = useNavigate();
    const { email: savedEmail, pendingEmail, refreshProfile } = useAuth();
    const { showToast } = useToast();
    
    // States
    const [emailInput, setEmailInput] = useState(savedEmail || "");
    const [isEditing, setIsEditing] = useState(!savedEmail);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset email input if savedEmail changes (e.g. on mount)
    useEffect(() => {
        if (savedEmail && !isEditing) {
            setEmailInput(savedEmail);
        }
    }, [savedEmail, isEditing]);

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleInitialSubmit = async () => {
        if (!isEditing) {
            setIsEditing(true);
            return;
        }

        if (validateEmail(emailInput)) {
            setError("");
            setIsSubmitting(true);
            try {
                // Update the email using Supabase Auth
                const { error, data } = await supabase.auth.updateUser({ email: emailInput });
                
                if (error) throw error;
                
                // Call refreshProfile to fetch the new_email state
                await refreshProfile();
                
                showToast("Verification link sent! Please check your new email inbox.", "success");
                navigate('/account-settings', { state: { activeTab: 'Personal Info' } });
            } catch (err: any) {
                if (err.message?.includes('already registered') || err.message?.includes('already taken')) {
                    setError("This email is already registered with another rider.");
                } else {
                    setError(err.message || "Failed to update email.");
                }
            } finally {
                setIsSubmitting(false);
            }
        } else {
            setError("please enter a valid email ID");
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
                        navigate('/account-settings', { state: { activeTab: 'Personal Info' } });
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
                    You’ll use this email to receive messages, sign in and recover your account.
                </p>

                {pendingEmail && !isEditing && (
                    <div className="mt-[16px] w-[362px] p-[12px] rounded-[12px] bg-[#FFF8E6] border border-[#FFE7A0] flex items-start gap-3">
                        <div className="text-[20px] leading-none">✉️</div>
                        <div className="flex flex-col">
                            <span className="text-[#B38300] font-bold text-[14px]">Verification Pending</span>
                            <span className="mt-[4px] text-[#B38300] font-medium text-[12px] leading-tight">
                                We sent a verification link to {pendingEmail}. Please check your inbox or click 'Edit' to change it.
                            </span>
                        </div>
                    </div>
                )}

                {/* Input Field: 30px below body text */}
                <div className={`${pendingEmail && !isEditing ? 'mt-[20px]' : 'mt-[30px]'} w-full`}>
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
                        disabled={isSubmitting || (isEditing && !emailInput)}
                        className={`w-[362px] h-[48px] rounded-full text-white font-medium text-[16px] transition-all flex items-center justify-center
                            ${(isEditing && (!emailInput || isSubmitting)) ? 'bg-[#5260FE]/30 cursor-not-allowed' : 'bg-[#5260FE] active:scale-95 shadow-[0px_4px_12px_rgba(82,96,254,0.2)]'}
                        `}
                    >
                        {isSubmitting ? (
                            <div className="w-[18px] h-[18px] border-[2px] border-white border-t-transparent rounded-full animate-spin" />
                        ) : !savedEmail ? (
                            "Update"
                        ) : isEditing ? (
                            "Save Changes"
                        ) : (
                            "Edit"
                        )}
                    </button>
                    
                    {isEditing && (savedEmail || pendingEmail) && (
                        <button
                            onClick={handleCancel}
                            disabled={isSubmitting}
                            className={`w-[362px] h-[48px] rounded-full bg-[#E6E8EB] text-black font-medium text-[16px] transition-all flex items-center justify-center ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
                        >
                            Cancel
                        </button>
                    )}
                    
                    {pendingEmail && !isEditing && (
                         <button
                            onClick={async () => {
                                setIsSubmitting(true);
                                try {
                                    await supabase.auth.updateUser({ email: pendingEmail });
                                    showToast("Verification link resent! Check your inbox.", "success");
                                } catch (e: any) {
                                    setError("Failed to resend. Please try again.");
                                } finally {
                                    setIsSubmitting(false);
                                }
                            }}
                            disabled={isSubmitting}
                            className={`w-[362px] h-[48px] rounded-full border border-[#E6E8EB] bg-white text-black font-medium text-[16px] transition-all flex items-center justify-center ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
                        >
                            {isSubmitting ? "Resending..." : "Resend Verification Link"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditEmail;
