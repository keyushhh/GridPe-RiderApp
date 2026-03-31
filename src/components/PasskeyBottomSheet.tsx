import React from 'react';
import faceIdIcon from '../assets/face-id.svg';

interface PasskeyBottomSheetProps {
  onClose: () => void;
  onAddPasskey: () => void;
  onOtherDevice: () => void;
  identifier?: string;
  onSwitchToPersonalInfo?: () => void;
}

const PasskeyBottomSheet: React.FC<PasskeyBottomSheetProps> = ({
  onClose,
  onAddPasskey,
  onOtherDevice,
  identifier,
  onSwitchToPersonalInfo
}) => {
  const isEmailMissing = !identifier;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Bottom Sheet Container */}
      <div
        className="relative bg-white w-[393px] rounded-t-[24px] shadow-[0px_-8px_32px_rgba(0,0,0,0.12)] flex flex-col pt-[24px] px-[24px] pb-[40px] animate-slide-up z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-[20px] right-[20px] w-[32px] h-[32px] flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L13 13M1 13L13 1" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Large Face ID Icon */}
        <div className="mt-[20px] flex justify-start">
          <img
            src={faceIdIcon}
            alt="Face ID"
            className="w-[64px] h-[64px]"
          />
        </div>

        {/* Title */}
        <h2 className="mt-[24px] font-satoshi font-bold text-[32px] text-black leading-tight">
          Add a passkey?
        </h2>

        {/* Description */}
        <p className="mt-[16px] font-satoshi font-medium text-[16px] text-black leading-snug">
          Grid.pe supports passkeys, a stronger alternative that cannot be leaked or stolen.
          {isEmailMissing ? (
            " Add your email ID to enable passkeys as a secure login method."
          ) : (
            ` A passkey for \u201C${identifier}\u201D will be saved in \u201CPasswords\u201D.`
          )}
        </p>

        {/* Buttons */}
        <div className="mt-[40px] flex flex-col gap-[12px]">
          <button
            onClick={onAddPasskey}
            disabled={isEmailMissing}
            className={`w-full h-[48px] rounded-full font-satoshi font-medium text-[16px] transition-all ${isEmailMissing ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-black text-white active:scale-[0.98]'}`}
          >
            Add Passkey
          </button>

          {!isEmailMissing && (
            <button
              onClick={onOtherDevice}
              className="w-full h-[48px] bg-white border border-black rounded-full text-black font-satoshi font-medium text-[16px] active:scale-[0.98] transition-transform"
            >
              Save on Other Device
            </button>
          )}

          {isEmailMissing && (
            <p className="px-4 text-center font-satoshi font-medium text-[14px] leading-tight">
              <span className="text-amber-600">Email ID is required to enable Passkeys. Please add it in </span>
              <button
                onClick={onSwitchToPersonalInfo}
                className="text-[#5260FE] underline font-bold active:opacity-70 transition-opacity"
              >
                Personal Info
              </button>
              <span className="text-[#5260FE]">.</span>
            </p>
          )}
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

export default PasskeyBottomSheet;
