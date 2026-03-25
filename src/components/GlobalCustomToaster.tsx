import { useEffect, useState } from "react";
import { useToast } from "../context/ToastContext";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

// Assets
import toasterSuccess from "../assets/toaster-success.svg";
import toasterError from "../assets/toaster-error.svg";
import toasterTrash from "../assets/toaster-trash.svg";

const GlobalCustomToaster = () => {
  const { toast, hideToast } = useToast();
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (toast) {
      setProgress(100);
      const startTime = Date.now();
      const duration = 4000;

      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
        setProgress(remaining);

        if (elapsed >= duration) {
          clearInterval(interval);
          hideToast();
        }
      }, 10);

      return () => clearInterval(interval);
    }
  }, [toast, hideToast]);

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return toasterSuccess;
      case 'error': return toasterError;
      case 'delete': return toasterTrash;
      default: return toasterSuccess;
    }
  };

  const getRadialGradient = () => {
    switch (toast.type) {
      case 'success':
        return "radial-gradient(50% 50% at 50% 50%, rgba(0, 237, 81, 0.12) 0%, rgba(0, 237, 123, 0) 100%)";
      case 'error':
      case 'delete':
        return "radial-gradient(50% 50% at 50% 50%, rgba(240, 66, 72, 0.13) 0%, rgba(240, 66, 72, 0) 100%)";
      default:
        return "none";
    }
  };

  const getLoaderColor = () => {
    switch (toast.type) {
      case 'success': return "#00ED51";
      case 'error':
      case 'delete': return "#F04248";
      default: return "#00ED51";
    }
  };

  return (
    <AnimatePresence>
      {toast && (
        <div className="fixed bottom-8 left-0 right-0 z-[100] flex justify-center pointer-events-none px-5">
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.3 }}
            className="flex items-center pointer-events-auto relative overflow-hidden bg-white"
            style={{
              width: '362px',
              minHeight: '63px',
              borderRadius: '12px',
              border: '0.8px solid rgba(0, 0, 0, 0.08)',
              padding: '12px 14px',
            }}
          >
            {/* Radial Gradient behind icon */}
            <div
              className="absolute pointer-events-none"
              style={{
                width: '230px',
                height: '230px',
                left: '-90px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: getRadialGradient(),
                zIndex: 0
              }}
            />

            {/* Message Content */}
            <div className="relative z-10 flex items-center w-full gap-3">
              <img src={getIcon()} alt="" className="w-[35px] h-[35px] object-contain" />
              <span className="flex-1 text-black text-[14px] font-satoshi leading-[140%] font-normal">
                {toast.message}
              </span>
              <button 
                onClick={hideToast}
                className="p-1 hover:bg-black/5 rounded-full transition-colors flex items-center justify-center shrink-0"
              >
                <X className="w-5 h-5 text-black/50" />
              </button>
            </div>

            {/* Animated Loader Line */}
            <div
              className="absolute bottom-0 left-0 h-[2px]"
              style={{
                width: `${progress}%`,
                backgroundColor: getLoaderColor(),
              }}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default GlobalCustomToaster;
