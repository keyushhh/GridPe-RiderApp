import React, { useState, useRef, useEffect } from 'react';
import awaitingIcon from '../assets/awaiting.svg';
import verifiedIcon from '../assets/verified.svg';

interface DeliveryOTPModalProps {
  onClose: () => void;
  onVerify: (otp: string) => void;
}

const DeliveryOTPModal: React.FC<DeliveryOTPModalProps> = ({ onClose, onVerify }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerified, setIsVerified] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  useEffect(() => {
    const fullOtp = otp.join('');
    if (fullOtp.length === 6) {
      setIsVerified(true);
    } else {
      setIsVerified(false);
    }
  }, [otp]);

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center pb-[25px]">
      {/* Blurry Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container: 362x324px */}
      <div
        className="relative bg-white w-[362px] h-[324px] rounded-[24px] shadow-[0px_8px_32px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden px-[16px] pt-[16px]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-satoshi font-bold text-[20px] text-black text-left">Confirm Delivery</h2>
        <p className="mt-[8px] font-satoshi font-medium text-[14px] text-black leading-tight text-left">
          Enter the 6-digit verification code provided by the customer to confirm delivery.
        </p>

        {/* OTP Inputs */}
        <div className="mt-[29px] flex justify-between gap-[8px]">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-[48px] h-[68px] bg-[#F7F8FA] border border-[#E6E8EB] rounded-[7px] text-center font-satoshi font-bold text-[24px] text-black focus:outline-none focus:border-[#5260FE] transition-colors"
            />
          ))}
        </div>

        {/* Status Indicator */}
        <div className="mt-[15px] flex items-center">
          <img 
            src={isVerified ? verifiedIcon : awaitingIcon} 
            alt="Status" 
            className="w-[16px] h-[16px]" 
          />
          <span className={`ml-[13px] font-satoshi font-medium text-[14px] ${isVerified ? 'text-[#34C759]' : 'text-[#616161]'}`}>
            {isVerified ? "OTP Verified" : "Awaiting OTP verification"}
          </span>
        </div>

        {/* CTA Button */}
        <div className="mt-[38px] mb-[25px]">
          <button
            onClick={() => onVerify(otp.join(''))}
            disabled={otp.some(digit => digit === '')}
            className={`w-[330px] h-[44px] rounded-full text-white font-satoshi font-normal text-[16px] transition-all
              ${!otp.some(digit => digit === '') ? 'bg-[#5260FE] active:scale-95' : 'bg-[#5260FE]/50 cursor-not-allowed'}`}
          >
            Verify Code
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryOTPModal;
