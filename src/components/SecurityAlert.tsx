import React from 'react';
import { ShieldAlert, X } from 'lucide-react';

interface SecurityAlertProps {
  message: string;
  onClose: () => void;
}

const SecurityAlert: React.FC<SecurityAlertProps> = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Alert Box */}
      <div className="relative bg-white w-full max-w-[340px] rounded-[24px] p-6 flex flex-col items-center shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8 text-red-500" />
        </div>
        
        <h2 className="text-[20px] font-bold text-black mb-2">Security Alert</h2>
        
        <p className="text-[14px] text-gray-600 text-center mb-8 leading-relaxed">
          {message}
        </p>
        
        <button
          onClick={onClose}
          className="w-full h-12 bg-black text-white rounded-full font-bold text-[16px] transition-transform active:scale-95"
        >
          Try Again
        </button>
        
        <button
          onClick={onClose}
          className="mt-4 text-[14px] font-medium text-gray-400 hover:text-gray-600"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};

export default SecurityAlert;
