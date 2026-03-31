import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
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
    const { riderId } = useAuth();

    const [loading, setLoading] = useState(true);
    const [isAutoPayoutSetup, setIsAutoPayoutSetup] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState("twice_monthly");
    const [bankAccount, setBankAccount] = useState<any>(null);
    const [isWithdrawSheetOpen, setIsWithdrawSheetOpen] = useState(false);
    const [isTroubleshootSheetOpen, setIsTroubleshootSheetOpen] = useState(false);
    const [currentAmount, setCurrentAmount] = useState(0);
    const [lastTransaction, setLastTransaction] = useState<any>(null);
    const transactions = useTransactions();

    const getNextPayoutDate = useCallback(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        
        const getNthSaturday = (y: number, m: number, n: number) => {
            let count = 0;
            const d = new Date(y, m, 1);
            while (d.getMonth() === m) {
                if (d.getDay() === 6) { // 6 = Saturday
                    count++;
                    if (count === n) return new Date(d);
                }
                d.setDate(d.getDate() + 1);
            }
            return null;
        };

        if (selectedSchedule === 'weekly') {
            const nextMon = new Date(now);
            nextMon.setDate(now.getDate() + (1 + 7 - now.getDay()) % 7 || 7);
            return nextMon.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        }
        
        if (selectedSchedule === 'twice_monthly') {
            const sat2 = getNthSaturday(year, month, 2);
            const sat4 = getNthSaturday(year, month, 4);
            
            if (sat2 && now < sat2) return sat2.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
            if (sat4 && now < sat4) return sat4.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
            
            // Next month's 2nd Saturday
            const nextSat2 = getNthSaturday(month === 11 ? year + 1 : year, (month + 1) % 12, 2);
            return nextSat2?.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) || "---";
        }
        
        if (selectedSchedule === 'monthly') {
            const lastDay = new Date(year, month + 1, 0);
            return lastDay.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        }
        
        if (selectedSchedule === 'quarterly') {
            const quarter = Math.floor(now.getMonth() / 3);
            const lastMonthOfQuarter = (quarter + 1) * 3;
            const lastDay = new Date(year, lastMonthOfQuarter, 0);
            return lastDay.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        }

        return "---";
    }, [selectedSchedule]);

    const fetchWalletData = useCallback(async () => {
        if (!riderId) return;
        try {
            // 1. Fetch rider details
            const { data: riderData, error: riderError } = await supabase
                .from('riders')
                .select('id, wallet_balance')
                .eq('rider_id', riderId)
                .single();
            if (riderError) throw riderError;
            
            const riderUuid = riderData.id;
            setCurrentAmount(Number(riderData.wallet_balance) || 0);

            // 2. Fetch payout settings
            const { data: settingsData } = await supabase
                .from('rider_payout_settings')
                .select('*')
                .eq('rider_uuid', riderUuid)
                .maybeSingle();
            
            if (settingsData) {
                setSelectedSchedule(settingsData.payout_schedule || "twice_monthly");
                setIsAutoPayoutSetup(settingsData.auto_payout_enabled);
            }

            // 3. Fetch primary bank account
            const { data: bankData } = await supabase
                .from('rider_bank_accounts')
                .select('*')
                .eq('rider_id', riderUuid)
                .eq('is_primary', true)
                .maybeSingle();

            if (bankData) {
                setBankAccount({
                    id: bankData.id,
                    bankName: bankData.bank_name,
                    accountNumber: bankData.account_number_masked || bankData.account_number,
                    isPrimary: bankData.is_primary
                });
            }

            // 4. Fetch latest transaction
            const { data: txData } = await supabase
                .from('rider_transactions')
                .select('*')
                .eq('rider_id', riderId)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();
            
            setLastTransaction(txData);

        } catch (err) {
            console.error("Error fetching wallet data:", err);
        }
    }, [riderId]);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            await fetchWalletData();
            setLoading(false);
        };
        load();
    }, [fetchWalletData]);

    // Handle return from success screen for immediate UI feedback
    useEffect(() => {
        if (location.state?.newBalance !== undefined) {
            setCurrentAmount(location.state.newBalance);
            fetchWalletData(); // Background refresh to get fresh transaction activity
            window.history.replaceState({}, document.title);
        }
    }, [location.state, fetchWalletData]);

    const last4 = bankAccount?.accountNumber ? bankAccount.accountNumber.slice(-4) : "4242";
    const scheduleLabels: Record<string, string> = {
        'weekly': 'weekly',
        'twice_monthly': 'twice per month',
        'monthly': 'monthly',
        'quarterly': 'quarterly'
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    };

    return (
        <div className="relative w-full h-[100dvh] bg-[#F5F5F5] font-satoshi flex flex-col items-center overflow-hidden">
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

                {/* Header */}
                <div className="flex-none flex items-center w-[362px] px-0 pt-12 pb-2 relative z-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-[32px] h-[32px] rounded-full bg-white shadow-sm flex items-center justify-center transition-transform active:scale-90"
                    >
                        <img src={chevronBackward} alt="Back" className="w-[18px] h-[18px] brightness-0" />
                    </button>
                    <div className="flex-1 flex justify-center mr-[32px]">
                        <h1 className="text-black text-[22px] font-medium leading-none">Wallet</h1>
                    </div>
                </div>

                {/* Balance Card */}
                <div className="mt-[29px] w-[362px] h-auto rounded-[14px] bg-white border border-[#EDEDED] p-[12px] flex flex-col shrink-0 relative">
                    <span className="text-[16px] font-bold text-black" style={{ letterSpacing: "-0.43px" }}>Balance</span>
                    <div className="mt-[13px] flex justify-between items-center cursor-pointer" onClick={() => navigate('/history')}>
                        <span className="text-[32px] font-bold text-black leading-none">₹{currentAmount.toLocaleString()}</span>
                        <img src={chevronForward} alt="Details" className="w-[18px] h-[18px] brightness-0 transition-transform active:scale-90" />
                    </div>
                    <span className="mt-[13px] text-[14px] font-medium text-[#5260FE]" style={{ letterSpacing: "-0.43px" }}>
                        Payout scheduled: {getNextPayoutDate()}
                    </span>
                    <button 
                        onClick={() => setIsWithdrawSheetOpen(true)}
                        className="mt-[18px] w-full h-[44px] rounded-full bg-[#5260FE] text-white text-[16px] font-medium transition-transform active:scale-95"
                    >
                        Need Money Now?
                    </button>
                </div>

                {/* Payout Activity Card */}
                <div className="mt-[16px] w-[362px] h-auto rounded-[14px] bg-white border border-[#EDEDED] p-[12px] flex flex-col shrink-0">
                    <div className="flex justify-between items-center w-full">
                        <h2 className="text-[18px] font-bold text-black" style={{ letterSpacing: "-0.43px" }}>Payout Activity</h2>
                        <button onClick={() => navigate('/history')} className="text-[14px] font-medium text-[#5260FE] hover:underline">View all activity</button>
                    </div>

                    {!lastTransaction ? (
                        <p className="mt-[13px] text-[14px] font-medium text-black/50" style={{ letterSpacing: "-0.43px" }}>
                            No payout occured in the last 2 weeks
                        </p>
                    ) : lastTransaction.status === 'completed' ? (
                        <div className="mt-[13px] flex flex-col gap-[8px]">
                            <div className="flex items-center gap-[12px]">
                                <div className="w-[18px] h-[18px] flex items-center justify-center shrink-0">
                                    <img src={verifiedBadge} alt="Completed" className="w-full h-full scale-[1.2]" />
                                </div>
                                <span className="text-[14px] font-medium text-black capitalize" style={{ letterSpacing: "-0.43px" }}>
                                    {lastTransaction.type.replace('_',' ')} | Processed on {formatDate(lastTransaction.created_at)}
                                </span>
                            </div>
                            <span className="text-[14px] font-medium text-black ml-[30px]" style={{ letterSpacing: "-0.43px" }}>
                                Amount: ₹{Number(lastTransaction.final_amount || lastTransaction.amount).toLocaleString()}
                            </span>
                        </div>
                    ) : lastTransaction.status === 'pending' || lastTransaction.status === 'processing' ? (
                        <div className="mt-[13px] flex flex-col gap-[8px]">
                            <div className="flex items-center gap-[12px]">
                                <div className="w-[24px] h-[24px] flex items-center justify-center shrink-0">
                                    <img src={awaiting} alt="Processing" className="w-full h-full scale-[1.2]" />
                                </div>
                                <span className="text-[14px] font-medium text-black" style={{ letterSpacing: "-0.43px" }}>
                                    Auto Payout Processing | Est. arrival: {getNextPayoutDate()}
                                </span>
                            </div>
                            <span className="text-[14px] font-medium text-black ml-[36px]" style={{ letterSpacing: "-0.43px" }}>
                                Amount: ₹{Number(lastTransaction.amount).toLocaleString()}
                            </span>
                        </div>
                    ) : (
                        <div className="mt-[13px] flex flex-col">
                            <div className="flex items-center gap-[12px]">
                                <img src={errorIcon} alt="Error" className="w-[24px] h-[24px] shrink-0 ml-[-6px]" />
                                <span className="text-[14px] font-bold text-black" style={{ letterSpacing: "-0.43px" }}>
                                    {lastTransaction.type.replace('_',' ')} Failed
                                </span>
                            </div>
                            <span className="text-[14px] font-medium text-black ml-[30px] mt-[4px]" style={{ letterSpacing: "-0.43px" }}>
                                Amount: ₹{Number(lastTransaction.amount).toLocaleString()}
                            </span>
                            <button 
                                onClick={() => setIsTroubleshootSheetOpen(true)}
                                className="mt-[16px] w-full h-[48px] rounded-full bg-[#5260FE] text-white text-[16px] font-medium transition-transform active:scale-95"
                            >
                                Troubleshoot
                            </button>
                        </div>
                    )}
                </div>

                {/* Auto Payout Card */}
                <div className="mt-[16px] w-[362px] h-auto rounded-[14px] bg-white border border-[#EDEDED] p-[12px] flex flex-col shrink-0 mb-[40px] cursor-pointer active:scale-[0.98] transition-all"
                    onClick={() => navigate("/auto-payout")}
                >
                    <span className="text-[16px] font-bold text-black" style={{ letterSpacing: "-0.43px" }}>
                        {isAutoPayoutSetup ? "Auto Payout Method" : "Auto Payout"}
                    </span>
                    
                    {bankAccount ? (
                        <div className="mt-[13px] flex items-center gap-[12px]">
                            <div className="w-[40px] h-[40px] rounded-full bg-[#F5F5F5] flex items-center justify-center shrink-0 overflow-hidden p-2">
                                <BankLogo bankName={bankAccount?.bankName} />
                            </div>
                            <div className="flex-1 flex flex-col">
                                <span className="text-[14px] font-medium text-black/50 leading-tight">
                                    Bank account - XXXX XXXX XXXX {last4}
                                </span>
                                <span className="mt-[2px] text-[14px] font-medium text-black/50 leading-tight capitalize">
                                    Payout scheduled {scheduleLabels[selectedSchedule] || "---"}
                                </span>
                            </div>
                            <img src={chevronForward} alt="Go" className="w-[18px] h-[18px] brightness-0" />
                        </div>
                    ) : (
                        <>
                            <p className="mt-[13px] text-[14px] font-medium text-black/50 leading-tight" style={{ letterSpacing: "-0.43px" }}>
                                You have not set up auto payout yet. Set it now so that you don't miss payments directly in your bank account?
                            </p>
                            <button onClick={(e) => { e.stopPropagation(); navigate("/auto-payout"); }} className="mt-[18px] w-full h-[44px] rounded-full bg-[#5260FE] text-white text-[16px] font-medium transition-transform active:scale-95">
                                Setup Auto Payout
                            </button>
                        </>
                    )}
                </div>

                <div className="mt-auto w-full flex justify-center pb-[40px]">
                    <button className="w-[362px] h-[48px] rounded-full border border-black flex items-center justify-center text-[16px] font-medium text-black transition-transform active:scale-95 bg-white">
                        Need Help?
                    </button>
                </div>
            </div>

            <WithdrawBottomSheet isOpen={isWithdrawSheetOpen} onClose={() => setIsWithdrawSheetOpen(false)} onConfirm={() => fetchWalletData()} availableBalance={currentAmount} />
            <TroubleshootBottomSheet isOpen={isTroubleshootSheetOpen} onClose={() => setIsTroubleshootSheetOpen(false)} onSuccess={() => fetchWalletData()} failedAmount={lastTransaction?.amount || 24000} currentBankName={bankAccount?.bankName} />
        </div>
    );
};

export default Wallet;
