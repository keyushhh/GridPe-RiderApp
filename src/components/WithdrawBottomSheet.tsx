import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface WithdrawBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => void;
  availableBalance: number;
}

const WithdrawBottomSheet: React.FC<WithdrawBottomSheetProps> = ({
  isOpen,
  onClose,
  onConfirm,
  availableBalance
}) => {
  const navigate = useNavigate();
  const [withdrawAmount, setWithdrawAmount] = useState(900);
  const [inputValue, setInputValue] = useState('900');
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

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setWithdrawAmount(val);
    setInputValue(val.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    setInputValue(rawVal);
    if (rawVal) {
      setWithdrawAmount(Number(rawVal));
    } else {
      setWithdrawAmount(0);
    }
  };

  if (!isOpen && !isAnimating) return null;

  const minWithdrawal = 500;
  const maxWithdrawal = 15000;
  const isError = withdrawAmount < minWithdrawal || withdrawAmount > maxWithdrawal || (inputValue === '');
  const platformFee = 25;
  const tds = 0;
  const finalAmount = Math.max(0, withdrawAmount - platformFee - tds);
  const balanceAfter = availableBalance - withdrawAmount;

  return (
    <div className={`fixed inset-0 z-[100] flex items-end justify-center transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Bottom Sheet Container */}
      <div
        className={`relative bg-white w-[362px] rounded-[24px] mb-[21px] flex flex-col pt-[12px] px-[14px] pb-[14px] z-10 transition-transform duration-300`}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ transform: `translateY(${isOpen ? `${dragY}px` : '100%'})` }}
      >
        {/* Drag Handle */}
        <div className="w-[40px] h-[4px] bg-[#E0E0E0] rounded-full mx-auto mb-6" />

        {availableBalance < 500 ? (
          <div className="flex flex-col items-center">
            <h2 
              className="mt-[4px] font-bold text-[18px] text-black text-center leading-tight" 
              style={{ letterSpacing: "-0.43px", fontFamily: "Satoshi, sans-serif" }}
            >
              Balance is too low
            </h2>
            <p 
              className="mt-[6px] font-normal text-[16px] text-black text-center leading-snug" 
              style={{ width: "330px", letterSpacing: "-0.43px", fontFamily: "Satoshi, sans-serif" }}
            >
              You can request for instant withdrawals when you have a balance of at least ₹500.
            </p>
            <button
              onClick={onClose}
              className="mt-[48px] w-full h-[44px] rounded-full bg-[#5260FE] text-white font-medium text-[16px] transition-all active:scale-[0.98] shadow-[0px_4px_12px_rgba(82,96,254,0.2)]"
            >
              Got it
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col items-center">
              <h2 className="font-bold text-[24px] text-black text-center leading-tight">
                How much do you need?
              </h2>
              <p 
                className={`mt-[8px] font-medium text-[14px] text-center leading-tight transition-colors duration-200 ${
                  isError ? 'text-[#FF0000]' : 'text-[#A0A0A0]'
                }`}
              >
                For instant withdrawals Min. withdrawal: ₹500 | <br /> Max. withdrawal: ₹15,000
              </p>
            </div>

            {/* Amount Section */}
            <div className="mt-[24px] flex flex-col items-center">
              <div className="flex items-baseline">
                <span className="text-[36px] font-bold text-black leading-none">₹</span>
                <input 
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={inputValue}
                  onChange={handleInputChange}
                  className="text-[36px] font-bold text-black border-none outline-none bg-transparent w-auto min-w-[40px] text-center p-0"
                  style={{ width: `${Math.max(1, inputValue.length) * 26}px` }}
                />
              </div>
              <span className="mt-[4px] text-[14px] font-medium text-[#A0A0A0]">
                Available balance after transfer: ₹{balanceAfter.toLocaleString()}
              </span>
            </div>

            {/* Custom Slider */}
            <div className="mt-[8px] w-full px-2">
              <input
                type="range"
                min={minWithdrawal}
                max={maxWithdrawal}
                step={100}
                value={withdrawAmount > maxWithdrawal ? maxWithdrawal : withdrawAmount}
                onChange={handleSliderChange}
                className="w-full h-[6px] rounded-full appearance-none cursor-pointer accent-[#5260FE]"
                style={{
                  background: `linear-gradient(to right, #5260FE 0%, #5260FE ${((withdrawAmount - minWithdrawal) / (maxWithdrawal - minWithdrawal)) * 100}%, #E0E0E0 ${((withdrawAmount - minWithdrawal) / (maxWithdrawal - minWithdrawal)) * 100}%, #E0E0E0 100%)`
                }}
              />
              <div className="mt-[8px] flex justify-between w-full">
                <span className="text-[14px] font-medium text-[#A0A0A0]">₹500</span>
                <span className="text-[14px] font-medium text-[#A0A0A0]">₹15,000</span>
              </div>
            </div>

            {/* Description */}
            <p className="mt-[8px] text-[14px] font-medium text-[#A0A0A0] leading-snug">
              Instant withdrawals are adjusted on your next payout based on your total earnings.
            </p>

            {/* Amount Breakdown */}
            <div className="mt-[16px] flex flex-col">
              <h3 className="text-[16px] font-bold text-black mb-[8px]">Amount breakdown</h3>

              <div className="flex justify-between items-center mb-[6px]">
                <span className="text-[14px] font-medium text-[#616161]">Transfer Amount:</span>
                <span className="text-[14px] font-medium text-black">+₹{withdrawAmount.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center mb-[6px]">
                <span className="text-[14px] font-medium text-[#616161]">Platform/Instant Fee:</span>
                <span className="text-[14px] font-medium text-black">-₹{platformFee}</span>
              </div>

              <div className="flex justify-between items-center mb-[6px]">
                <span className="text-[14px] font-medium text-[#616161]">TDS/Tax (if applicable):</span>
                <span className="text-[14px] font-medium text-black">₹{tds}</span>
              </div>

              <div className="flex justify-between items-center pt-1 border-t border-[#F5F5F5] mb-[6px]">
                <span className="text-[16px] font-bold text-black">Final Amount to Bank:</span>
                <span className="text-[16px] font-bold text-black text-right">₹{finalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Note */}
            <p className="mt-[34px] text-[12px] font-medium italic text-[#A0A0A0] text-center">
              Amount will be transferred to your Primary Bank Account
            </p>

            {/* Continue Button */}
            <button
              onClick={() => {
                onConfirm(withdrawAmount);
                navigate('/withdraw-success', { state: { amount: withdrawAmount } });
              }}
              disabled={isError}
              className={`mt-[16px] w-full h-[44px] rounded-full font-medium text-[16px] active:scale-[0.98] transition-all shadow-[0px_4px_12px_rgba(82,96,254,0.2)]
                ${isError ? 'bg-[#DFDFDF] text-white cursor-not-allowed' : 'bg-[#5260FE] text-white'}`}
            >
              Continue
            </button>
          </>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        /* Refined slider thumb size */
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          background: white;
          border: 3px solid #5260FE;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        input[type='range']::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: white;
          border: 3px solid #5260FE;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}} />
    </div>
  );
};

export default WithdrawBottomSheet;
