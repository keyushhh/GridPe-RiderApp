import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import RCUploadBottomSheet from '../components/RCUploadBottomSheet';
import pdfIcon from '../assets/pdf-icon.svg';
import crossIcon from '../assets/cross.svg';

const OnboardingStepTwo: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
    const [rcNumber, setRcNumber] = useState('');
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isTouched, setIsTouched] = useState(false);

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = 1;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const validateVehicleNumber = (num: string) => {
        // Indian vehicle number regex: State(2) + District(2) + Series(1-2) + Number(4)
        const regex = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/;
        return regex.test(num);
    };

    const handleRcNumberChange = (val: string) => {
        const upperVal = val.toUpperCase().replace(/\s/g, '');
        setRcNumber(upperVal);
        
        // If it becomes valid, clear error immediately
        if (validateVehicleNumber(upperVal)) {
            setError(null);
        }
    };

    const handleBlur = () => {
        setIsTouched(true);
        if (rcNumber && !validateVehicleNumber(rcNumber)) {
            setError("Please enter a valid vehicle registration number visible in your vehicle's number plate.");
        }
    };

    const isContinueDisabled = !uploadedFile && (!rcNumber || !validateVehicleNumber(rcNumber));

    return (
        <div className="relative h-[100dvh] w-full flex flex-col items-center bg-white font-satoshi overflow-hidden">
            {/* Glowing Orb */}
            <div
                className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[250px] h-[250px] rounded-full blur-[100px] opacity-30 pointer-events-none z-0 bg-[#5260FE]"
            />

            {/* Content Container */}
            <div className="relative z-10 w-full h-full flex flex-col items-center pt-[58px] px-4 pb-6">
                {/* Heading */}
                <h1 className="text-[22px] font-medium text-black">
                    Onboarding
                </h1>

                {/* Step Container */}
                <div className="mt-[29px] w-[362px] h-[75px] rounded-[12px] bg-white border border-[#E9EAEB] relative shrink-0">
                    <span className="absolute left-[12px] top-[15px] text-[14px] font-medium text-black">
                        Step 2/5
                    </span>
                    <span className="absolute right-[14px] top-[15px] text-[14px] font-medium text-black">
                        RC Selection
                    </span>

                    {/* Progress Bar */}
                    <div className="absolute left-[12px] bottom-[11px] w-[338px] h-[10px] bg-[#EBEBEB] rounded-full overflow-hidden">
                        <div className="h-full w-2/5 bg-[#5260FE] rounded-full" />
                    </div>
                </div>

                {/* Subheading Group */}
                <div className="mt-[24px] w-[362px] text-left">
                    <h2 className="text-[14px] font-medium text-black">
                        Registration Certification (RC)
                    </h2>
                    <p className="mt-[4px] text-[14px] font-medium text-[#616161]">
                        Add your vehicle’s registration certificate
                    </p>
                </div>

                {!uploadedFile ? (
                    <>
                        {/* Input Field */}
                        <div className="mt-[24px] w-[362px] flex flex-col">
                            <input
                                type="text"
                                placeholder="Vehicle registration number"
                                value={rcNumber}
                                onChange={(e) => handleRcNumberChange(e.target.value)}
                                onBlur={handleBlur}
                                className={`w-full h-[48px] px-[24px] rounded-full bg-[#F7F8FA] border ${error ? 'border-red-500' : 'border-[#E6E8EB]'} text-[14px] font-medium text-black placeholder:text-black/50 outline-none focus:border-[#5260FE] transition-colors`}
                            />
                            {error && (
                                <p className="mt-[8px] text-[12px] font-medium text-red-500 px-[12px]">
                                    {error}
                                </p>
                            )}
                        </div>

                        {/* Upload Link */}
                        <div className="mt-[14px] w-[362px] flex justify-center">
                            <button
                                className="text-[14px] font-medium text-black hover:opacity-70 transition-opacity"
                                onClick={() => setIsBottomSheetOpen(true)}
                            >
                                Upload document instead
                            </button>
                        </div>
                    </>
                ) : (
                    /* Uploaded File Container */
                    <div className="mt-[24px] w-[362px] h-[57px] rounded-[12px] bg-[#F7F8FA] border border-[#E6E8EB] relative shrink-0">
                        <img
                            src={pdfIcon}
                            alt="PDF"
                            className="absolute top-[9px] left-[7px] w-6 h-6 object-contain"
                        />
                        <div className="absolute top-[9px] left-[43px] flex flex-col">
                            <span className="text-[14px] font-medium text-black leading-tight max-w-[180px] truncate">
                                {uploadedFile.name}
                            </span>
                            <span className="text-[12px] font-medium text-[#616161] leading-tight mt-0.5">
                                {formatFileSize(uploadedFile.size)}
                            </span>
                        </div>

                        {/* Uploaded Badge */}
                        <div className="absolute right-[43px] top-[14px] h-[28px] bg-[#E7F6EC] rounded-[8px] flex items-center justify-center px-3">
                            <span className="text-[#0D9444] text-[12px] font-medium">
                                Uploaded
                            </span>
                        </div>

                        {/* Clear Button */}
                        <button
                            onClick={() => setUploadedFile(null)}
                            className="absolute right-[14px] top-[18px] transition-opacity hover:opacity-70"
                        >
                            <img src={crossIcon} alt="Clear" className="w-5 h-5 flex-shrink-0" />
                        </button>
                    </div>
                )}

                <div className="flex-1" />

                {/* Continue CTA */}
                <button
                    onClick={() => navigate('/onboarding/fetching-details', {
                        state: {
                            ...location.state,
                            vehicle_number: rcNumber
                        }
                    })}
                    disabled={isContinueDisabled}
                    className={`w-[362px] h-[48px] rounded-full flex items-center justify-center shrink-0 transition-all ${
                        isContinueDisabled 
                        ? 'bg-[#EBEBEB] text-[#A0A0A0] cursor-not-allowed border border-[#E9EAEB]' 
                        : 'bg-[#5260FE] text-white hover:opacity-90 active:scale-[0.98]'
                    }`}
                >
                    <span className="text-[16px] font-medium">Continue</span>
                </button>
            </div>

            <RCUploadBottomSheet
                isOpen={isBottomSheetOpen}
                onClose={() => setIsBottomSheetOpen(false)}
                onUpload={(file) => setUploadedFile(file)}
            />
        </div>
    );
};

export default OnboardingStepTwo;
