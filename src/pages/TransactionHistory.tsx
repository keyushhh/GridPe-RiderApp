import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import chevronBackward from "../assets/chevron_backward.svg";
import awaitingIcon from "../assets/awaiting.svg";
import errorIcon from "../assets/error.svg";
import verifiedIcon from "../assets/verified.svg";
import TransactionDetailBottomSheet from "../components/TransactionDetailBottomSheet";

const TransactionHistory: React.FC = () => {
  const navigate = useNavigate();
  const { riderId } = useAuth();
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'earnings', label: 'Earnings' },
    { id: 'payouts', label: 'Payouts' },
    { id: 'deductions', label: 'Deductions' }
  ];

  const fetchTransactions = useCallback(async (filterVal: string) => {
    if (!riderId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-rider-transactions', {
        body: { riderId, filter: filterVal }
      });
      if (error) throw error;
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error("Error fetching transactions:", err);
    } finally {
      setLoading(false);
    }
  }, [riderId]);

  useEffect(() => {
    fetchTransactions(activeFilter);
  }, [activeFilter, fetchTransactions]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return verifiedIcon;
      case 'pending': return awaitingIcon;
      case 'processing': return awaitingIcon;
      case 'failed': return errorIcon;
      default: return verifiedIcon;
    }
  };

  const getTransactionTitle = (tx: any) => {
    switch (tx.type) {
      case 'auto_payout': return "Auto Payout Received";
      case 'instant_withdrawal': return "Instant Payout";
      case 'delivery_tip': return "Delivery Tip Received";
      case 'bonus': return "Bonus Earned";
      case 'referral_reward': return "Referral Reward Received";
      default: return tx.type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
    }
  };

  const getTransactionSubtitle = (tx: any) => {
    if (tx.type === 'instant_withdrawal') {
      if (tx.status === 'pending' || tx.status === 'processing') return "Instant payout processing";
      if (tx.status === 'failed') return "Instant payout failed!";
      return "Transferred to bank";
    }
    return tx.description || "";
  };

  const handleTxClick = (tx: any) => {
    setSelectedTransaction(tx);
    setIsBottomSheetOpen(true);
  };

  return (
    <div className="relative w-full h-[100dvh] bg-[#F5F5F5] font-satoshi flex flex-col items-center overflow-hidden">
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
          <h1 className="text-black text-[22px] font-medium leading-none" style={{ letterSpacing: "-0.43px" }}>
            Transaction History
          </h1>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-[21px] flex gap-[6px] w-[362px] overflow-x-auto no-scrollbar relative z-10 justify-center">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`w-[86px] h-[32px] rounded-[4px] bg-white border text-[14px] font-medium transition-all flex items-center justify-center shrink-0 ${
              activeFilter === f.id 
                ? 'border-[#5260FE] text-black shadow-sm' 
                : 'border-[#EDEDED] text-black/50 hover:bg-white/80'
            }`}
            style={{ letterSpacing: "-0.43px" }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      <div className="mt-[10px] flex-1 w-full overflow-y-auto no-scrollbar flex flex-col items-center pb-[40px] relative z-10">
        {loading ? (
          <div className="mt-[40px] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#5260FE] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : transactions.length > 0 ? (
          <div className="flex flex-col gap-[10px] w-[362px] mt-[10px]">
            {transactions.map((tx: any) => (
              <div 
                key={tx.id}
                onClick={() => handleTxClick(tx)}
                className="w-full bg-white rounded-[14px] border border-[#67676780] p-[12px] flex items-start gap-[12px] transition-all active:scale-[0.99] cursor-pointer"
              >
                <img 
                  src={getStatusIcon(tx.status)} 
                  alt={tx.status} 
                  className="w-[24px] h-[24px] shrink-0 mt-[2px]" 
                />

                <div className="flex-1 flex flex-col pt-[2px]">
                  <div className="flex justify-between items-start w-full">
                    <span className="text-[14px] font-bold text-black" style={{ letterSpacing: "-0.43px" }}>
                      {getTransactionTitle(tx)}
                    </span>
                    <span className="text-[14px] font-bold text-black" style={{ letterSpacing: "-0.43px" }}>
                      ₹{Number(tx.amount).toLocaleString()}
                    </span>
                  </div>
                  <span className="mt-[3px] text-[13px] font-medium text-black/50 leading-tight" style={{ letterSpacing: "-0.43px" }}>
                    {getTransactionSubtitle(tx)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 w-full flex flex-col items-center justify-center -mt-[40px] px-[24px]">
            <div className="relative w-[300px] h-[180px] flex justify-center items-center mb-[32px]">
                <div className="absolute top-[0px] w-[230px] h-[75px] bg-white border border-[#F2F2F2] rounded-[16px] opacity-40 shadow-sm flex items-center px-4 gap-3">
                  <div className="w-[42px] h-[42px] bg-[#F2F2F2] rounded-[10px] flex-shrink-0" />
                  <div className="flex flex-col gap-2 flex-grow">
                    <div className="h-[9px] bg-[#F2F2F2] rounded-full w-[60%]" />
                    <div className="h-[9px] bg-[#F2F2F2] rounded-full w-[85%]" />
                  </div>
                </div>
                <div className="absolute top-[20px] w-[265px] h-[75px] bg-white border border-[#F2F2F2] rounded-[18px] opacity-70 shadow-sm flex items-center px-4 gap-3">
                  <div className="w-[42px] h-[42px] bg-[#F2F2F2] rounded-[10px] flex-shrink-0" />
                  <div className="flex flex-col gap-2 flex-grow">
                    <div className="h-[9px] bg-[#F2F2F2] rounded-full w-[65%]" />
                    <div className="h-[9px] bg-[#F2F2F2] rounded-full w-[90%]" />
                  </div>
                </div>
                <div className="absolute top-[45px] w-[300px] h-[85px] bg-white border border-[#EDEDED] rounded-[22px] shadow-[0px_12px_32px_rgba(0,0,0,0.06)] z-10 flex items-center px-[18px] gap-4">
                  <div className="w-[50px] h-[50px] bg-[#5260FE] rounded-[14px] flex-shrink-0" />
                  <div className="flex flex-col gap-3 flex-grow">
                    <div className="h-[10px] bg-[#F2F2F2] rounded-full w-[45%]" />
                    <div className="h-[10px] bg-[#F2F2F2] rounded-full w-[95%]" />
                    <div className="h-[10px] bg-[#F2F2F2] rounded-full w-[70%]" />
                  </div>
                </div>
            </div>
            <h2 className="text-black font-bold text-[20px] text-center mb-2">No transactions done yet!</h2>
            <p className="text-black font-medium text-[16px] text-center opacity-60 w-[240px] leading-snug">You’ll find all your updates and alerts here.</p>
          </div>
        )}
      </div>

      <TransactionDetailBottomSheet 
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
        transaction={selectedTransaction}
      />
    </div>
  );
};

export default TransactionHistory;
