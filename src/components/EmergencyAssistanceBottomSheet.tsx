import React, { useEffect, useRef, useState } from 'react';
import crossIcon from '../assets/cross.svg';
import navigationPointerIcon from '../assets/navigation-pointer.svg';
import swipeIcon from '../assets/swipe.svg';

interface EmergencyAssistanceBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  locationName: string;
}

const EmergencyAssistanceBottomSheet: React.FC<EmergencyAssistanceBottomSheetProps> = ({
  isOpen,
  onClose,
  onBack,
  locationName
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isAlerted, setIsAlerted] = useState(false);
  const [dragY, setDragY] = useState(0);
  const startY = useRef(0);

  // Swipe button state
  const [swipeX, setSwipeX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const swipeStartX = useRef(0);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      setDragY(0);
      setSwipeX(0);
      setIsAlerted(false);
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

  // Swipe handle logic
  const onSwipeStart = (e: React.TouchEvent) => {
    swipeStartX.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const onSwipeMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - swipeStartX.current;
    const containerWidth = 322; // 362 - 20 - 20
    const handleWidth = 56;
    const limit = containerWidth - handleWidth - 8; // 4px + 4px padding

    if (deltaX > 0) {
      setSwipeX(Math.min(deltaX, limit));
    }
  };

  const onSwipeEnd = () => {
    const containerWidth = 322;
    const handleWidth = 56;
    const limit = containerWidth - handleWidth - 8;

    if (swipeX > limit * 0.8) {
      setSwipeX(limit);
      setIsAlerted(true);
      // Demo alerts: no real back-end call as per user request.
      setTimeout(() => {
        window.location.href = 'tel:100';
      }, 300);
    } else {
      setSwipeX(0);
    }
    setIsSwiping(false);
  };

  if (!isOpen && !isAnimating) return null;

  const satoshiMedium12 = "font-satoshi font-medium text-[12px] leading-tight";
  const satoshiMedium14 = "font-satoshi font-medium text-[14px] leading-tight";
  const satoshiMedium15 = "font-satoshi font-medium text-[15px] leading-tight";
  const satoshiMedium16 = "font-satoshi font-medium text-[16px] leading-tight";
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
            Emergency assistance
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
          <p className={`${satoshiMedium15} text-black font-medium leading-[1.3] text-left`} style={letterSpacingValue}>
            Please ensure you use this when in critical and uncontrollable situations only.
          </p>

          <div className="flex flex-col gap-[8px]">
            <p className={`${satoshiMedium12} text-black text-left`} style={letterSpacingValue}>
              Your live location will be shared with emergency services
            </p>
            <div className="flex items-start gap-[12px]">
              <div className="w-[24px] h-[24px] mt-[4px] shrink-0 flex items-center justify-center">
                <img src={navigationPointerIcon} alt="Location" className="w-[24px] h-[24px] object-contain" />
              </div>
              <div className="flex flex-col">
                <span className={`${satoshiMedium12} text-[#676767]/60`} style={letterSpacingValue}>Estimated location</span>
                <span className={`${satoshiMedium14} text-black font-bold mt-[2px]`} style={letterSpacingValue}>{locationName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Swipe Button Section */}
        <div className="px-[20px] pb-[20px]">
          <div className="relative w-full h-[64px] bg-[#FF0000] rounded-full flex items-center p-[4px] overflow-hidden">
            {/* Track Text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-white text-[16px] font-medium" style={letterSpacingValue}>
                {isAlerted ? "Local Police Alerted" : "Swipe for Local Police"}
              </span>
            </div>

            {/* Draggable Handle */}
            <div
              className="relative z-10 w-[56px] h-[56px] cursor-grab active:cursor-grabbing"
              style={{ transform: `translateX(${swipeX}px)` }}
              onTouchStart={onSwipeStart}
              onTouchMove={onSwipeMove}
              onTouchEnd={onSwipeEnd}
            >
              <img src={swipeIcon} alt="Swipe" className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyAssistanceBottomSheet;
