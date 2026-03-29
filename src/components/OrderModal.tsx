import React, { useEffect, useState } from 'react';

interface OrderModalProps {
  order: any;
  onAccept: (orderId: string) => void;
  onReject: () => void;
  onClose: () => void;
}

const OrderModal: React.FC<OrderModalProps> = ({ order, onAccept, onReject, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(30);
  const totalTime = 30;

  useEffect(() => {
    if (timeLeft <= 0) {
      onClose();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onClose]);

  if (!order) return null;

  // SVG dimensions for the badge
  const width = 108;
  const height = 33;
  const rx = height / 2;
  // Perimeter of the pill shape
  const perimeter = 2 * (width - height) + Math.PI * height;
  const strokeDashoffset = (timeLeft / totalTime) * perimeter;

  const isLastTenSeconds = timeLeft <= 10;
  const strokeColor = isLastTenSeconds ? "#EF4444" : "#5260FE"; // Red-500 or Primary Purple

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center pb-[25px]">
      {/* Blurry Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className="relative bg-white w-[362px] h-[520px] rounded-[24px] shadow-[0px_8px_32px_rgba(0,0,0,0.12)] flex flex-col items-center overflow-visible"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Timer Badge: Center aligned, half inside half outside */}
        <div
          className="absolute top-[-16.5px] left-1/2 -translate-x-1/2 w-[108px] h-[33px] bg-white rounded-full flex items-center justify-center z-[110]"
        >
          {/* SVG for animated stroke */}
          <svg
            width={width}
            height={height}
            className="absolute inset-0"
          >
            {/* Define the pill path starting from top center, going clockwise */}
            <path
              id="pill-path"
              d="M 54 0.5 L 91.5 0.5 A 16 16 0 0 1 91.5 32.5 L 16.5 32.5 A 16 16 0 0 1 16.5 0.5 L 54 0.5"
              fill="none"
              stroke="black"
              strokeWidth="1"
            />
            {/* Progress Stroke */}
            <path
              d="M 54 0.5 L 91.5 0.5 A 16 16 0 0 1 91.5 32.5 L 16.5 32.5 A 16 16 0 0 1 16.5 0.5 L 54 0.5"
              fill="none"
              stroke={strokeColor}
              strokeWidth="2"
              strokeDasharray={perimeter}
              strokeDashoffset={perimeter - strokeDashoffset}
              className="transition-all duration-1000 linear"
              strokeLinecap="round"
            />
          </svg>

          <span className="relative z-10 font-satoshi font-bold text-[18px] text-black">
            {timeLeft}s
          </span>
        </div>

        {/* Modal Content */}
        <div className="mt-[30.5px] flex flex-col items-center w-full px-4 text-center">
          <h2 className="font-satoshi font-medium text-[14px] text-black">
            New Order Request
          </h2>
          <div
            className="mt-[1px] font-satoshi font-bold text-[36px] text-black"
            style={{ letterSpacing: '-0.43px' }}
          >
            ₹{order.rider_earnings || 0}
          </div>
        </div>

        <div className="mt-2 w-full h-[1px] bg-[#D9D9D9]" />

        {/* Pickup Container */}
        <div className="mt-4 w-[330px] h-[100px] rounded-[14px] border border-[#EDEDED] relative p-[10px_13px_10px_16px] flex flex-col">
          <div className="flex justify-between items-start leading-none">
            <span className="font-satoshi font-bold text-[12px] text-black/50 tracking-[2px]">
              PICKUP FROM
            </span>
            <span className="font-satoshi font-medium text-[14px] text-black" style={{ letterSpacing: '-0.43px' }}>
              3 mins away
            </span>
          </div>

          <div className="mt-1 text-left leading-none">
            <div className="font-satoshi font-medium text-[14px] text-black">
              {order.pickup_name || order.hub_name || "Pickup Hub"}
            </div>
            <div className="mt-[6px] font-satoshi font-medium text-[14px] text-black/60">
              {order.pickup_address || order.pickup_location || "Loading address..."}
            </div>
          </div>
        </div>

        {/* Order Details Header */}
        <div className="mt-4 w-[330px] flex justify-start">
          <h3 className="font-satoshi font-medium text-[15px] text-black">
            Order Details
          </h3>
        </div>

        {/* Order Details Container */}
        <div className="mt-2 w-[330px] h-auto rounded-[14px] border border-[#EDEDED] flex flex-col p-3.5">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center leading-none">
              <span className="font-satoshi font-medium text-[14px] text-black/50">Your Earning:</span>
              <span className="font-satoshi font-bold text-[14px] text-black">₹{order.rider_earnings || 0}</span>
            </div>
            <div className="flex justify-between items-center leading-none">
              <span className="font-satoshi font-medium text-[14px] text-black/50">Distance:</span>
              <span className="font-satoshi font-bold text-[14px] text-black">{order.distance || "2.1"} km</span>
            </div>
          </div>

          <div className="mt-4 mb-3 w-[330px] -ml-3.5 h-[1px] bg-[#D9D9D9]" />

          <p className="font-satoshi font-medium text-[14px] text-black text-left leading-tight">
            Customer details will unlock once the order is accepted.
          </p>
        </div>

        {/* CTAs */}
        <div className="mt-4 flex flex-col gap-2 w-full px-[14.5px]">
          <button
            onClick={() => onAccept(order.id)}
            className="w-[333px] h-[44px] bg-[#5260FE] rounded-full text-white font-satoshi font-medium text-[16px] active:scale-95 transition-transform"
          >
            Accept Order
          </button>
          <button
            onClick={onReject}
            className="w-[333px] h-[44px] bg-[#DEDEDE] rounded-full text-black font-satoshi font-medium text-[16px] active:scale-95 transition-transform"
          >
            Reject Order
          </button>
        </div>

        {/* Footer Text */}
        <div className="mt-4 mb-6 w-full pl-[30px] text-left">
          <p className="font-satoshi font-medium text-[12px] text-black" style={{ letterSpacing: '-0.43px' }}>
            Frequent rejections may affect your reliability score.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;
