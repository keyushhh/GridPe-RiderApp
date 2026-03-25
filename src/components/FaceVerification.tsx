import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import flashIcon from '../assets/camera-flash.svg';
import frameIcon from '../assets/camera-frame.svg';

interface FaceVerificationProps {
  onCapture?: (image: string) => void;
  onVideoCapture?: (videoUrl: string) => void;
  onClose: () => void;
  mode?: 'photo' | 'video';
}

const FaceVerification: React.FC<FaceVerificationProps> = ({ onCapture, onVideoCapture, onClose, mode = 'photo' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: mode === 'video'
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.muted = true; // Prevent feedback loop
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera.');
      onClose();
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handlePhotoCapture = () => {
    if (videoRef.current && canvasRef.current && onCapture) {
      const canvas = canvasRef.current;
      const size = Math.min(videoRef.current.videoWidth, videoRef.current.videoHeight);
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext('2d');
      if (context) {
        // Draw image mirrored like the preview
        context.translate(size, 0);
        context.scale(-1, 1);
        context.drawImage(
          videoRef.current,
          (videoRef.current.videoWidth - size) / 2,
          (videoRef.current.videoHeight - size) / 2,
          size,
          size,
          0,
          0,
          size,
          size
        );
        onCapture(canvas.toDataURL('image/jpeg', 0.9));
      }
    }
  };

  const startRecording = () => {
    if (!stream || !onVideoCapture) return;
    
    recordedChunksRef.current = [];
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      onVideoCapture(url);
    };

    mediaRecorder.start();
    setIsRecording(true);

    recordingTimerRef.current = setTimeout(() => {
      stopRecording();
    }, 10000); // 10 seconds max
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearTimeout(recordingTimerRef.current);
      }
    }
  };

  const handleActionClick = () => {
    if (mode === 'photo') {
      handlePhotoCapture();
    } else {
      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
    };
  }, [mode]);

  return (
    <div className="fixed inset-0 z-[110] bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center px-5 pt-4 pb-2 absolute top-0 left-0 right-0 z-20 safe-area-top mt-[20px]">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="flex-1 relative bg-black flex flex-col items-center overflow-hidden pt-[145px]">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
        />

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

      {/* Footer with Scan Now and Flash */}
      <div className="h-[140px] pb-10 flex items-center justify-center relative bg-black">
        <div className="relative flex items-center justify-center w-full">
          {/* Main Action Button */}
          <button
            onClick={handleActionClick}
            className={`w-[170px] h-[44px] rounded-full flex items-center justify-center transition-transform active:scale-95 z-20 shadow-[0px_4px_16px_rgba(82,96,254,0.4)] ${
              isRecording ? 'bg-[#FF3B30] shadow-[0px_4px_16px_rgba(255,59,48,0.4)]' : 'bg-[#5260FE]'
            }`}
          >
            <span className="text-white font-satoshi font-normal text-[16px]">
              {mode === 'photo' ? 'Scan Now' : isRecording ? 'Stop' : 'Record Now'}
            </span>
          </button>

          {/* Flash Button: 82px towards the right of the center */}
          <button className="absolute left-[calc(50%+85px+20px)] -translate-x-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm z-20">
            <img src={flashIcon} alt="Flash" className="w-6 h-6 object-contain" />
          </button>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default FaceVerification;
