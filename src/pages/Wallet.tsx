import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import chevronBackward from "../assets/chevron_backward.svg";
import chevronForward from "../assets/chevron_forward.svg";
import awaiting from "../assets/awaiting.svg";
import verifiedBadge from "../assets/verified-badge.svg";
import errorIcon from "../assets/error.svg";
import { getBankLogo } from "../utils/BankLogoMap";
import WithdrawBottomSheet from "../components/WithdrawBottomSheet";
import TroubleshootBottomSheet from "../components/TroubleshootBottomSheet";
import { useTransactions } from "../hooks/useTransactions";

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

const Wallet = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const amount = location.state?.amount || 22750;

    const [isAutoPayoutSetup, setIsAutoPayoutSetup] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState("");
    const [bankAccount, setBankAccount] = useState<any>(null);
    const [isWithdrawSheetOpen, setIsWithdrawSheetOpen] = useState(false);
    const [isTroubleshootSheetOpen, setIsTroubleshootSheetOpen] = useState(false);
    const [currentAmount, setCurrentAmount] = useState(amount);
    const [payoutStatus, setPayoutStatus] = useState<"none" | "processing" | "completed" | "failed">("none");
    const [payoutAmount, setPayoutAmount] = useState(0);
    const [payoutDate, setPayoutDate] = useState("");
    const transactions = useTransactions();

    const handleWithdrawConfirm = (withdrawAmount: number) => {
        // No longer handles deduction here directly, as we navigate to Success page
        // The deduction happens upon return to the wallet page as per requirements
        setIsWithdrawSheetOpen(false);
    };

    useEffect(() => {
        const setup = localStorage.getItem("auto_payout_setup") === "true";
        setIsAutoPayoutSetup(setup);
        
        if (setup) {
            setSelectedSchedule(localStorage.getItem("auto_payout_schedule") || "Weekly");
            const accounts = JSON.parse(localStorage.getItem("rider_bank_accounts") || "[]");
            if (accounts.length > 0) {
                setBankAccount(accounts[0]);
            }
        }

        // Handle return from WithdrawSuccess
        if (location.state?.withdrawnAmount && payoutStatus === "none") {
            const amount = location.state.withdrawnAmount;
            setCurrentAmount((prev: number) => Math.max(0, prev - amount));
            setPayoutAmount(amount);
            // Simulate initial failure for testing purposes
            setPayoutStatus("failed");
            
            const now = new Date();
            const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
            setPayoutDate(dateStr);

            // Clear state to avoid re-triggering on future navigations
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    // Separate effect for the simulation timer
    useEffect(() => {
        if (payoutStatus === "processing") {
            const timer = setTimeout(() => {
                setPayoutStatus("completed");
            }, 35000); // 35 seconds
            
            return () => clearTimeout(timer);
        }
    }, [payoutStatus]);

    const last4 = bankAccount?.accountNumber ? bankAccount.accountNumber.slice(-4) : "4242";

    return (
        <div className="relative w-full h-[100dvh] bg-[#F5F5F5] font-satoshi flex flex-col items-center overflow-hidden">
            {/* Scrollable Content Area */}
            <div className="flex-1 w-full overflow-y-auto no-scrollbar flex flex-col items-center">
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
                            Wallet
                        </h1>
                    </div>
                </div>

                {/* Balance Card: 29px below header */}
                <div className="mt-[29px] w-[362px] h-auto rounded-[14px] bg-white border border-[#EDEDED] p-[12px] flex flex-col shrink-0 relative">
                    <span className="text-[16px] font-bold text-black" style={{ letterSpacing: "-0.43px" }}>
                        Balance
                    </span>
                    
                    <div 
                        className="mt-[13px] flex justify-between items-center cursor-pointer"
                        onClick={() => navigate('/history')}
                    >
                        <span className="text-[32px] font-bold text-black leading-none">
                            ₹{currentAmount.toLocaleString()}
                        </span>
                        <img src={chevronForward} alt="Details" className="w-[18px] h-[18px] brightness-0 transition-transform active:scale-90" />
                    </div>

                    <span className="mt-[13px] text-[14px] font-medium text-[#5260FE]" style={{ letterSpacing: "-0.43px" }}>
                        Payout scheduled: 19 Mar
                    </span>

                    <button 
                        onClick={() => setIsWithdrawSheetOpen(true)}
                        disabled={payoutStatus === "processing"}
                        className={`mt-[18px] w-full h-[44px] rounded-full text-white text-[16px] font-medium transition-transform active:scale-95 ${
                            payoutStatus === "processing" ? "bg-[#DFDFDF] cursor-not-allowed" : "bg-[#5260FE]"
                        }`}
                    >
                        Need Money Now?
                    </button>
                </div>

                {/* Payout Activity Card: 16px below */}
                <div className="mt-[16px] w-[362px] h-auto rounded-[14px] bg-white border border-[#EDEDED] p-[12px] flex flex-col shrink-0">
                    <div className="flex justify-between items-center w-full">
                        <h2 className="text-[18px] font-bold text-black" style={{ letterSpacing: "-0.43px" }}>
                            Payout Activity
                        </h2>
                        {transactions.length > 0 && (
                            <button 
                                onClick={() => navigate('/history')}
                                className="text-[14px] font-medium text-[#5260FE] cursor-pointer hover:underline transition-all"
                                style={{ letterSpacing: "-0.43px" }}
                            >
                                View all activity
                            </button>
                        )}
                    </div>

                    {payoutStatus === "none" ? (
                        <p className="mt-[13px] text-[14px] font-medium text-black/50" style={{ letterSpacing: "-0.43px" }}>
                            No payout occured in the last 2 weeks
                        </p>
                    ) : payoutStatus === "failed" ? (
                        <div className="mt-[13px] flex flex-col">
                            <div className="flex items-center gap-[12px]">
                                <img src={errorIcon} alt="Error" className="w-[24px] h-[24px] shrink-0 ml-[-6px]" />
                                <span className="text-[14px] font-bold text-black" style={{ letterSpacing: "-0.43px" }}>
                                    Weekly Payout (06 Mar - 12 Mar) Failed
                                </span>
                            </div>
                            <span className="text-[14px] font-medium text-black ml-[30px] mt-[4px]" style={{ letterSpacing: "-0.43px" }}>
                                Amount: ₹24,000
                            </span>
                            <button 
                                onClick={() => setIsTroubleshootSheetOpen(true)}
                                className="mt-[16px] w-full h-[48px] rounded-full bg-[#5260FE] text-white text-[16px] font-medium transition-transform active:scale-95 shadow-[0px_4px_12px_rgba(82,96,254,0.2)]"
                            >
                                Troubleshoot
                            </button>
                        </div>
                    ) : payoutStatus === "processing" ? (
                        <div className="mt-[13px] flex flex-col gap-[8px]">
                            <div className="flex items-center gap-[12px]">
                                <div className="w-[24px] h-[24px] flex items-center justify-center shrink-0">
                                    <img src={awaiting} alt="Processing" className="w-full h-full scale-[1.2]" />
                                </div>
                                <span className="text-[14px] font-medium text-black" style={{ letterSpacing: "-0.43px" }}>
                                    Est. arrival: {payoutDate}
                                </span>
                            </div>
                            <span className="text-[14px] font-medium text-black ml-[36px]" style={{ letterSpacing: "-0.43px" }}>
                                Amount: ₹{payoutAmount.toLocaleString()}
                            </span>
                        </div>
                    ) : (
                        <div className="mt-[13px] flex flex-col gap-[8px]">
                            <div className="flex items-center gap-[12px]">
                                <div className="w-[18px] h-[18px] flex items-center justify-center shrink-0">
                                    <img src={verifiedBadge} alt="Completed" className="w-full h-full scale-[1.2]" />
                                </div>
                                <span className="text-[14px] font-medium text-black" style={{ letterSpacing: "-0.43px" }}>
                                    Instant Payout | Processed on {payoutDate}
                                </span>
                            </div>
                            <span className="text-[14px] font-medium text-black ml-[30px]" style={{ letterSpacing: "-0.43px" }}>
                                Amount: ₹{payoutAmount.toLocaleString()}
                            </span>
                        </div>
                    )}
                </div>

                {/* Auto Payout Card: 16px below */}
                <div className="mt-[16px] w-[362px] h-auto rounded-[14px] bg-white border border-[#EDEDED] p-[12px] flex flex-col shrink-0 mb-[40px] cursor-pointer active:scale-[0.98] transition-all"
                    onClick={() => navigate("/auto-payout")}
                >
                    <span className="text-[16px] font-bold text-black" style={{ letterSpacing: "-0.43px" }}>
                        {isAutoPayoutSetup ? "Auto Payout Method" : "Auto Payout"}
                    </span>
                    
                    {isAutoPayoutSetup ? (
                        <div className="mt-[13px] flex items-center gap-[12px]">
                            <div className="w-[40px] h-[40px] rounded-full bg-[#F5F5F5] flex items-center justify-center shrink-0 overflow-hidden p-2">
                                <BankLogo bankName={bankAccount?.bankName} />
                            </div>
                            <div className="flex-1 flex flex-col">
                                <span className="text-[14px] font-medium text-black/50 leading-tight">
                                    Bank account - XXXX XXXX XXXX {last4}
                                </span>
                                <span className="mt-[2px] text-[14px] font-medium text-black/50 leading-tight">
                                    Payout scheduled {selectedSchedule.toLowerCase()}
                                </span>
                            </div>
                            <img src={chevronForward} alt="Go" className="w-[18px] h-[18px] brightness-0" />
                        </div>
                    ) : (
                        <>
                            <p className="mt-[13px] text-[14px] font-medium text-black/50 leading-tight" style={{ letterSpacing: "-0.43px" }}>
                                You have not set up auto payout yet. Set it now so that you don't miss payments directly in your bank account?
                            </p>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate("/auto-payout");
                                }}
                                className="mt-[18px] w-full h-[44px] rounded-full bg-[#5260FE] text-white text-[16px] font-medium transition-transform active:scale-95 shadow-[0px_4px_12px_rgba(82,96,254,0.2)]"
                            >
                                Setup Auto Payout
                            </button>
                        </>
                    )}
                </div>

                {/* Need Help Button: Fixed at bottom */}
                <div className="mt-auto w-full flex justify-center pb-[40px]">
                    <button className="w-[362px] h-[48px] rounded-full border border-black flex items-center justify-center text-[16px] font-medium text-black transition-transform active:scale-95 bg-white">
                        Need Help?
                    </button>
                </div>
            </div>

            <WithdrawBottomSheet 
                isOpen={isWithdrawSheetOpen} 
                onClose={() => setIsWithdrawSheetOpen(false)} 
                onConfirm={handleWithdrawConfirm}
                availableBalance={currentAmount}
            />

            <TroubleshootBottomSheet 
                isOpen={isTroubleshootSheetOpen}
                onClose={() => setIsTroubleshootSheetOpen(false)}
                onSuccess={() => {
                    setPayoutStatus("processing");
                    // Refresh bank account if it was switched
                    const setup = localStorage.getItem("auto_payout_setup") === "true";
                    if (setup) {
                        const accounts = JSON.parse(localStorage.getItem("rider_bank_accounts") || "[]");
                        const primary = accounts.find((b: any) => b.isPrimary);
                        if (primary) setBankAccount(primary);
                        else if (accounts.length > 0) setBankAccount(accounts[0]);
                    }
                }}
                failedAmount={payoutAmount || 24000}
                currentBankName={bankAccount?.bankName}
            />
        </div>
    );
};

export default Wallet;
