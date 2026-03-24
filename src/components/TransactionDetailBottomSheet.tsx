import React, { useEffect, useState } from 'react';
import downloadIcon from "../assets/download.svg";

export interface Transaction {
  id: number;
  type: 'Earnings' | 'Payouts' | 'Deductions';
  title: string;
  detail: string;
  amount: string;
  status: 'success' | 'processing' | 'failed';
}

interface TransactionDetailBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

const TransactionDetailBottomSheet: React.FC<TransactionDetailBottomSheetProps> = ({
  isOpen,
  onClose,
  transaction
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [dragY, setDragY] = useState(0);
  const startY = React.useRef(0);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      setDragY(0);
    } else {
      setTimeout(() => setIsAnimating(false), 300);
    }
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaY = e.touches[0].clientY - startY.current;
    if (deltaY > 0) {
      setDragY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (dragY > 100) {
      onClose();
    }
    setDragY(0);
  };

  if (!isOpen && !isAnimating) return null;
  if (!transaction) return null;

  const renderContent = () => {
    const { title, detail, amount, status } = transaction;

    // Variant: Auto Payout Received
    if (title === "Auto Payout Received") {
      return (
        <div className="flex flex-col">
          <div className="flex flex-col items-center">
            <h2 className="font-bold text-[24px] text-black text-center leading-tight">
              Auto Payout Received
            </h2>
            <p className="mt-[8px] font-medium text-[14px] text-center text-[#616161] leading-tight px-4" style={{ letterSpacing: "-0.43px" }}>
              Auto payout was successfully transferred for the period of {detail.replace('Period ', '')}.
            </p>
          </div>

          <div className="mt-[24px] flex flex-col">
            <h3 className="text-[16px] font-bold text-black mb-[12px]" style={{ letterSpacing: "-0.43px" }}>Amount breakdown</h3>
            
            <div className="flex justify-between items-center mb-[8px]">
              <span className="text-[14px] font-medium text-[#616161]" style={{ letterSpacing: "-0.43px" }}>Total Earnings</span>
              <span className="text-[14px] font-medium text-black" style={{ letterSpacing: "-0.43px" }}>+₹25,000</span>
            </div>

            <div className="flex justify-between items-center mb-[8px]">
              <span className="text-[14px] font-medium text-[#616161]" style={{ letterSpacing: "-0.43px" }}>Deductions (Instant Payout taken):</span>
              <span className="text-[14px] font-medium text-[#FF3B30]" style={{ letterSpacing: "-0.43px" }}>- ₹1000</span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-[#F5F5F5] mb-[8px]">
              <span className="text-[16px] font-bold text-[#34C759]" style={{ letterSpacing: "-0.43px" }}>Final Amount to Bank:</span>
              <span className="text-[16px] font-bold text-[#34C759]" style={{ letterSpacing: "-0.43px" }}>₹24,000</span>
            </div>

            <div className="flex justify-between items-center mb-[8px]">
              <span className="text-[14px] font-medium text-[#616161]" style={{ letterSpacing: "-0.43px" }}>Bank:</span>
              <span className="text-[14px] font-medium text-black" style={{ letterSpacing: "-0.43px" }}>HDFC Bank ( XXXX 4242 )</span>
            </div>
          </div>

          <p className="mt-[32px] text-[14px] font-medium text-[#616161] text-center leading-tight px-6" style={{ letterSpacing: "-0.43px" }}>
            An invoice was generated and sent to your registered email id.
          </p>

          <button
            onClick={onClose}
            className="mt-[24px] w-full h-[44px] rounded-full bg-[#5260FE] flex items-center justify-center gap-2 text-[16px] font-medium text-white transition-all active:scale-[0.98] shadow-[0px_4px_12px_rgba(82,96,254,0.2)]"
          >
            Download Invoice
            <img src={downloadIcon} alt="Download" className="w-[18px] h-[18px]" />
          </button>
        </div>
      );
    }

    // Variant: Instant Payout
    if (title === "Instant Payout") {
      return (
        <div className="flex flex-col">
          <div className="flex flex-col items-center">
            <h2 className="font-bold text-[24px] text-black text-center leading-tight">
              Instant Payout
            </h2>
            <p className="mt-[8px] font-medium text-[14px] text-center text-[#616161] leading-tight px-4" style={{ letterSpacing: "-0.43px" }}>
              An Instant Payout request was received and currently under review.
            </p>
          </div>

          <div className="mt-[24px] flex flex-col">
            <h3 className="text-[16px] font-bold text-black mb-[12px]" style={{ letterSpacing: "-0.43px" }}>Amount breakdown</h3>
            
            <div className="flex justify-between items-center mb-[8px]">
              <span className="text-[14px] font-medium text-[#616161]" style={{ letterSpacing: "-0.43px" }}>Total Earnings</span>
              <span className="text-[14px] font-medium text-black" style={{ letterSpacing: "-0.43px" }}>+₹25,000</span>
            </div>

            <div className="flex justify-between items-center mb-[8px]">
              <span className="text-[14px] font-medium text-[#616161]" style={{ letterSpacing: "-0.43px" }}>Instant Payout:</span>
              <span className="text-[14px] font-medium text-[#FF3B30]" style={{ letterSpacing: "-0.43px" }}>- ₹1000</span>
            </div>

            <div className="flex justify-between items-center mb-[8px]">
              <span className="text-[14px] font-medium text-[#616161]" style={{ letterSpacing: "-0.43px" }}>Balance Adjustment:</span>
              <span className="text-[14px] font-medium text-black" style={{ letterSpacing: "-0.43px" }}>₹24,000</span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-[#F5F5F5] mb-[8px]">
              <span className="text-[16px] font-bold text-[#34C759]" style={{ letterSpacing: "-0.43px" }}>Final Amount to Bank:</span>
              <span className="text-[16px] font-bold text-[#34C759]" style={{ letterSpacing: "-0.43px" }}>₹1,000</span>
            </div>

            <div className="flex justify-between items-center mb-[8px]">
              <span className="text-[14px] font-medium text-[#616161]" style={{ letterSpacing: "-0.43px" }}>Bank:</span>
              <span className="text-[14px] font-medium text-black" style={{ letterSpacing: "-0.43px" }}>HDFC Bank ( XXXX 4242 )</span>
            </div>
          </div>

          <p className="mt-[32px] text-[14px] font-medium text-[#616161] text-center leading-tight px-6" style={{ letterSpacing: "-0.43px" }}>
            An invoice will be generated and sent to your registered email id once the payout is processed.
          </p>

          <button
            onClick={onClose}
            className="mt-[24px] w-full h-[44px] rounded-full bg-[#5260FE] text-white font-medium text-[16px] transition-all active:scale-[0.98] shadow-[0px_4px_12px_rgba(82,96,254,0.2)]"
          >
            Close
          </button>
        </div>
      );
    }

    // Variant: Deductions (e.g. TDS)
    if (transaction.type === 'Deductions') {
      return (
        <div className="flex flex-col items-center">
          <h2 className="font-bold text-[24px] text-black text-center leading-tight">
            {title}
          </h2>
          <p className="mt-[16px] font-medium text-[16px] text-[#616161] text-center leading-[1.4] tracking-tight px-2" style={{ letterSpacing: "-0.43px" }}>
            A deduction of {amount} was applied for {detail}.
          </p>

          <div className="mt-[32px] w-[64px] h-[64px] rounded-full bg-[#FF3B3010] flex items-center justify-center">
            <div className="w-[44px] h-[44px] rounded-full bg-[#FF3B30] flex items-center justify-center shadow-lg">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          <p className="mt-[32px] text-[14px] font-medium text-black text-center leading-tight px-4 opacity-80" style={{ letterSpacing: "-0.43px" }}>
            Disclaimer: Deductions are adjusted from your wallet balance and will be reflected in your next payout statement.
          </p>

          <button
            onClick={onClose}
            className="mt-[32px] w-full h-[44px] rounded-full bg-[#5260FE] text-white font-medium text-[16px] transition-all active:scale-[0.98] shadow-[0px_4px_12px_rgba(82,96,254,0.2)]"
          >
            Close
          </button>
        </div>
      );
    }

    // Variants: Tips, Milestones, Referral
    let emoji = "";
    let desc = "";
    let disclaimer = "";
    
    if (title.includes("Tip")) {
      emoji = "🥳";
      desc = `Amazing job! You just received a tip of ${amount} for your delivery on ${detail.replace('Delivery for ', '')}. Your hard work is clearly paying off!`;
      disclaimer = "Disclaimer: This tip goes 100% to you. Grid.pe doesn't charge any fees on tips, and it has been sent directly to your linked bank account.";
    } else if (title.includes("Bonus")) {
      emoji = "🚀";
      desc = `You've earned a bonus of ${amount} for your hard work on ${detail.replace('Delivery for ', '')}. You're absolutely crushing it!`;
      disclaimer = "Disclaimer: This bonus has been added to your Grid.pe Wallet. It will be included in your next scheduled auto-payout on 19 Mar.";
    } else if (title.includes("Referral")) {
      emoji = "🤝";
      desc = `You just received a ${amount} referral reward for bringing ${detail.replace('Referral for user ', '')} on board. Thanks for helping us grow the Grid.pe family!`;
      disclaimer = "Disclaimer: This reward is now sitting in your Grid.pe Wallet. It will be settled to your bank account along with your next auto-payout.";
    }

    return (
      <div className="flex flex-col items-center font-satoshi">
        <h2 className="font-bold text-[24px] text-black text-center leading-tight" style={{ letterSpacing: "-0.43px" }}>
          {title.includes("Tip") ? "You've got a Tip!" : 
           title.includes("Bonus") ? "Milestone Reached!" : 
           "Your Squad is Growing!"} {emoji}
        </h2>
        
        <p className="mt-[16px] font-medium text-[16px] text-[#616161] text-center leading-[1.4] tracking-tight px-2" style={{ letterSpacing: "-0.43px" }}>
          {desc}
        </p>

        <div className="mt-[32px] w-[64px] h-[64px] rounded-full bg-[#1CB95610] flex items-center justify-center">
          <div className="w-[44px] h-[44px] rounded-full bg-[#1CB956] flex items-center justify-center shadow-lg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M5 13L9 17L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <p className="mt-[32px] text-[14px] font-medium text-black text-center leading-tight px-4 opacity-80" style={{ letterSpacing: "-0.43px" }}>
          {disclaimer}
        </p>

        <button
          onClick={onClose}
          className="mt-[32px] w-full h-[44px] rounded-full bg-[#5260FE] text-white font-medium text-[16px] transition-all active:scale-[0.98] shadow-[0px_4px_12px_rgba(82,96,254,0.2)]"
        >
          Close
        </button>
      </div>
    );
  };

  return (
    <div className={`fixed inset-0 z-[100] flex items-end justify-center transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} />

      <div
        className={`relative bg-white w-[362px] rounded-[32px] mb-[21px] flex flex-col pt-[12px] px-[14px] pb-[14px] z-10 transition-transform duration-300`}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ transform: `translateY(${isOpen ? `${dragY}px` : '100%'})` }}
      >
        <div className="w-[40px] h-[4px] bg-[#E0E0E0] rounded-full mx-auto mb-6" />
        {renderContent()}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
        @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}} />
    </div>
  );
};

export default TransactionDetailBottomSheet;
