import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { ChevronLeft, CalendarIcon, X } from "lucide-react";
import { format, differenceInYears } from "date-fns";

import iconFlash from "../assets/flash.svg";
import iconGallery from "../assets/gallery.svg";
import iconPlaceholder from "../assets/gallery-placeholder.svg"; // the user mentioned gallery-placeholder.svg in the prompt
import { GlassCalendar } from "../components/GlassCalendar";

const OnboardingKYCUpload = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const documentType = searchParams.get("doc") || "aadhar";

    const [documentNumber, setDocumentNumber] = useState("");
    const [fullName, setFullName] = useState("");
    const [dob, setDob] = useState<Date | undefined>(undefined);
    const [showCalendar, setShowCalendar] = useState(false);

    const documentLabels: Record<string, string> = {
        aadhar: "Aadhar Card",
        voter: "Voter ID",
        dl: "Driver's License", // Updated mapping here instead of passport
        pan: "PAN Card"
    };

    const validateDocumentNumber = (value: string): string => {
        switch (documentType) {
            case "aadhar":
                if (!/^\d{12}$/.test(value)) return `Enter a valid ${documentLabels[documentType]} number`;
                break;
            case "voter":
                if (!/^[a-zA-Z0-9]{10}$/.test(value)) return `Enter a valid ${documentLabels[documentType]} number`;
                break;
            case "dl":
                // Standard DL regex check
                if (!/^[a-zA-Z0-9- ]{10,20}$/.test(value)) return `Enter a valid ${documentLabels[documentType]} number`;
                break;
            case "pan":
                if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) return `Enter a valid ${documentLabels[documentType]} number`;
                break;
        }
        return "";
    };

    const documentError = useMemo(() => {
        if (documentNumber.trim() === "") return "";
        return validateDocumentNumber(documentNumber);
    }, [documentNumber, documentType]);

    const [flashOn, setFlashOn] = useState(false);
    const [images, setImages] = useState<{ front: string | null; back: string | null }>({ front: null, back: null });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [activeSide, setActiveSide] = useState<'front' | 'back' | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    const [isCapturing, setIsCapturing] = useState(false);
    const [isLocked, setIsLocked] = useState(false);

    // Auto-start/stop camera based on image presence
    useEffect(() => {
        const isBothCaptured = images.front !== null && images.back !== null;
        if (!isBothCaptured) {
            if (!stream) {
                startCamera();
            }
        } else if (isBothCaptured && stream) {
            stopCamera();
        }
        return () => stopCamera();
    }, [images.front, images.back, isCapturing]);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            setStream(mediaStream);
            if (videoRef.current) videoRef.current.srcObject = mediaStream;
        } catch (error) {
            console.error("Error accessing camera:", error);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const toggleFlash = () => setFlashOn(!flashOn);

    const handleTriggerCapture = (side?: 'front' | 'back') => {
        if (side) setActiveSide(side);
        else setActiveSide(null);
        if (fileInputRef.current) fileInputRef.current.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                if (activeSide === 'front') setImages(prev => ({ ...prev, front: result }));
                else if (activeSide === 'back') setImages(prev => ({ ...prev, back: result }));
                else {
                    if (!images.front) setImages(prev => ({ ...prev, front: result }));
                    else if (!images.back) setImages(prev => ({ ...prev, back: result }));
                }
            };
            reader.readAsDataURL(file);
        }
        if (event.target) event.target.value = '';
    };

    const handleClearImage = (side: 'front' | 'back') => setImages(prev => ({ ...prev, [side]: null }));
    const handleClearAll = () => {
        setImages({ front: null, back: null });
    };

    const canSubmit = images.front && images.back && documentNumber && fullName && dob && !documentError;

    return (
        <div className="relative h-[100dvh] w-full flex flex-col items-center bg-white font-satoshi overflow-hidden">
            {/* Glowing Orb */}
            <div
                className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[250px] h-[250px] rounded-full blur-[100px] opacity-30 pointer-events-none z-0 bg-[#5260FE]"
            />

            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleFileChange} />
            <canvas ref={canvasRef} className="hidden" />

            {/* Content Container */}
            <div className="relative z-10 w-full h-full flex flex-col pt-[58px] px-4 pb-6 overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between w-full mb-[29px] shrink-0">
                    <button
                        onClick={() => navigate('/onboarding/kyc')}
                        className="w-10 h-10 rounded-full border border-[#E6E8EB] bg-white flex items-center justify-center transition-colors hover:bg-gray-50"
                    >
                        <ChevronLeft className="w-5 h-5 text-black" />
                    </button>
                    <h1 className="text-[22px] font-medium text-black">
                        Onboarding
                    </h1>
                    <div className="w-10" />
                </div>

                {/* Step Container */}
                <div className="w-[362px] h-[75px] rounded-[12px] bg-white border border-[#E9EAEB] relative shrink-0 mx-auto">
                    <span className="absolute left-[12px] top-[15px] text-[14px] font-medium text-black">
                        Step 5/5
                    </span>
                    <span className="absolute right-[14px] top-[15px] text-[14px] font-medium text-black">
                        KYC
                    </span>

                    {/* Progress Bar */}
                    <div className="absolute left-[12px] bottom-[11px] w-[338px] h-[10px] bg-[#EBEBEB] rounded-full overflow-hidden">
                        <div className="h-full w-5/5 bg-[#5260FE] rounded-full" />
                    </div>
                </div>

                {/* Subheading */}
                <div className="w-[362px] mx-auto mt-[14px] mb-[24px]">
                    <h2 className="text-[16px] font-bold text-black">Upload Document</h2>
                    <p className="mt-[8px] text-[14px] font-medium text-[#616161]">Position your ID clearly within the frame.</p>
                </div>

                {/* Camera Area Container */}
                <div className="flex flex-col items-center mb-6 w-full shrink-0">
                    <div className={`w-[362px] h-[184px] bg-black rounded-[24px] flex flex-col items-center justify-center relative overflow-hidden mb-4 transition-all duration-300 ${isLocked ? 'ring-4 ring-green-500 ring-offset-2' : ''}`}>
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    </div>

                    <div className="h-[31px] px-6 rounded-full flex items-center justify-center mb-4 transition-colors" style={{ backgroundColor: "#5260FE" }}>
                        <p className="text-white text-[12px] font-medium">
                            {images.front ? "Upload back side" : "Upload front side"}
                        </p>
                    </div>

                    <div className="flex items-center gap-4 z-20">
                        <button onClick={toggleFlash} className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-[#E9EAEB]">
                            <img src={iconFlash} alt="Flash" className="w-[24px] h-[24px]" />
                        </button>
                        <button onClick={() => handleTriggerCapture()} className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-[#E9EAEB]">
                            <img src={iconGallery} alt="Gallery" className="w-[24px] h-[24px]" />
                        </button>
                    </div>
                </div>

                {/* Thumbnails */}
                <div className="mb-6 w-[362px] mx-auto rounded-[16px] p-4 bg-white border border-[#E9EAEB] shrink-0">
                    <div className="flex justify-between items-center">
                        <div className="flex gap-4">
                            {/* Front Side */}
                            <div onClick={() => handleTriggerCapture('front')} className="w-[100px] h-[80px] cursor-pointer rounded-[12px] border border-[#E9EAEB] bg-[#F9FAFB] flex flex-col items-center justify-center gap-2 overflow-hidden relative">
                                {images.front ? (
                                    <>
                                        <img src={images.front} alt="Front" className="w-full h-full object-cover" />
                                        <button onClick={(e) => { e.stopPropagation(); handleClearImage('front'); }} className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center z-30"><X className="w-3 h-3 text-white" /></button>
                                    </>
                                ) : (
                                    <>
                                        <img src={iconPlaceholder} alt="" className="w-6 h-6" />
                                        <span className="text-[#616161] text-[10px] font-medium">Front side</span>
                                    </>
                                )}
                            </div>
                            {/* Back Side */}
                            <div onClick={() => handleTriggerCapture('back')} className="w-[100px] h-[80px] cursor-pointer rounded-[12px] border border-[#E9EAEB] bg-[#F9FAFB] flex flex-col items-center justify-center gap-2 overflow-hidden relative">
                                {images.back ? (
                                    <>
                                        <img src={images.back} alt="Back" className="w-full h-full object-cover" />
                                        <button onClick={(e) => { e.stopPropagation(); handleClearImage('back'); }} className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center z-30"><X className="w-3 h-3 text-white" /></button>
                                    </>
                                ) : (
                                    <>
                                        <img src={iconPlaceholder} alt="" className="w-6 h-6" />
                                        <span className="text-[#616161] text-[10px] font-medium">Back side</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <button onClick={handleClearAll} disabled={!images.front && !images.back} className={`text-[12px] underline underline-offset-2 font-medium ${(!images.front && !images.back) ? 'text-[#A0A0A0] cursor-not-allowed' : 'text-red-500 hover:text-red-400'}`}>Clear All</button>
                    </div>
                </div>

                {/* Forms */}
                <div className="w-[362px] mx-auto flex flex-col gap-[16px] mb-8 shrink-0">
                    <div className="relative w-full">
                        <input
                            type="text"
                            placeholder="Document Number"
                            value={documentNumber}
                            onChange={(e) => setDocumentNumber(e.target.value)}
                            className={`w-full h-[48px] rounded-[100px] text-black bg-[#F7F8FA] border placeholder:text-[#A0A0A0] px-6 outline-none focus:border-[#5260FE] ${documentError ? 'border-red-500' : 'border-[#E6E8EB]'}`}
                        />
                        {documentError && <span className="text-red-500 text-[10px] absolute -bottom-4 left-6">{documentError}</span>}
                    </div>

                    <div className="relative w-full">
                        <input
                            type="text"
                            placeholder="Full Name as per Document"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full h-[48px] rounded-[100px] text-black bg-[#F7F8FA] border border-[#E6E8EB] placeholder:text-[#A0A0A0] px-6 outline-none focus:border-[#5260FE]"
                        />
                    </div>

                    {/* Date of Birth using custom glass calendar */}
                    <div className="relative w-full">
                        <button
                            onClick={() => setShowCalendar(!showCalendar)}
                            className={`w-[362px] h-[48px] rounded-[100px] text-left px-6 mx-auto flex items-center justify-between bg-[#F7F8FA] border transition-colors outline-none focus:border-[#5260FE] ${
                                showCalendar ? "border-[#5260FE]" : "border-[#E6E8EB]"
                            }`}
                        >
                            <span className={`${dob ? "text-black" : "text-[#A0A0A0]"} font-medium`}>{dob ? format(dob, "dd MMM yyyy") : "Date of Birth"}</span>
                            <CalendarIcon className="w-5 h-5 text-[#A0A0A0]" />
                        </button>
                        {showCalendar && (
                            <div className="mt-4 flex justify-center w-full">
                                <GlassCalendar
                                    selected={dob}
                                    onSelect={(date) => {
                                        if (date) setDob(date);
                                        setShowCalendar(false);
                                    }}
                                    onClose={() => setShowCalendar(false)}
                                    disableFutureDates={true}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Continue CTA */}
                <div className="w-[362px] mx-auto mt-auto flex flex-col items-center">
                    <p className="w-full text-[#616161] text-[14px] font-medium text-left mb-[16px] leading-relaxed">
                        This information is used for identity verification only, and will be kept secure by GridPe
                    </p>
                    <button
                        onClick={() => {
                            console.log('Navigating to selfie with fullName:', fullName);
                            navigate("/onboarding/kyc-selfie", { 
                                state: { 
                                    ...location.state,
                                    images, 
                                    documentNumber, 
                                    fullName, 
                                    dob, 
                                    documentType 
                                } 
                            });
                        }}
                        disabled={!canSubmit}
                        className={`w-[362px] h-[48px] rounded-full flex items-center justify-center shrink-0 transition-opacity ${canSubmit
                                ? 'bg-[#5260FE] hover:opacity-90 active:scale-[0.98] cursor-pointer'
                                : 'opacity-50 cursor-not-allowed border border-[#E9EAEB]'
                            }`}
                        style={{ backgroundColor: canSubmit ? '#5260FE' : '#EBEBEB' }}
                    >
                        <span className={`text-[16px] font-medium ${canSubmit ? 'text-white' : 'text-[#616161]'}`}>Continue</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
export default OnboardingKYCUpload;
