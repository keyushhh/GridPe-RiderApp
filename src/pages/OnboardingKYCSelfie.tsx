import { ChevronLeft, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import flashIcon from "../assets/camera-flash.svg";
import frameIcon from "../assets/camera-frame.svg";
import shutterIcon from "../assets/shutter.svg";

const OnboardingKYCSelfie = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [selfieError, setSelfieError] = useState<string | null>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    const handleTriggerCapture = () => setIsCameraOpen(true);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
            setStream(mediaStream);
            if (videoRef.current) videoRef.current.srcObject = mediaStream;
        } catch (error) {
            setSelfieError("Unable to access camera.");
            setIsCameraOpen(false);
        }
    };

    const stopCamera = () => {
        if (stream) { stream.getTracks().forEach(track => track.stop()); setStream(null); }
    };

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current;
            const size = Math.min(videoRef.current.videoWidth, videoRef.current.videoHeight);
            canvas.width = size; canvas.height = size;
            const context = canvas.getContext('2d');
            if (context) {
                // Draw image mirrored like the preview
                context.translate(size, 0);
                context.scale(-1, 1);
                context.drawImage(videoRef.current, (videoRef.current.videoWidth - size) / 2, (videoRef.current.videoHeight - size) / 2, size, size, 0, 0, size, size);
                setCapturedImage(canvas.toDataURL('image/jpeg', 0.9));
                setIsCameraOpen(false);
            }
        }
    };

    useEffect(() => {
        if (isCameraOpen) startCamera();
        else stopCamera();
        return () => stopCamera();
    }, [isCameraOpen]);

    return (
        <>
            <div className="relative h-[100dvh] w-full flex flex-col items-center bg-white font-satoshi overflow-hidden">
                {/* Glowing Orb */}
                <div
                    className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[250px] h-[250px] rounded-full blur-[100px] opacity-30 pointer-events-none z-0 bg-[#5260FE]"
                />

                {/* Content Container */}
                <div className="relative z-10 w-full h-full flex flex-col pt-[58px] px-4 pb-6 overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between w-full mb-[29px] shrink-0">
                        <button
                            onClick={() => navigate(-1)}
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
                            Verify Your Identity
                        </span>

                        {/* Progress Bar */}
                        <div className="absolute left-[12px] bottom-[11px] w-[338px] h-[10px] bg-[#EBEBEB] rounded-full overflow-hidden">
                            <div className="h-full w-5/5 bg-[#5260FE] rounded-full" />
                        </div>
                    </div>

                    <div className="w-[362px] mx-auto mb-6 mt-[14px]">
                        <h2 className="text-[16px] font-bold text-black mb-4">Verify your identity</h2>
                        <ul className="space-y-[2px]">
                            <li className="flex items-start gap-4">
                                <span className="mt-[8px] w-1.5 h-1.5 rounded-full shrink-0 bg-[#616161]" />
                                <p className="text-[#616161] text-[14px] font-medium">Take a clear selfie</p>
                            </li>
                            <li className="flex items-start gap-4">
                                <span className="mt-[8px] w-1.5 h-1.5 rounded-full shrink-0 bg-[#616161]" />
                                <p className="text-[#616161] text-[14px] font-medium">Match against uploaded document</p>
                            </li>
                        </ul>
                    </div>

                    <div className="w-[362px] mx-auto mt-4 shrink-0">
                        {!capturedImage ? (
                            <button
                                className="w-[362px] h-[48px] rounded-full text-[16px] font-medium bg-[#5260FE] transition-opacity hover:opacity-90 active:scale-[0.98] text-white flex items-center justify-center"
                                onClick={handleTriggerCapture}
                            >
                                {selfieError ? "Retake Selfie" : "Open Camera"}
                            </button>
                        ) : (
                            <div className="flex flex-col items-center w-full">
                                <div className="w-[362px] h-[96px] rounded-[16px] p-4 flex items-center justify-between bg-white border border-[#E9EAEB]">
                                    <div className="w-[82px] h-[69px] rounded-[12px] overflow-hidden bg-black flex-shrink-0">
                                        <img src={capturedImage} alt="Selfie" className="w-full h-full object-cover" />
                                    </div>
                                    <p className="text-black text-[12px] font-medium leading-tight ml-4 flex-1">
                                        Preview of your selfie verification. If all looks good, click 'Continue' at the bottom.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setCapturedImage(null)}
                                    className="mt-[13px] w-[77px] h-[32px] bg-[#5260FE] rounded-full flex items-center justify-center text-white text-[12px] font-medium font-satoshi transition-opacity hover:opacity-90 active:scale-95"
                                >
                                    Retake?
                                </button>
                            </div>
                        )}
                    </div>

                    {capturedImage && (
                        <div className="w-[362px] mx-auto mt-auto mt-[40px] shrink-0">
                            <button
                                className="w-[362px] h-[48px] rounded-full text-[16px] font-medium bg-[#5260FE] transition-opacity hover:opacity-90 active:scale-[0.98] text-white flex items-center justify-center"
                                onClick={() => navigate("/onboarding/kyc-review", { state: { ...location.state, selfie: capturedImage } })}
                            >
                                Continue
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Camera Fullscreen Overlay */}
            {isCameraOpen && (
                <div className="fixed inset-0 z-50 bg-black flex flex-col">
                    <div className="flex items-center px-5 pt-4 pb-2 absolute top-0 left-0 right-0 z-20 safe-area-top mt-[20px]">
                        <button onClick={() => setIsCameraOpen(false)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                            <X className="w-5 h-5 text-white" />
                        </button>
                    </div>
                    <div className="flex-1 relative bg-black flex flex-col items-center overflow-hidden pt-[145px]">
                        <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />

                        {/* Camera Frame */}
                        <div className="relative z-10 w-[362px] h-[382px] flex items-center justify-center">
                            <img src={frameIcon} alt="Frame" className="w-full h-full object-contain" />
                        </div>

                        {/* Instructional Text: 92px below the frame */}
                        <div className="mt-[92px] z-10">
                            <p className="text-white text-[20px] font-normal font-sans text-center">
                                Align your face within the frame
                            </p>
                        </div>

                        {/* Hint Box: 22px below the text */}
                        <div className="mt-[22px] z-10 w-[256px] h-[34px] bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/5">
                            <span className="text-white/80 text-[12px] font-normal font-sans">
                                Avoid sunglasses, hats, or masks.
                            </span>
                        </div>
                    </div>

                    {/* Footer with Shutter and Flash */}
                    <div className="h-[140px] pb-10 flex items-center justify-center relative bg-black">
                        <div className="relative flex items-center justify-center w-full">
                            <button onClick={handleCapture} className="w-20 h-20 rounded-full flex items-center justify-center transition-transform active:scale-90 z-20 bg-white">
                                <img src={shutterIcon} alt="Capture" className="w-[32px] h-[32px] object-contain" />
                            </button>

                            {/* Flash Button: 82px towards the right of the shutter button */}
                            <button className="absolute left-[calc(50%+40px+82px)] -translate-x-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm z-20">
                                <img src={flashIcon} alt="Flash" className="w-6 h-6 object-contain" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
        </>
    );
};

export default OnboardingKYCSelfie;
