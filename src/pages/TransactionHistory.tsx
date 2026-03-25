import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import chevronBackward from "../assets/chevron_backward.svg";
import awaitingIcon from "../assets/awaiting.svg";
import errorIcon from "../assets/error.svg";
import verifiedIcon from "../assets/verified.svg";
import { useTransactions } from "../hooks/useTransactions";
import TransactionDetailBottomSheet, { Transaction } from "../components/TransactionDetailBottomSheet";

const TransactionHistory: React.FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const transactions = useTransactions();

  const filters = ['All', 'Earnings', 'Payouts', 'Deductions'];

  const filteredTransactions = activeFilter === 'All' 
    ? transactions 
    : transactions.filter((t: Transaction) => t.type === activeFilter);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return verifiedIcon;
      case 'processing': return awaitingIcon;
      case 'failed': return errorIcon;
      default: return verifiedIcon;
    }
  };

  const handleTxClick = (tx: Transaction) => {
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
          onClick={() => navigate('/wallet')}
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

      {/* Filters: 21px below heading */}
      <div className="mt-[21px] flex gap-[6px] w-[362px] overflow-x-auto no-scrollbar relative z-10 justify-center">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`w-[86px] h-[32px] rounded-[4px] bg-white border text-[14px] font-medium transition-all flex items-center justify-center shrink-0 ${
              activeFilter === filter 
                ? 'border-[#5260FE] text-black shadow-sm' 
                : 'border-[#EDEDED] text-black/50 hover:bg-white/80'
            }`}
            style={{ letterSpacing: "-0.43px" }}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Transaction List: 10px below filters */}
      <div className="mt-[10px] flex-1 w-full overflow-y-auto no-scrollbar flex flex-col items-center pb-[40px] relative z-10">
        {transactions.length > 0 ? (
          <div className="flex flex-col gap-[10px] w-[362px] mt-[10px]">
            {filteredTransactions.map((tx: Transaction) => (
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
                      {tx.title}
                    </span>
                    <span className="text-[14px] font-medium text-black" style={{ letterSpacing: "-0.43px" }}>
                      {tx.amount}
                    </span>
                  </div>
                  <span className="mt-[4px] text-[14px] font-medium text-black leading-tight" style={{ letterSpacing: "-0.43px" }}>
                    {tx.detail}
                  </span>
                </div>
              </div>
            ))}
            
            {filteredTransactions.length === 0 && (
              <div className="mt-[40px] text-center text-black/40 text-[14px] font-medium">
                No transactions found for this category.
              </div>
            )}
          </div>
        ) : (
          /* Empty State Content */
          <div className="flex-1 w-full flex flex-col items-center justify-center -mt-[40px] px-[24px]">
            {/* Illustration: Stacked Cards */}
            <div className="relative w-[300px] h-[180px] flex justify-center items-center mb-[32px]">
              {/* Bottom Card */}
              <div className="absolute top-[0px] w-[230px] h-[75px] bg-white border border-[#F2F2F2] rounded-[16px] opacity-40 shadow-sm flex items-center px-4 gap-3">
                <div className="w-[42px] h-[42px] bg-[#F2F2F2] rounded-[10px] flex-shrink-0" />
                <div className="flex flex-col gap-2 flex-grow">
                  <div className="h-[9px] bg-[#F2F2F2] rounded-full w-[60%]" />
                  <div className="h-[9px] bg-[#F2F2F2] rounded-full w-[85%]" />
                </div>
              </div>
              {/* Middle Card */}
              <div className="absolute top-[20px] w-[265px] h-[75px] bg-white border border-[#F2F2F2] rounded-[18px] opacity-70 shadow-sm flex items-center px-4 gap-3">
                <div className="w-[42px] h-[42px] bg-[#F2F2F2] rounded-[10px] flex-shrink-0" />
                <div className="flex flex-col gap-2 flex-grow">
                  <div className="h-[9px] bg-[#F2F2F2] rounded-full w-[65%]" />
                  <div className="h-[9px] bg-[#F2F2F2] rounded-full w-[90%]" />
                </div>
              </div>
              {/* Top Card */}
              <div className="absolute top-[45px] w-[300px] h-[85px] bg-white border border-[#EDEDED] rounded-[22px] shadow-[0px_12px_32px_rgba(0,0,0,0.06)] z-10 flex items-center px-[18px] gap-4">
                {/* Blue Icon Case */}
                <div className="w-[50px] h-[50px] bg-[#5260FE] rounded-[14px] flex-shrink-0" />
                
                <div className="flex flex-col gap-3 flex-grow">
                  <div className="h-[10px] bg-[#F2F2F2] rounded-full w-[45%]" />
                  <div className="h-[10px] bg-[#F2F2F2] rounded-full w-[95%]" />
                  <div className="h-[10px] bg-[#F2F2F2] rounded-full w-[70%]" />
                </div>
              </div>
            </div>

            {/* Text Content */}
            <h2 className="text-black font-bold text-[20px] text-center mb-2">
              No transactions done yet!
            </h2>
            <p className="text-black font-medium text-[16px] text-center opacity-60 w-[240px] leading-snug">
              You’ll find all your updates and alerts here.
            </p>
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
