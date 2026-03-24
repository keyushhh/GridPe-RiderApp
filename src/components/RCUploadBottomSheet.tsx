import React, { useEffect, useState } from 'react';
import fileIcon from '../assets/file.svg';
import uploadIcon from '../assets/share-contact.svg';

interface RCUploadBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
}

const RCUploadBottomSheet: React.FC<RCUploadBottomSheetProps> = ({
  isOpen,
  onClose,
  onUpload,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [dragY, setDragY] = useState(0);
  const startY = React.useRef(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      setDragY(0);
      setSelectedFile(null);
      setError(null);
    } else {
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please upload a PDF file.');
        setSelectedFile(null);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB.');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

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

  return (
    <div className={`fixed inset-0 z-[100] flex items-end justify-center transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="application/pdf"
        className="hidden"
      />

      {/* Bottom Sheet Container */}
      <div
        className={`relative bg-white w-[362px] rounded-[24px] mb-[21px] flex flex-col pt-[12px] px-[14px] pb-[14px] z-10 transition-transform duration-300`}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ transform: `translateY(${isOpen ? `${dragY}px` : '100%'})` }}
      >
        {/* Drag Handle */}
        <div className="w-[40px] h-[4px] bg-[#E0E0E0] rounded-full mx-auto mb-6" />

        {/* Header with Icon */}
        <div className="flex items-center gap-3 mb-2">
          <img src={fileIcon} alt="RC" className="w-6 h-6 object-contain" />
          <h2 className="font-bold text-[20px] text-black leading-tight">
            Registration Certificate (RC)
          </h2>
        </div>

        <p className="text-[14px] font-medium text-black leading-tight mb-6">
          Please upload your vehicle’s registration certificate.
        </p>

        {/* Upload Area */}
        <div 
            onClick={triggerFileSelect}
            className={`w-full h-[155px] rounded-[16px] border border-dashed flex flex-col items-center justify-center bg-white mb-6 cursor-pointer transition-colors ${selectedFile ? 'border-[#5260FE] bg-[#5260FE]/5' : 'border-[#E9EAEB]'}`}
        >
          <img src={uploadIcon} alt="Upload" className="w-6 h-6 mb-4 object-contain" />
          <p className="text-[14px] font-normal text-[#A0A0A0] text-center leading-tight px-4">
            {selectedFile ? selectedFile.name : 'Please upload a PDF document (Max size: 10MB)'}
          </p>
          {error && <p className="text-[12px] text-red-500 mt-2">{error}</p>}
        </div>

        {/* Upload Button */}
        <button
          onClick={() => {
              if (selectedFile) {
                  onUpload(selectedFile);
                  onClose();
              }
          }}
          disabled={!selectedFile}
          className={`w-full h-[44px] rounded-full font-medium text-[16px] transition-all active:scale-[0.98] flex items-center justify-center shadow-[0px_4px_12px_rgba(82,96,254,0.2)] ${
              selectedFile ? 'bg-[#5260FE] text-white opacity-100' : 'bg-[#EBEBEB] text-[#A0A0A0] cursor-not-allowed border border-[#E9EAEB]'
          }`}
        >
          Upload
        </button>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}} />
    </div>
  );
};

export default RCUploadBottomSheet;
