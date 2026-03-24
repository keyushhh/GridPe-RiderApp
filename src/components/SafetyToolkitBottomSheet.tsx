import React, { useEffect, useState } from 'react';
import crossIcon from '../assets/cross.svg';
import alertTriangleIcon from '../assets/alert-triangle.svg';
import userShareIcon from '../assets/user-share.svg';
import phoneIcon from '../assets/phone.svg';
import navigationPointerIcon from '../assets/navigation-pointer.svg';

interface SafetyToolkitBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onEmergencyClick: () => void;
  onShareTripClick: () => void;
  onHotlineClick: () => void;
  locationName: string;
}

const SafetyToolkitBottomSheet: React.FC<SafetyToolkitBottomSheetProps> = ({
  isOpen,
  onClose,
  onEmergencyClick,
  onShareTripClick,
  onHotlineClick,
  locationName
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [dragY, setDragY] = useState(0);
  const startY = React.useRef(0);

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

  const satoshiMedium12 = "font-satoshi font-medium text-[12px] leading-tight";
  const satoshiMedium14 = "font-satoshi font-medium text-[14px] leading-tight";
  const letterSpacingValue = { letterSpacing: "-0.43px" };

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
        {/* Drag Handle */}
        <div className="w-[40px] h-[4px] bg-[#E0E0E0] rounded-full mx-auto mt-[12px]" />

        {/* Header */}
        <div className="flex items-center justify-between px-[20px] pt-[20px] pb-[14px]">
          <h2 className="text-[22px] font-bold text-black leading-tight" style={letterSpacingValue}>
            Your Safety is our priority!
          </h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white transition-opacity active:opacity-60"
          >
            <img src={crossIcon} alt="Close" className="w-[18px] h-[18px] opacity-100" />
          </button>
        </div>

        {/* Divider */}
        <div className="w-full h-[1px] bg-[#E0E0E0]" />

        {/* Content Section */}
        <div className="flex flex-col px-[20px] pt-[14px] pb-[28px] gap-[18px]">
          {/* Emergency Assistance */}
          <div 
            className="flex items-start gap-[12px] cursor-pointer transition-opacity active:opacity-60"
            onClick={() => {
              onClose();
              onEmergencyClick();
            }}
          >
            <div className="w-[18px] h-[18px] mt-[2px] shrink-0">
              <img src={alertTriangleIcon} alt="Emergency" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className={`${satoshiMedium12} text-[#676767]/60`} style={letterSpacingValue}>Emergency assistance</span>
              <span className={`${satoshiMedium14} text-black mt-[2px]`} style={letterSpacingValue}>Contact emergency services</span>
            </div>
          </div>

          {/* Share my trip */}
          <div 
            className="flex items-start gap-[12px] cursor-pointer transition-opacity active:opacity-60"
            onClick={() => {
              onClose();
              onShareTripClick();
            }}
          >
            <div className="w-[18px] h-[18px] mt-[2px] shrink-0">
              <img src={userShareIcon} alt="Share" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className={`${satoshiMedium12} text-[#676767]/60`} style={letterSpacingValue}>Share my trip</span>
              <span className={`${satoshiMedium14} text-black mt-[2px]`} style={letterSpacingValue}>Share your location and trip status</span>
            </div>
          </div>

          {/* Safety hotline */}
          <div 
            className="flex items-start gap-[12px] cursor-pointer transition-opacity active:opacity-60"
            onClick={() => {
              onClose();
              onHotlineClick();
            }}
          >
            <div className="w-[18px] h-[18px] mt-[2px] shrink-0">
              <img src={phoneIcon} alt="Hotline" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className={`${satoshiMedium12} text-[#676767]/60`} style={letterSpacingValue}>Safety hotline</span>
              <span className={`${satoshiMedium14} text-black mt-[2px]`} style={letterSpacingValue}>A direct phone line to Grid.pe's internal safety specialists</span>
              <p className={`${satoshiMedium14} text-black mt-[8px]`} style={letterSpacingValue}>
                For health or vehicle damage during ongoing deliveries, you can contact the safety hotline.
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-[1px] bg-[#E0E0E0]" />

        {/* Footer Content */}
        <div className="flex flex-col px-[20px] pt-[15px] pb-[20px]">
          <p className={`${satoshiMedium12} text-black text-left mb-[8px]`} style={letterSpacingValue}>
            Your live location will be shared with emergency services
          </p>
          <div className="flex items-start gap-[12px]">
            <div className="w-[24px] h-[24px] mt-[2px] shrink-0">
              <img src={navigationPointerIcon} alt="Location" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className={`${satoshiMedium12} text-[#676767]/60`} style={letterSpacingValue}>Estimated location</span>
              <span className={`${satoshiMedium14} text-black mt-[2px]`} style={letterSpacingValue}>{locationName}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetyToolkitBottomSheet;
