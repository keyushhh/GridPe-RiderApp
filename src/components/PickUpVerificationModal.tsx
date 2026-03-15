import faceIdIcon from '../assets/face-id.svg';
import faceVerifiedIcon from '../assets/face-verified.svg';

interface PickUpVerificationModalProps {
  onStart: () => void;
  onClose: () => void;
  isVerified?: boolean;
  riderName?: string;
  verifiedCTA?: string;
}

const PickUpVerificationModal: React.FC<PickUpVerificationModalProps> = ({ 
  onStart, 
  onClose, 
  isVerified = false,
  riderName = "Rider",
  verifiedCTA = "Pick Up"
}) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center pb-[25px]">
      {/* Blurry Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container: 362x293px (Standard) or 362x235px (Verified) */}
      <div
        className={`relative bg-white w-[362px] ${isVerified ? 'h-[235px]' : 'h-[293px]'} rounded-[24px] shadow-[0px_8px_32px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden transition-all duration-300`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Icon + Title */}
        <div className="mt-[25px] ml-[16px] flex items-center">
          <img 
            src={isVerified ? faceVerifiedIcon : faceIdIcon} 
            alt={isVerified ? "Verified" : "Face ID"} 
            className="w-[30px] h-[30px]" 
          />
          <h2 className="ml-[9px] font-satoshi font-bold text-[20px] text-black">
            {isVerified ? "Verified" : "Verify your identity"}
          </h2>
        </div>

        {/* Sub-heading */}
        <div className="mt-[15px] px-[16px]">
          <p className="font-satoshi font-medium text-[14px] text-black leading-tight">
            {isVerified 
              ? `Thanks for keeping Grid.pe safe! You have been verified, ${riderName}!` 
              : "For safety, Grid.pe must confirm your identity before you pick up cash."
            }
          </p>
          
          {isVerified && (
            <p className="mt-[8px] font-satoshi font-medium text-[14px] text-black leading-tight">
              You may now proceed with the order pickup.
            </p>
          )}
        </div>

        {!isVerified && (
          /* Body Text: Bullets */
          <div className="mt-[15px] px-[16px]">
            <ul className="list-none space-y-1">
              <li className="flex items-start">
                <span className="mr-2 text-[#616161]">•</span>
                <span className="font-satoshi font-medium text-[14px] text-[#616161]">
                  Prevents unauthorized riders from collecting cash
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-[#616161]">•</span>
                <span className="font-satoshi font-medium text-[14px] text-[#616161]">
                  Quick face scan required
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-[#616161]">•</span>
                <span className="font-satoshi font-medium text-[14px] text-[#616161]">
                  Helps maintain platform security
                </span>
              </li>
            </ul>
          </div>
        )}

        {/* CTA Button */}
        <div className="mt-auto mb-[25px] px-[16px]">
          <button
            onClick={onStart}
            className="w-[330px] h-[44px] bg-[#5260FE] rounded-full text-white font-satoshi font-normal text-[16px] tracking-[-0.43px] active:scale-95 transition-transform"
          >
            {isVerified ? verifiedCTA : "Start Verification"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PickUpVerificationModal;
