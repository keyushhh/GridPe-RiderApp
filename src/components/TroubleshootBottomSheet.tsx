import React, { useEffect, useState } from 'react';
import { getBankLogo } from '../utils/BankLogoMap';

interface TroubleshootBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  failedAmount: number;
  currentBankName: string;
}

const TroubleshootBottomSheet: React.FC<TroubleshootBottomSheetProps> = ({
  isOpen,
  onClose,
  onSuccess,
  failedAmount,
  currentBankName
}) => {
  const [banks, setBanks] = useState<any[]>([]);
  const [selectedFix, setSelectedFix] = useState<'bank' | 'instant'>('bank');
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [dragY, setDragY] = useState(0);
  const startY = React.useRef(0);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      setDragY(0);
      const riderBanks = JSON.parse(localStorage.getItem('rider_bank_accounts') || '[]');
      setBanks(riderBanks.length > 0 ? riderBanks.map((b: any, index: number) => ({
        ...b,
        // Fallback: mark first account as Primary if none exist
        isPrimary: b.isPrimary || (index === 0 && !riderBanks.some((acc: any) => acc.isPrimary))
      })) : [
        { id: '1', bankName: 'HDFC Bank', accountNumber: 'XXXX 1234', isPrimary: true },
        { id: '2', bankName: 'IDFC FIRST Bank', accountNumber: 'XXXX 5678', isPrimary: false }
      ]);
      const activeBanks = riderBanks.length > 0 ? riderBanks : [
        { id: '1', bankName: 'HDFC Bank', accountNumber: 'XXXX 1234', isPrimary: true },
        { id: '2', bankName: 'IDFC FIRST Bank', accountNumber: 'XXXX 5678', isPrimary: false }
      ];
      const primary = activeBanks.find((b: any) => b.isPrimary) || activeBanks[0];
      if (primary) {
        setSelectedBankId(primary.id || primary.accountNumber);
      }
    } else {
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
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

  const handleAction = () => {
      if (selectedFix === 'bank') {
          const updatedBanks = banks.map(b => ({
              ...b,
              isPrimary: (b.id || b.accountNumber) === selectedBankId
          }));
          localStorage.setItem('rider_bank_accounts', JSON.stringify(updatedBanks));
      }
      onSuccess();
      onClose();
  };

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-end justify-center transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Bottom Sheet Container */}
      <div
        className={`relative bg-white w-[362px] rounded-[32px] mb-[21px] flex flex-col pt-[12px] px-[14px] pb-[14px] z-10 transition-transform duration-300 shadow-[0_-8px_30px_rgb(0,0,0,0.12)]`}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ transform: `translateY(${isOpen ? `${dragY}px` : '100%'})` }}
      >
        {/* Drag Handle */}
        <div className="w-[40px] h-[4px] bg-[#E0E0E0] rounded-full mx-auto mb-6" />

        {/* Content */}
        <div className="flex flex-col items-center">
            <h2 className="font-bold text-[18px] text-black text-center" style={{ letterSpacing: "-0.43px", fontFamily: "Satoshi, sans-serif" }}>
                Auto Payout Troubleshoot
            </h2>
            <p className="mt-[6px] text-[14px] text-[#616161] text-center leading-[1.3] px-2" style={{ letterSpacing: "-0.43px", fontFamily: "Satoshi, sans-serif" }}>
                Your payout to {currentBankName || 'HDFC Bank'} was declined by the bank. You can switch your account or try an instant withdrawal instead.
            </p>
        </div>

        {/* Fix 1: Change primary bank account */}
        <div className="mt-[24px] flex flex-col">
            <h3 className="font-bold text-[16px] text-black" style={{ letterSpacing: "-0.43px", fontFamily: "Satoshi, sans-serif" }}>
                Fix 1: Change primary bank account
            </h3>
            
            <div 
                className={`mt-[12px] w-full p-[12px] rounded-[14px] border border-[#EDEDED] bg-white flex flex-col gap-[12px] transition-all cursor-pointer`}
                onClick={() => setSelectedFix('bank')}
            >
                <div className="flex flex-col gap-[12px]">
                    <span className="text-[14px] font-bold text-black" style={{ letterSpacing: "-0.43px", fontFamily: "Satoshi, sans-serif" }}>
                        Linked Bank Accounts
                    </span>
                    
                    <div className="flex flex-col gap-[9px]">
                        {banks.map((bank, index) => (
                            <div key={bank.id || bank.accountNumber} className="flex flex-col gap-[9px]">
                                {index > 0 && <div className="w-full h-[1px] bg-[#EDEDED]" />}
                                <div 
                                     className="flex items-center justify-between group cursor-pointer"
                                     onClick={(e) => {
                                         e.stopPropagation();
                                         setSelectedFix('bank');
                                         setSelectedBankId(bank.id || bank.accountNumber);
                                     }}
                                >
                                    <div className="flex items-center gap-[12px]">
                                        <div className={`w-[24px] h-[24px] rounded-full border-[1.5px] border-[#5260FE] flex items-center justify-center shrink-0 transition-all ${selectedBankId === (bank.id || bank.accountNumber) && selectedFix === 'bank' ? 'bg-white' : 'opacity-20'}`}>
                                            {(selectedBankId === (bank.id || bank.accountNumber) && selectedFix === 'bank') ? (
                                                <div className="w-[14px] h-[14px] rounded-full bg-[#5260FE]" />
                                            ) : (
                                                <div className="w-[14px] h-[14px] rounded-full bg-white" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-[12px]">
                                            <span className={`text-[14px] font-medium transition-colors ${selectedBankId === (bank.id || bank.accountNumber) && selectedFix === 'bank' ? 'text-black' : 'text-black/50'}`} style={{ fontFamily: "Satoshi, sans-serif", letterSpacing: "-0.43px" }}>
                                                {bank.bankName} - XXXX {bank.accountNumber?.slice(-4) || '1023'}
                                            </span>
                                        </div>
                                    </div>
                                    {bank.isPrimary && (
                                        <div className="w-[60px] h-[18px] rounded-full bg-[#0B902B] flex items-center justify-center shrink-0">
                                            <span className="text-white text-[10px] font-bold">Primary</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Fix 2: Request an Instant Payout */}
        <div className="mt-[16px] flex flex-col">
            <div 
                className={`w-full pt-[12px] px-[12px] pb-[14px] rounded-[14px] border border-[#EDEDED] flex flex-col gap-[8px] transition-all cursor-pointer bg-white`}
                onClick={() => setSelectedFix('instant')}
            >
                <div className="flex items-center gap-[12px]">
                    <div className={`w-[24px] h-[24px] rounded-full border-[1.5px] border-[#5260FE] flex items-center justify-center shrink-0 transition-all ${selectedFix === 'instant' ? 'bg-white' : 'opacity-20'}`}>
                        {selectedFix === 'instant' ? (
                            <div className="w-[14px] h-[14px] rounded-full bg-[#5260FE]" />
                        ) : (
                            <div className="w-[14px] h-[14px] rounded-full bg-white" />
                        )}
                    </div>
                    <span className="text-[16px] font-bold text-black" style={{ letterSpacing: "-0.43px", fontFamily: "Satoshi, sans-serif" }}>
                        Fix 2: Request an Instant Payout
                    </span>
                </div>
                
                <p className="text-[14px] font-medium text-[#616161] leading-[1.3] pr-[12px]" style={{ letterSpacing: "-0.43px", fontFamily: "Satoshi, sans-serif" }}>
                    You can request for an instant payout of ₹{failedAmount?.toLocaleString() || '2,600'} to your primary bank account.
                </p>
                
                <p className="text-[14px] font-normal italic text-black leading-[1.3] pr-[12px]" style={{ letterSpacing: "-0.43px", fontFamily: "Satoshi, sans-serif" }}>
                    <span className="font-bold not-italic">Note:</span> If your primary bank account is facing some glitches, the amount may take a while to reflect.
                </p>
            </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleAction}
          className="mt-[24px] w-full h-[44px] rounded-full bg-[#5260FE] text-white font-medium text-[16px] transition-all active:scale-[0.98] shadow-[0px_4px_12px_rgba(82,96,254,0.2)]"
        >
          {selectedFix === 'bank' ? 'Retry Payout' : 'Get Cash Now'}
        </button>
      </div>
    </div>
  );
};

export default TroubleshootBottomSheet;
