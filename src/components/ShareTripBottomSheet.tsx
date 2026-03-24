import React, { useEffect, useState, useRef } from 'react';
import crossIcon from '../assets/cross.svg';
import shareContactIcon from '../assets/share-contact.svg';

interface Contact {
  name: string;
  number: string;
}

interface ShareTripBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
}

const ShareTripBottomSheet: React.FC<ShareTripBottomSheetProps> = ({
  isOpen,
  onClose,
  onBack,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const startY = useRef(0);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      setDragY(0);
      // We keep contacts state to persist across openings in a single session
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

  const handleChooseContact = async () => {
    // If Contact Picker API is available, use it. Otherwise simulate for demo.
    const nav = navigator as any;
    if (nav.contacts && nav.contacts.select) {
      try {
        const props = ['name', 'tel'];
        const opts = { multiple: false };
        const selection = await nav.contacts.select(props, opts);
        if (selection && selection.length > 0) {
          const name = selection[0].name?.[0] || 'Unknown';
          const tel = selection[0].tel?.[0] || 'No number';
          if (contacts.length < 5) {
            setContacts(prev => [...prev, { name, number: tel }]);
          }
        }
      } catch (err) {
        console.error("Contact selection failed:", err);
        simulateContact();
      }
    } else {
      simulateContact();
    }
  };

  const simulateContact = () => {
    const demoContacts = [
      { name: "Rakesh", number: "9898989898" },
      { name: "Suresh", number: "12344565780" },
      { name: "Anjali", number: "9123456789" },
      { name: "Vikram", number: "9988776655" },
      { name: "Priya", number: "9112233445" }
    ];
    
    // Simple logic to add a new demo contact each time
    const nextIndex = contacts.length % demoContacts.length;
    if (contacts.length < 5) {
      setContacts(prev => [...prev, demoContacts[nextIndex]]);
    }
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
            Share my trip
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
          <div className="flex flex-col gap-[16px]">
            <p className={`${satoshiMedium15} text-black leading-[1.3] text-left`} style={letterSpacingValue}>
              Let friends and family follow along.
            </p>
            <p className={`${satoshiMedium15} text-black leading-[1.3] text-left`} style={letterSpacingValue}>
              {contacts.length > 0 
                ? "You can send people a link that shows your live location and trip details. You can add up to 5 emergency contacts."
                : "You can send people a link that shows your live location and trip details. Choose an emergency contact to keep a track of your trips."
              }
            </p>

            {/* Contacts List */}
            {contacts.length > 0 && (
              <div className="flex flex-col mt-[4px]">
                {contacts.map((contact, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between ${index < contacts.length - 1 ? 'border-b border-[#EDEDED]' : ''}`}
                    style={{ 
                      paddingBottom: index < contacts.length - 1 ? '3.5px' : '0', 
                      paddingTop: index > 0 ? '3.5px' : '0' 
                    }}
                  >
                    <span className={`${satoshiMedium15} text-[#676767]`} style={letterSpacingValue}>
                      {contact.name} - {contact.number}
                    </span>
                    <a 
                      href={`sms:${contact.number}?body=I'm sharing my live location with you: [Trackable Link Placeholder]`}
                      className="w-[32px] h-[32px] flex items-center justify-end opacity-80 active:opacity-60 transition-opacity"
                    >
                      <img src={shareContactIcon} alt="Share" className="w-[18px] h-[18px]" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Button Section */}
        <div className="px-[20px] pb-[20px]">
          <button
            onClick={handleChooseContact}
            disabled={contacts.length >= 5}
            className={`w-full h-[42px] bg-black rounded-full flex items-center justify-center text-white text-[16px] font-medium transition-all active:scale-[0.98] shadow-[0px_4px_12px_rgba(0,0,0,0.12)] ${contacts.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={letterSpacingValue}
          >
            {contacts.length > 0 ? "Choose Another Contact" : "Choose Contact"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareTripBottomSheet;
