import React, { useEffect, useState } from 'react';

export interface SupportStatusStep {
    label: string;
    timestamp?: string;
    description?: string;
    buttonText?: string;
    status: 'completed' | 'in_progress' | 'pending';
}

interface SupportStatusBottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    ticketId: string;
    ticketTitle: string;
    ticketAmount?: string;
    steps: SupportStatusStep[];
    isResolved?: boolean;
    onUploadComplete?: () => void;
    variant?: 'compact' | 'detailed';
    ticketDescription?: string;
    footerNote?: string;
}

const SupportStatusBottomSheet: React.FC<SupportStatusBottomSheetProps> = ({
    isOpen,
    onClose,
    ticketId,
    ticketTitle,
    ticketAmount,
    steps,
    isResolved = false,
    onUploadComplete,
    variant = 'compact',
    ticketDescription,
    footerNote
}) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [dragY, setDragY] = useState(0);
    const [visibleCount, setVisibleCount] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const wasOpenRef = React.useRef(false);
    const startY = React.useRef(0);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Handle open/close transitions
    useEffect(() => {
        if (isOpen) {
            setIsAnimating(true);
            setDragY(0);

            // Resolved tickets: show everything instantly, no animation
            if (isResolved) {
                setVisibleCount(steps.length);
                wasOpenRef.current = true;
                return;
            }

            // Fresh open (was previously closed): animate from step 1
            if (!wasOpenRef.current) {
                setVisibleCount(0);
                const interval = setInterval(() => {
                    setVisibleCount(prev => {
                        if (prev < steps.length) return prev + 1;
                        clearInterval(interval);
                        return prev;
                    });
                }, 600);
                wasOpenRef.current = true;
                return () => clearInterval(interval);
            }
        } else {
            wasOpenRef.current = false;
            const timer = setTimeout(() => setIsAnimating(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen, isResolved]);

    // When steps grow mid-session (e.g. after upload), continue revealing new ones
    useEffect(() => {
        if (isOpen && wasOpenRef.current && visibleCount < steps.length && !isResolved) {
            const interval = setInterval(() => {
                setVisibleCount(prev => {
                    if (prev < steps.length) return prev + 1;
                    clearInterval(interval);
                    return prev;
                });
            }, 600);
            return () => clearInterval(interval);
        }
    }, [steps.length, isOpen, isResolved]);

    const handleFileUploadClick = () => {
        fileInputRef.current?.click();
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

            {/* Bottom Sheet Content */}
            <div
                className={`relative bg-white w-[362px] rounded-[24px] mb-[21px] flex flex-col pt-[12px] px-[14px] pb-[24px] z-10 transition-transform duration-300 no-scrollbar overflow-y-auto max-h-[90vh]`}
                onClick={(e) => e.stopPropagation()}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{ transform: `translateY(${isOpen ? `${dragY}px` : '100%'})` }}
            >
                {/* Drag Handle */}
                <div className="w-[40px] h-[4px] bg-[#E0E0E0] rounded-full mx-auto mb-4" />

                {/* Header */}
                <h2 
                    className="text-black font-bold text-[20px] text-center font-satoshi"
                    style={{ letterSpacing: "-0.43px" }}
                >
                    {variant === 'detailed' ? 'Ticket Details' : ticketId}
                </h2>

                {/* Summary Card */}
                <div 
                    className="mt-[15px] w-[330px] h-[64px] px-[16px] rounded-[12px] border border-[#E9EAEB] bg-white flex items-center justify-between mx-auto shrink-0"
                >
                    <div className="flex flex-col">
                        <span 
                            className="text-black font-medium text-[14px] font-satoshi leading-tight"
                            style={{ letterSpacing: "-0.43px" }}
                        >
                            {ticketTitle}
                        </span>
                        <span 
                            className="text-black/60 font-normal text-[14px] font-satoshi mt-0.5"
                            style={{ letterSpacing: "-0.43px" }}
                        >
                            Ticket ID: {ticketId}
                        </span>
                    </div>
                    <div 
                        className={`px-[10px] h-[24px] rounded-[6px] flex items-center justify-center shrink-0
                            ${isResolved ? 'bg-[#0B902B]/[0.12]' : 'bg-[#5260FE]/[0.12]'}`}
                    >
                        <span 
                            className={`font-medium text-[12px] font-satoshi
                                ${isResolved ? 'text-[#0B902B]' : 'text-[#5260FE]'}`}
                            style={{ letterSpacing: "-0.43px" }}
                        >
                            {isResolved ? 'Resolved' : 'In Progress'}
                        </span>
                    </div>
                </div>

                {/* Support Description (detailed variant only) */}
                {variant === 'detailed' && ticketDescription && (
                    <div className="mt-[12px] w-[330px] mx-auto rounded-[12px] border border-[#E9EAEB] bg-white p-[16px] shrink-0">
                        <h3 
                            className="text-black font-bold text-[14px] font-satoshi leading-tight"
                            style={{ letterSpacing: "-0.43px" }}
                        >
                            Support Description
                        </h3>
                        <p 
                            className="mt-[10px] text-black/70 font-medium text-[13px] font-satoshi leading-[1.5] italic"
                            style={{ letterSpacing: "-0.43px" }}
                        >
                            "{ticketDescription}"
                        </p>
                    </div>
                )}

                {/* Support Status Timeline Section */}
                <div className="mt-[16px] w-[330px] mx-auto flex flex-col items-start">
                    <h3 
                        className="text-black font-medium text-[14px] font-satoshi"
                        style={{ letterSpacing: "-0.43px" }}
                    >
                        Support Status
                    </h3>
                    
                    <div 
                        className="mt-[10px] w-[330px] h-[337px] rounded-[12px] border border-[#E9EAEB] bg-white pt-[15px] px-[18px] flex flex-col shrink-0 overflow-y-auto custom-scrollbar relative"
                    >
                        {/* Hidden File Input */}
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            style={{ display: 'none' }} 
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    setIsUploading(true);
                                    // Simulate upload delay
                                    setTimeout(() => {
                                        setIsUploading(false);
                                        onUploadComplete?.();
                                    }, 1500);
                                }
                            }}
                        />

                        {/* The Single Consistent Rail (Grey Line) */}
                        <div 
                            className="absolute border-l-[1px] border-dotted border-[#EEEEEE]"
                            style={{ 
                                left: '26.5px', // 18px horizontal padding + 9px (half of 18px icon) - 0.5px border
                                top: '24px',    // 15px top padding + 9px (half of 18px icon)
                                bottom: '40px', // Goes down to the approx center of the last icon
                                zIndex: 0
                            }}
                        />

                        <div className="relative z-10 w-full">
                            {steps.slice(0, visibleCount).map((step, index) => {
                                const isLast = index === steps.length - 1;
                                const isCompleted = step.status === 'completed';
                                const isInProgress = step.status === 'in_progress';

                                return (
                                    <div 
                                        key={step.label} 
                                        className="flex gap-[12px] relative mb-[20px] last:mb-0 animate-in fade-in slide-in-from-bottom-2 duration-500"
                                    >
                                        {/* Icon & Line Segment Column */}
                                        <div className="flex flex-col items-center shrink-0 relative">
                                            {/* Green Vertical Segment (if completed and not last) */}
                                            {isCompleted && !isLast && (
                                                <div 
                                                    className="absolute border-l-[1px] border-dotted border-[#0B902B]"
                                                    style={{ 
                                                        left: '8.5px', // Center of 18px icon
                                                        top: '18px',    // From bottom of icon
                                                        bottom: '-20px', // Goes down into the next item's gap
                                                        zIndex: 1
                                                    }}
                                                />
                                            )}
                                            
                                            <div 
                                                className={`w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 relative z-10 
                                                    ${isCompleted ? 'bg-[#0B902B]' : 'bg-[#EEEEEE]'}`}
                                            >
                                                {isCompleted ? (
                                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                ) : null}
                                            </div>
                                        </div>

                                        {/* Text Content */}
                                        <div className="flex flex-col flex-1">
                                            <span 
                                                className={`text-[14px] font-medium font-satoshi leading-tight 
                                                    ${isCompleted ? 'text-black' : 'text-black/50'}`}
                                                style={{ letterSpacing: "-0.43px" }}
                                            >
                                                {step.label}
                                            </span>
                                            {step.timestamp && (
                                                <span 
                                                    className="text-black/50 font-medium text-[12px] font-satoshi mt-1"
                                                    style={{ letterSpacing: "-0.43px" }}
                                                >
                                                    {step.timestamp}
                                                </span>
                                            )}
                                            {step.description && (
                                                <span 
                                                    className={`text-black/50 font-medium text-[12px] font-satoshi mt-[4px] leading-tight w-[270px]
                                                        ${isInProgress ? 'not-italic' : 'italic'}`}
                                                    style={{ letterSpacing: "-0.43px" }}
                                                >
                                                    {step.description}
                                                </span>
                                            )}
                                            {step.buttonText && (
                                                <button 
                                                    onClick={handleFileUploadClick}
                                                    disabled={isUploading}
                                                    className={`mt-[12px] w-[138px] h-[32px] rounded-[4px] flex items-center justify-center shrink-0 transition-all 
                                                        ${isUploading ? 'bg-[#5260FE]/50 cursor-not-allowed' : 'bg-[#5260FE] active:scale-95'}`}
                                                >
                                                    <span 
                                                        className="text-white font-medium text-[12px] font-satoshi"
                                                        style={{ letterSpacing: "-0.43px" }}
                                                    >
                                                        {isUploading ? "Uploading..." : step.buttonText}
                                                    </span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer Note */}
                <p 
                    className="mt-[18px] text-black/50 font-medium italic text-[14px] font-satoshi leading-[1.5] text-left w-[330px] mx-auto px-1 animate-in fade-in duration-700"
                    style={{ letterSpacing: "-0.43px" }}
                >
                    {footerNote 
                        ? footerNote
                        : isResolved 
                            ? "Your ticket has been resolved. We hope we could help you solve your issue."
                            : "Your ticket request is in progress. We will call you if required for additional details."
                    }
                </p>
            </div>
        </div>
    );
};

export default SupportStatusBottomSheet;
