import React, { useEffect, useRef, useState } from 'react';
import crossIcon from '../assets/cross.svg';

interface HotlineBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
}

const HotlineBottomSheet: React.FC<HotlineBottomSheetProps> = ({
  isOpen,
  onClose,
  onBack,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [dragY, setDragY] = useState(0);
  const startY = useRef(0);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      setDragY(0);
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

  const satoshiMedium15 = "font-satoshi font-medium text-[15px] leading-tight";
  const satoshiMedium18 = "font-satoshi font-medium text-[18px] leading-tight";
  const letterSpacingValue = { letterSpacing: "-0.43px" };

  return (
    <div
      className={`fixed inset-0 z-[110] flex items-end justify-center transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Bottom Sheet Container */}
      <div
        className={`relative bg-white w-[362px] rounded-[24px] mb-[21px] flex flex-col z-10 transition-transform duration-300 shadow-[0_-8px_30px_rgb(0,0,0,0.12)] overflow-hidden`}
        style={{
          transform: `translateY(${isOpen ? `${dragY}px` : '100%'})`,
          fontFamily: "Satoshi, sans-serif"
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-[20px] pt-[20px] pb-[14px]">
          <h2 className={`${satoshiMedium18} text-black`} style={letterSpacingValue}>
            Safety hotline
          </h2>
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-full transition-opacity active:opacity-60"
          >
            <img src={crossIcon} alt="Close" className="w-[18px] h-[18px] brightness-0" />
          </button>
        </div>

        {/* Divider */}
        <div className="w-full h-[1px] bg-[#E0E0E0]" />

        {/* Content Section */}
        <div className="flex flex-col px-[20px] pt-[14px] pb-[28px] gap-[24px]">
          <p className={`${satoshiMedium15} text-black leading-[1.3] text-left`} style={letterSpacingValue}>
            Contact Grid.pe’s internal safety specialists to help you in certain situations.
          </p>
        </div>

        {/* Action Button Section */}
        <div className="px-[20px] pb-[20px]">
          <button
            onClick={() => {
              window.location.href = 'tel:0000000000'; // Placeholder helpline
            }}
            className="w-full h-[42px] bg-black rounded-full flex items-center justify-center text-white text-[16px] font-medium transition-all active:scale-[0.98] shadow-[0px_4px_16px_rgba(0,0,0,0.16)]"
            style={letterSpacingValue}
          >
            Call Grid.pe Safety Helpline
          </button>
        </div>
      </div>
    </div>
  );
};

export default HotlineBottomSheet;
