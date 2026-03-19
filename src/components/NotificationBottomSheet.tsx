import React from 'react';
import notificationImage from '../assets/notification-sheet.png';

interface NotificationBottomSheetProps {
  onClose: () => void;
  onEnable: () => void;
  onDecline: () => void;
}

const NotificationBottomSheet: React.FC<NotificationBottomSheetProps> = ({
  onClose,
  onEnable,
  onDecline
}) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Bottom Sheet Container */}
      <div
        className="relative bg-white w-[393px] rounded-t-[40px] shadow-[0px_-8px_32px_rgba(0,0,0,0.12)] flex flex-col items-center pt-[12px] px-[24px] pb-[40px] animate-slide-up z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Handle */}
        <div className="w-[85px] h-[6px] bg-[#E0E0E0] rounded-full mb-[40px]" />

        {/* Center Image */}
        <div className="w-full flex justify-center mb-[32px]">
          <img
            src={notificationImage}
            alt="Notifications"
            className="w-[280px] h-auto object-contain"
          />
        </div>

        {/* Title */}
        <h2 className="font-satoshi font-bold text-[22px] text-black text-center leading-tight">
          Instant updates at your fingertips
        </h2>

        {/* Description */}
        <p className="mt-[16px] font-satoshi font-medium text-[16px] text-black/70 text-center leading-snug w-[300px]">
          Enable notifications to stay connected with your wallets activity.
        </p>

        {/* Buttons */}
        <div className="mt-[48px] w-full flex flex-col items-center gap-[24px]">
          <button
            onClick={onEnable}
            className="w-full h-[52px] bg-[#5260FE] rounded-full text-white font-satoshi font-medium text-[16px] active:scale-[0.98] transition-transform"
          >
            Enable Notification
          </button>

          <button
            onClick={onDecline}
            className="font-satoshi font-medium text-[16px] text-black underline underline-offset-4 active:opacity-70 transition-opacity"
          >
            No Thanks
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default NotificationBottomSheet;
