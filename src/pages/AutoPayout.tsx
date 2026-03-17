import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import chevronBackward from "../assets/chevron_backward.svg";

const AutoPayout: React.FC = () => {
    const navigate = useNavigate();
    
    // Initialize state from localStorage if available
    const [isAutoPayoutEnabled, setIsAutoPayoutEnabled] = useState(() => {
        return localStorage.getItem("auto_payout_setup") === "true";
    });
    const [selectedSchedule, setSelectedSchedule] = useState(() => {
        return localStorage.getItem("auto_payout_schedule") || "Weekly";
    });
    const [minBalance, setMinBalance] = useState(() => {
        return localStorage.getItem("auto_payout_min_balance") || "0";
    });

    const [isEditMode, setIsEditMode] = useState(() => {
        return localStorage.getItem("auto_payout_setup") !== "true";
    });

    const payoutOptions = [
        { label: "Quarterly", detail: "" },
        { label: "Monthly", detail: " (last day of each month)" },
        { label: "Twice per month", detail: " (2nd and 4th Saturday of each month)" },
        { label: "Weekly", detail: " (every Monday)" }
    ];

    const isBalanceInvalid = minBalance !== "" && parseInt(minBalance) < 2500;

    const handleMinBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        setMinBalance(value);
    };

    const handleSave = () => {
        localStorage.setItem("auto_payout_setup", "true");
        localStorage.setItem("auto_payout_schedule", selectedSchedule);
        localStorage.setItem("auto_payout_min_balance", minBalance);
        navigate("/auto-payout-success");
    };

    return (
        <div className="relative w-[393px] h-screen bg-[#F5F5F5] font-satoshi flex flex-col items-center overflow-hidden">
            {/* Scrollable Content Area */}
            <div className="flex-1 w-full overflow-y-auto no-scrollbar flex flex-col items-center pb-[120px]">
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
                        onClick={() => navigate(-1)}
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

                {/* Preferred Payout Schedule Container: 29px below header */}
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

                        {/* Toggle Switch: 14px from top, 15px from right */}
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
                        {/* Horizontal Divider: 14px below body text */}
                        <div
                            className="mt-[14px] w-full border-t border-dashed"
                            style={{ borderColor: "rgba(120, 120, 120, 0.2)" }}
                        />
                        
                        {/* Payout Options List: 14px below divider */}
                        <div className={`mt-[14px] flex flex-col items-center gap-[7px] w-full transition-opacity duration-300 ${isAutoPayoutEnabled && isEditMode ? 'opacity-100' : 'opacity-50'
                            } ${(!isAutoPayoutEnabled || !isEditMode) ? 'pointer-events-none' : ''}`}>
                            {payoutOptions.map((option, idx) => {
                                const isSelected = selectedSchedule === option.label;
                                return (
                                    <div 
                                        key={idx}
                                        onClick={() => isEditMode && isAutoPayoutEnabled && setSelectedSchedule(option.label)}
                                        className="w-[331px] h-auto min-h-[44px] bg-[#EFEFEF] rounded-[9px] px-[7px] py-[10px] flex items-center gap-[10px] cursor-pointer transition-all active:scale-[0.98]"
                                    >
                                        {/* Radio Icon */}
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

                        {/* Second Divider: 18px below the list */}
                        <div
                            className="mt-[18px] w-full border-t border-dashed"
                            style={{ borderColor: "rgba(120, 120, 120, 0.2)" }}
                        />

                    <div className={`mt-[18px] transition-opacity duration-300 ${isAutoPayoutEnabled && isEditMode ? 'opacity-100' : 'opacity-50'}`}>
                    {/* Minimum Balance Section */}
                    <div className="mt-[18px] px-[16px]">
                        <h3 className="text-[16px] font-bold text-black" style={{ letterSpacing: "-0.43px" }}>
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
                                <div className="ml-[10px] h-[35px] w-[1px] bg-black/16" />
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={minBalance}
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
                            
                            {/* Bottom Padding for the container: 24px below input field */}
                            <div className="pb-[24px]" />
                        </div>
                    </div>
                    </div>
                </div>
            </div>

                {/* Action CTAs: 104px below the main container */}
                <div className="mt-[104px] flex flex-col gap-[12px] items-center w-full">
                    <button
                        onClick={() => isEditMode ? handleSave() : setIsEditMode(true)}
                        disabled={isEditMode && (!isAutoPayoutEnabled || !selectedSchedule || minBalance.length === 0 || isBalanceInvalid)}
                        className={`w-[362px] h-[48px] rounded-full flex items-center justify-center text-[16px] font-medium transition-all active:scale-[0.98] ${
                            (isEditMode && (!isAutoPayoutEnabled || !selectedSchedule || minBalance.length === 0 || isBalanceInvalid))
                                ? 'bg-black/20 text-white cursor-not-allowed'
                                : 'bg-black text-white hover:bg-black/90'
                        }`}
                        style={{ letterSpacing: "-0.43px" }}
                    >
                        {isEditMode ? "Save Changes" : "Edit Payout Settings"}
                    </button>

                    <button
                        onClick={() => navigate(-1)}
                        className="w-[362px] h-[48px] rounded-full border border-black bg-white flex items-center justify-center text-[16px] font-medium text-black transition-all active:scale-[0.98] hover:bg-black/5"
                        style={{ letterSpacing: "-0.43px" }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AutoPayout;
