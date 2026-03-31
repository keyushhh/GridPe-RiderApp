import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import chevronBackward from "../assets/chevron_backward.svg";
import { getBankLogo } from "../utils/BankLogoMap";

const BankLogo = ({ bankName, className }: { bankName: string, className?: string }) => {
    const [src, setSrc] = useState<string | null>(() => getBankLogo(bankName));
    const [error, setError] = useState(false);

    const handleError = () => {
        if (src?.endsWith(".svg")) {
            setSrc(src.replace(".svg", ".png"));
        } else {
            setError(true);
        }
    };

    if (error || !src) {
        return (
            <div className={`w-full h-full bg-[#5260FE] flex items-center justify-center text-white font-bold text-[14px] ${className}`}>
                {bankName?.charAt(0) || "B"}
            </div>
        );
    }

    return (
        <img 
            src={src} 
            alt={bankName} 
            className={`w-full h-full object-contain ${className}`} 
            onError={handleError}
        />
    );
};

const AutoPayout: React.FC = () => {
    const navigate = useNavigate();
    const { riderId } = useAuth();
    const { showToast } = useToast();
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isAutoPayoutEnabled, setIsAutoPayoutEnabled] = useState(true);
    const [selectedSchedule, setSelectedSchedule] = useState("twice_monthly");
    const [minBalance, setMinBalance] = useState("0");
    const [allBankAccounts, setAllBankAccounts] = useState<any[]>([]);
    const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
    const [isEditMode, setIsEditMode] = useState(true);

    const payoutOptions = [
        { id: 'quarterly', label: "Quarterly", detail: "" },
        { id: 'monthly', label: "Monthly", detail: " (last day of each month)" },
        { id: 'twice_monthly', label: "Twice per month", detail: " (2nd and 4th Saturday of each month)" },
        { id: 'weekly', label: "Weekly", detail: " (every Monday)" }
    ];

    const fetchSettings = useCallback(async () => {
        if (!riderId) return;
        setLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('get-payout-settings', {
                body: { riderId }
            });
            if (error) throw error;

            if (data.settings) {
                setIsAutoPayoutEnabled(data.settings.auto_payout_enabled ?? true);
                setSelectedSchedule(data.settings.payout_schedule ?? "twice_monthly");
                setMinBalance(String(data.settings.minimum_balance ?? "0"));
                // Start in non-edit mode if settings exist
                if (data.settings.id) setIsEditMode(false);
            }
            
            if (data.allBankAccounts) {
                setAllBankAccounts(data.allBankAccounts);
                const primary = data.allBankAccounts.find((b: any) => b.is_primary);
                if (primary) setSelectedBankId(primary.id);
            }
        } catch (err) {
            console.error("Error fetching payout settings:", err);
            showToast("Failed to load payout settings", "error");
        } finally {
            setLoading(false);
        }
    }, [riderId, showToast]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const isBalanceInvalid = minBalance !== "" && parseInt(minBalance) > 0 && parseInt(minBalance) < 2500;

    const handleMinBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        setMinBalance(value);
    };

    const handleSave = async () => {
        if (!riderId) return;
        setSaving(true);
        try {
            const { error } = await supabase.functions.invoke('save-payout-settings', {
                body: { 
                    riderId,
                    payoutSchedule: selectedSchedule,
                    minimumBalance: parseInt(minBalance) || 0,
                    autoPayoutEnabled: isAutoPayoutEnabled,
                    primaryBankId: selectedBankId
                }
            });
            if (error) throw error;
            showToast("Payout settings saved", "success");
            navigate("/auto-payout-success");
        } catch (err) {
            console.error("Error saving payout settings:", err);
            showToast("Failed to save settings", "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="h-[100dvh] w-full flex items-center justify-center bg-[#F5F5F5]">
                <div className="w-8 h-8 border-4 border-[#5260FE] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="relative w-full h-[100dvh] bg-[#F5F5F5] font-satoshi flex flex-col items-center overflow-hidden">
            {/* Scrollable Content Area */}
            <div className="flex-1 w-full overflow-y-auto no-scrollbar flex flex-col items-center pb-[200px]">
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
                        onClick={() => navigate('/wallet')}
                        className="w-[32px] h-[32px] rounded-full bg-white shadow-sm flex items-center justify-center transition-transform active:scale-90"
                    >
                        <img src={chevronBackward} alt="Back" className="w-[18px] h-[18px] brightness-0" />
                    </button>

                    <div className="flex-1 flex justify-center mr-[32px]">
                        <h1 className="text-black text-[22px] font-medium leading-none">
                            Auto Payout
                        </h1>
                    </div>
                </div>

                {/* Preferred Payout Schedule Container */}
                <div className="mt-[29px] w-[362px] h-auto rounded-[14px] bg-white border border-[#EDEDED] relative shrink-0">
                    <div className="flex justify-between items-start pt-[15px] px-[16px]">
                        <div className="flex flex-col">
                            <h2 className="text-[16px] font-bold text-black leading-none" style={{ letterSpacing: "-0.43px" }}>
                                Preferred Payout Schedule
                            </h2>
                            <p className="mt-[7px] text-[14px] font-medium text-black/50 leading-[21px]" style={{ letterSpacing: "-0.43px" }}>
                                Earning will be released upon your<br />request.
                            </p>
                        </div>

                        {/* Toggle Switch */}
                        <div className="mt-[-1px] mr-[-1px]">
                            <button
                                onClick={() => isEditMode && setIsAutoPayoutEnabled(!isAutoPayoutEnabled)}
                                className={`relative w-[50px] h-[24px] rounded-full transition-colors duration-200 ${isAutoPayoutEnabled ? 'bg-[#34C759]' : 'bg-[#787878]/20'
                                    } ${!isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <div
                                    className={`absolute top-[2px] left-[2px] w-[20px] h-[20px] rounded-full bg-white transition-transform duration-200 ${isAutoPayoutEnabled ? 'translate-x-[26px]' : 'translate-x-0'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>

                    <div className={!isAutoPayoutEnabled ? 'opacity-50 pointer-events-none grayscale-[0.5]' : 'opacity-100'}>
                        <div
                            className="mt-[14px] w-full border-t border-dashed"
                            style={{ borderColor: "rgba(120, 120, 120, 0.2)" }}
                        />
                        
                        <div className={`mt-[14px] flex flex-col items-center gap-[7px] w-full transition-opacity duration-300 ${isAutoPayoutEnabled && isEditMode ? 'opacity-100' : 'opacity-50'
                            } ${(!isAutoPayoutEnabled || !isEditMode) ? 'pointer-events-none' : ''}`}>
                            {payoutOptions.map((option, idx) => {
                                const isSelected = selectedSchedule === option.id;
                                return (
                                    <div 
                                        key={idx}
                                        onClick={() => isEditMode && isAutoPayoutEnabled && setSelectedSchedule(option.id)}
                                        className="w-[331px] h-auto min-h-[44px] bg-[#EFEFEF] rounded-[9px] px-[7px] py-[10px] flex items-center gap-[10px] cursor-pointer transition-all active:scale-[0.98]"
                                    >
                                        <div className={`w-[18px] h-[18px] rounded-full border-[1.5px] border-[#5260FE] flex items-center justify-center shrink-0`}>
                                            {isSelected && (
                                                <div className="w-[10px] h-[10px] rounded-full bg-[#5260FE]" />
                                            )}
                                        </div>
                                        <span className="text-[14px] font-medium text-black leading-tight" style={{ letterSpacing: "-0.43px" }}>
                                            {option.label}<span className="text-black">{option.detail}</span>
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <div
                            className="mt-[18px] w-full border-t border-dashed"
                            style={{ borderColor: "rgba(120, 120, 120, 0.2)" }}
                        />

                        <div className={`mt-[18px] px-[16px] transition-opacity duration-300 ${isAutoPayoutEnabled && isEditMode ? 'opacity-100' : 'opacity-50'}`}>
                            <h3 className="text-[16px] font-bold text-black leading-tight" style={{ letterSpacing: "-0.43px" }}>
                                Release the payment only when the minimum balance is:
                            </h3>
                            
                            <div className="mt-[14px]">
                                <div className={`w-[331px] h-[48px] rounded-full bg-[#F7F8FA] border border-[#E6E8EB] flex items-center px-[12px] ${!isEditMode ? 'pointer-events-none' : ''}`}>
                                    <div className="w-[24px] h-[24px] rounded-full overflow-hidden shrink-0 flex items-center justify-center">
                                        <img 
                                            src="https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg" 
                                            alt="India" 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <span className="ml-[8px] text-[16px] font-medium text-black">INR ₹</span>
                                    <div className="ml-[10px] h-[35px] w-[1px] bg-black/10" />
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={minBalance}
                                        placeholder="0"
                                        onChange={handleMinBalanceChange}
                                        readOnly={!isEditMode}
                                        disabled={!isEditMode}
                                        className={`ml-[12px] flex-1 bg-transparent border-none outline-none text-[16px] font-medium text-black p-0 ${!isEditMode ? 'cursor-default' : ''}`}
                                        style={{ letterSpacing: "-0.43px" }}
                                    />
                                </div>
                                {isBalanceInvalid && (
                                    <p className="mt-[8px] text-[12px] font-medium text-[#FF3B30] leading-none" style={{ letterSpacing: "-0.43px" }}>
                                        Your minimum payout balance must be ₹2500
                                    </p>
                                )}
                                <div className="mt-[8px] text-[12px] font-medium text-black/40 leading-tight" style={{ letterSpacing: "-0.43px" }}>
                                    Payout will only release when wallet balance exceeds this amount
                                </div>
                                <div className="pb-[24px]" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Method Container */}
                <div className={`mt-[16px] w-[362px] h-auto rounded-[14px] bg-white border border-[#EDEDED] p-[16px] flex flex-col shrink-0 relative transition-opacity duration-300 ${isEditMode ? 'opacity-100' : 'opacity-50'}`}>
                    <h3 className="text-[16px] font-bold text-black" style={{ letterSpacing: "-0.43px" }}>
                        Payment Method
                    </h3>
                    
                    {allBankAccounts.length === 0 ? (
                        <>
                            <p className="mt-[12px] text-[14px] font-medium text-black/50 leading-tight" style={{ letterSpacing: "-0.43px" }}>
                                You have not set up your bank details yet. Set it now so that you don't miss payments directly in your bank account?
                            </p>
                            <button 
                                onClick={() => navigate("/account-settings", { state: { activeTab: "Banking" } })}
                                className="mt-[18px] w-full h-[44px] rounded-full bg-[#5260FE] text-white text-[16px] font-medium transition-transform active:scale-95 shadow-[0px_4px_12px_rgba(82,96,254,0.2)]"
                                disabled={!isEditMode}
                            >
                                Add Bank Account
                            </button>
                        </>
                    ) : (
                        <>
                            <p className="mt-[12px] text-[14px] font-medium text-black/50 leading-tight" style={{ letterSpacing: "-0.43px" }}>
                                Your auto payout will be sent to your primary bank account.
                            </p>
                            
                            <div className="mt-[15px] flex flex-col gap-[15px]">
                                {allBankAccounts.map((acc: any, index: number) => {
                                    const isSelected = selectedBankId === acc.id;
                                    const last4 = acc.account_number_masked?.slice(-4) || acc.account_number?.slice(-4) || "0960";
                                    return (
                                        <div key={acc.id} className="flex flex-col gap-[15px]">
                                            {index > 0 && <div className="w-full h-[1px] bg-[#EDEDED]" />}
                                            <div 
                                                className="flex items-center gap-[12px] cursor-pointer"
                                                onClick={() => isEditMode && setSelectedBankId(acc.id)}
                                            >
                                                <div className={`w-[20px] h-[20px] rounded-full border-[1.5px] border-[#5260FE] flex items-center justify-center shrink-0`}>
                                                    {isSelected && (
                                                        <div className="w-[12px] h-[12px] rounded-full bg-[#5260FE]" />
                                                    )}
                                                </div>
                                                <div className="flex flex-1 items-center justify-between">
                                                    <div className="flex items-center gap-[12px]">
                                                        <div className="w-[32px] h-[32px] rounded-full bg-[#F5F5F5] flex items-center justify-center shrink-0 overflow-hidden p-[6px]">
                                                            <BankLogo bankName={acc.bank_name} />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[14px] font-medium text-black" style={{ letterSpacing: "-0.43px" }}>
                                                                {acc.bank_name} - {last4}
                                                            </span>
                                                            <div className="flex items-center gap-[4px] mt-[1px]">
                                                                <div className={`w-[6px] h-[6px] rounded-full ${acc.verification_status === 'verified' ? 'bg-[#0B902B]' : 'bg-[#FF9500]'}`} />
                                                                <span className="text-[10px] font-bold text-black/40 uppercase">
                                                                    {acc.verification_status || 'Pending'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {acc.is_primary && (
                                                        <div className="h-[18px] px-[8px] rounded-full bg-[#0B902B] flex items-center justify-center">
                                                            <span className="text-white text-[10px] font-bold">Primary</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Fixed CTA Buttons Container */}
            <div className="fixed bottom-0 w-full bg-[#F5F5F5]/80 backdrop-blur-sm pt-4 pb-10 flex flex-col items-center gap-[12px] z-20">
                <button
                    onClick={() => isEditMode ? handleSave() : setIsEditMode(true)}
                    disabled={saving || (isEditMode && (allBankAccounts.length === 0 || !selectedBankId || !isAutoPayoutEnabled || isBalanceInvalid))}
                    className={`w-[362px] h-[48px] rounded-full flex items-center justify-center text-[16px] font-medium transition-all active:scale-[0.98] ${
                        (isEditMode && (allBankAccounts.length === 0 || !selectedBankId || !isAutoPayoutEnabled || isBalanceInvalid))
                            ? 'bg-black/20 text-white cursor-not-allowed'
                            : 'bg-black text-white hover:bg-black/90'
                    }`}
                    style={{ letterSpacing: "-0.43px" }}
                >
                    {saving ? "Saving..." : (isEditMode ? "Save Changes" : "Edit Payout Settings")}
                </button>

                <button
                    onClick={() => navigate('/wallet')}
                    className="w-[362px] h-[48px] rounded-full border border-black bg-white flex items-center justify-center text-[16px] font-medium text-black transition-all active:scale-[0.98] hover:bg-black/5"
                    style={{ letterSpacing: "-0.43px" }}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default AutoPayout;
