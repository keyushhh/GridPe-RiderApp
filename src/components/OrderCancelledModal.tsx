import React, { useEffect, useState } from 'react';
import crossCircleIcon from '../assets/cross-circle.svg';

interface OrderCancelledModalProps {
  onDismiss: () => void;
}

const OrderCancelledModal: React.FC<OrderCancelledModalProps> = ({ onDismiss }) => {
  const [timeLeft, setTimeLeft] = useState(4);

  useEffect(() => {
    const isPersistent = new URLSearchParams(window.location.search).get('persist') === 'true';
    
    if (timeLeft <= 0 && !isPersistent) {
      onDismiss();
      return;
    }

    if (isPersistent && timeLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onDismiss]);

  return (
    <div className="fixed inset-0 z-[999] flex items-end justify-center pb-[24px]">
      {/* Blurry Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal Container */}
      <div className="relative bg-white w-[362px] rounded-[24px] shadow-[0px_8px_32px_rgba(0,0,0,0.12)] p-8 flex flex-col items-center">
        {/* Red Warning Icon */}
        <div className="w-[60px] h-[60px] bg-[#FEF2F2] rounded-full flex items-center justify-center mb-6">
          <img src={crossCircleIcon} alt="Cancelled" className="w-[32px] h-[32px]" />
        </div>

        <h2 className="font-satoshi font-bold text-[20px] text-black mb-2">Order Cancelled</h2>
        <p className="font-satoshi font-medium text-[15px] text-black/60 text-center mb-8 leading-tight">
          This order was cancelled by the customer. No further action is required.
        </p>

        <div className="w-full bg-[#F5F5F5] rounded-full h-[6px] mb-4 overflow-hidden">
          <div 
            className="h-full bg-[#EF4444] transition-all duration-1000 ease-linear"
            style={{ width: `${(timeLeft / 4) * 100}%` }}
          />
        </div>
        
        <p className="font-satoshi font-bold text-[14px] text-black/40">
          Returning to home in {timeLeft}s...
        </p>
      </div>
    </div>
  );
};

export default OrderCancelledModal;
