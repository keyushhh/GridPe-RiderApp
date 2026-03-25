import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import faceIdIcon from '../assets/face-id.svg';
import faceVerifiedIcon from '../assets/face-verified.svg';

interface DeliveryFallbackPopupsProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'mismatch' | 'waiting' | 'in_progress' | 'failure' | 'request_approval' | 'approved' | 'complete' | 'none';
  onNotifyCustomer: () => void;
  onRetry: () => void;
  onContactSupport: () => void;
  onOverrideRequest: () => void;
  onRequestApproval: () => void;
  onRecordVideo: () => void;
  onEnterVerificationCode: () => void;
}

const DeliveryFallbackPopups: React.FC<DeliveryFallbackPopupsProps> = ({
  isOpen,
  onClose,
  status,
  onNotifyCustomer,
  onRetry,
  onContactSupport,
  onOverrideRequest,
  onRequestApproval,
  onRecordVideo,
  onEnterVerificationCode,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={onClose}
          />
          
          {/* Popup Container */}
          <motion.div
            initial={{ y: 100, opacity: 0, x: "-50%" }}
            animate={{ y: 0, opacity: 1, x: "-50%" }}
            exit={{ y: 100, opacity: 0, x: "-50%" }}
            className="fixed bottom-[20px] left-1/2 w-[362px] h-auto bg-white rounded-[24px] p-[20px] pb-[25px] flex flex-col z-50 shadow-xl font-satoshi"
          >
            {status === 'mismatch' && (
              <div className="flex flex-col h-full">
                <div className="flex flex-col gap-[15px]">
                  <div className="flex items-center gap-[9px]">
                    <img
                      src={faceIdIcon}
                      alt="Face ID"
                      className="w-[30px] h-[30px]"
                    />
                    <h2 className="text-black font-bold text-[20px] tracking-[-0.43px] leading-tight">Verification Failed</h2>
                  </div>
                  <div className="flex flex-col gap-[4px] px-0">
                    <p className="text-black font-medium text-[14px] tracking-[-0.43px] leading-tight">
                      We couldn't confirm your identity.
                    </p>
                    <p className="mt-[4px] text-black font-medium text-[14px] tracking-[-0.43px] leading-tight">
                      Please try again in proper lighting and remove any face coverings.
                    </p>
                  </div>
                </div>

                <div className="mt-10 flex flex-col items-center">
                  <button
                    onClick={onRetry}
                    className="w-[330px] h-[44px] bg-[#5260FE] text-white rounded-full font-medium text-[16px] tracking-[-0.43px] transition-transform active:scale-[0.98]"
                  >
                    Retry Verification
                  </button>
                </div>
              </div>
            )}

            {status === 'failure' && (
              <div className="flex flex-col h-full">
                <div className="flex flex-col gap-[15px]">
                  <div className="flex items-center gap-[9px]">
                    <img
                      src={faceIdIcon}
                      alt="Face ID"
                      className="w-[30px] h-[30px]"
                      style={{ filter: 'invert(16%) sepia(89%) saturate(6054%) hue-rotate(358deg) brightness(97%) contrast(113%)' }}
                    />
                    <h2 className="text-black font-bold text-[20px] tracking-[-0.43px] leading-tight">Unable to verify identity</h2>
                  </div>
                  <div className="flex flex-col gap-[12px] px-0">
                    <p className="text-black font-medium text-[14px] tracking-[-0.43px] leading-tight">
                      We're having trouble confirming your identity.
                    </p>
                    <p className="mt-[4px] text-black font-medium text-[14px] tracking-[-0.43px] leading-tight">
                      For your safety and the customer's, please contact Rider Support to continue this delivery.
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex flex-col items-center gap-[12px]">
                  <button
                    onClick={onContactSupport}
                    className="w-[330px] h-[44px] bg-[#FF3B30] text-white rounded-full font-medium text-[16px] tracking-[-0.43px] transition-transform active:scale-[0.98]"
                  >
                    Contact Support
                  </button>
                  <button
                    onClick={onOverrideRequest}
                    className="w-[330px] h-[44px] bg-white border border-black text-black rounded-full font-medium text-[16px] tracking-[-0.43px] transition-transform active:scale-[0.98]"
                  >
                    Request Customer Override
                  </button>
                </div>
              </div>
            )}

            {status === 'request_approval' && (
              <div className="flex flex-col h-full">
                <div className="flex flex-col gap-[15px]">
                  <div className="flex items-center gap-[9px]">
                    <img
                      src={faceIdIcon}
                      alt="Face ID"
                      className="w-[30px] h-[30px]"
                    />
                    <h2 className="text-black font-bold text-[20px] tracking-[-0.43px] leading-tight">Request Customer Approval?</h2>
                  </div>
                  <div className="flex flex-col gap-[12px] px-0">
                    <p className="text-black font-medium text-[14px] tracking-[-0.43px] leading-[1.3]">
                      We couldn't verify your face. If you believe this is a mistake, you may request the customer's approval to continue the delivery.
                    </p>
                    <p className="mt-[4px] text-black font-medium text-[14px] leading-[1.3] tracking-[-0.43px]">
                      The customer will be asked to confirm your identity through the app.
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex flex-col items-center gap-[12px]">
                  <button
                    onClick={onRequestApproval}
                    className="w-[330px] h-[44px] bg-black text-white rounded-full font-medium text-[16px] tracking-[-0.43px] transition-transform active:scale-[0.98]"
                  >
                    Request Approval
                  </button>
                  <button
                    onClick={onClose}
                    className="w-[330px] h-[44px] bg-white border border-black text-black rounded-full font-medium text-[16px] tracking-[-0.43px] transition-transform active:scale-[0.98]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {status === 'waiting' && (
              <div className="flex flex-col h-full">
                <div className="flex flex-col gap-[15px]">
                  <div className="flex items-center gap-[9px]">
                    <img
                      src={faceIdIcon}
                      alt="Face ID"
                      className="w-[30px] h-[30px]"
                    />
                    <h2 className="text-black font-bold text-[20px] tracking-[-0.43px] leading-tight">Awaiting Customer Approval</h2>
                  </div>
                  <div className="flex flex-col gap-[4px] px-0">
                    <p className="text-black font-medium text-[14px] tracking-[-0.43px] leading-tight">
                      We've asked the customer to confirm your identity.
                    </p>
                    <p className="mt-[4px] text-black font-medium text-[14px] tracking-[-0.43px] leading-tight">
                      Please wait while the customer responds.
                    </p>
                  </div>
                </div>

                <div className="mt-10 flex flex-col items-center">
                  <div className="w-[330px] h-[44px] bg-[#FECB2E] text-white rounded-full flex items-center justify-center font-medium text-[16px] tracking-[-0.43px] cursor-not-allowed">
                    Pending
                  </div>
                </div>
              </div>
            )}

            {status === 'approved' && (
              <div className="flex flex-col h-full">
                <div className="flex flex-col gap-[15px]">
                  <div className="flex items-center gap-[9px]">
                    <img
                      src={faceIdIcon}
                      alt="Face ID"
                      className="w-[30px] h-[30px]"
                    />
                    <h2 className="text-black font-bold text-[20px] tracking-[-0.43px] leading-tight">Customer Approved</h2>
                  </div>
                  <div className="flex flex-col gap-[12px] px-0">
                    <p className="text-black font-medium text-[14px] tracking-[-0.43px] leading-tight">
                      The customer has allowed the delivery to proceed. Please record a short selfie video for verification.
                    </p>
                    <p className="mt-[4px] text-black font-medium text-[14px] tracking-[-0.43px] leading-tight">
                      Make sure to not cover your face, remove any masks, or helmets you may have on.
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex flex-col items-center">
                  <button
                    onClick={onRecordVideo}
                    className="w-[330px] h-[44px] bg-[#5260FE] text-white rounded-full font-medium text-[16px] tracking-[-0.43px] transition-transform active:scale-[0.98]"
                  >
                    Record Video
                  </button>
                </div>
              </div>
            )}

            {status === 'complete' && (
              <div className="flex flex-col h-full">
                <div className="flex flex-col gap-[15px]">
                  <div className="flex items-center gap-[9px]">
                    <img
                      src={faceVerifiedIcon}
                      alt="Verified Face"
                      className="w-[30px] h-[30px]"
                    />
                    <h2 className="text-black font-bold text-[20px] tracking-[-0.43px] leading-tight">Verification Complete</h2>
                  </div>
                  <div className="flex flex-col gap-[4px] px-0">
                    <p className="text-black font-medium text-[14px] tracking-[-0.43px] leading-[1.3]">
                      Your verification has been completed.
                      <br className="mb-1 block" />
                      You can now continue with this delivery.
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex flex-col items-center">
                  <button
                    onClick={onEnterVerificationCode}
                    className="w-[330px] h-[44px] bg-[#5260FE] text-white rounded-full font-medium text-[16px] tracking-[-0.43px] transition-transform active:scale-[0.98]"
                  >
                    Enter Verification Code
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DeliveryFallbackPopups;
