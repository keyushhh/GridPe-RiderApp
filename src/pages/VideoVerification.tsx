import React, { useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import playIcon from '../assets/play.svg';

const VideoVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const videoUrl = location.state?.videoUrl as string;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleRetake = () => {
    navigate('/dashboard', { state: { openCameraVideo: true }, replace: true });
  };

  const handleSubmit = () => {
    navigate('/dashboard', { state: { videoSubmitted: true }, replace: true });
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  return (
    <div className="relative h-[100dvh] w-full bg-[#FAFAFA] font-satoshi overflow-hidden flex flex-col items-center pt-12">
      {/* Yellow Glowing Orb */}
      <div
        className="absolute top-[-20px] left-1/2 -translate-x-1/2 w-[166px] h-[40px] rounded-full pointer-events-none z-0"
        style={{
          backgroundColor: '#FACC15',
          filter: 'blur(60px)',
          opacity: 0.8,
        }}
      />

      <h1 className="text-black text-[20px] font-bold mt-4 z-10 font-satoshi tracking-[-0.43px]">
        Video Verification
      </h1>

      {/* Video Playback Container: 42px below heading */}
      <div className="mt-[42px] relative w-[362px] h-[356px] rounded-[14px] overflow-hidden bg-black flex items-center justify-center z-10 shadow-lg">
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-cover"
            onEnded={() => setIsPlaying(false)}
            playsInline
            style={{ transform: 'scaleX(-1)' }} // Mirror playback if recorded mirrored
          />
        ) : (
          <div className="text-white/50">No video recorded</div>
        )}

        {/* Play Pause Overlay */}
        {!isPlaying && videoUrl && (
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer"
            onClick={togglePlay}
          >
            <button className="w-12 h-12 flex items-center justify-center bg-white/20 rounded-full backdrop-blur-sm transition-transform active:scale-95">
              <img src={playIcon} alt="Play" className="w-6 h-6 ml-1" />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* Bottom Actions Container */}
      <div className="w-[362px] flex flex-col gap-3 pb-8 z-10">
        <button
          onClick={handleSubmit}
          className="w-full h-[48px] bg-[#5260FE] text-white rounded-full font-medium text-[16px] tracking-[-0.43px] transition-transform active:scale-[0.98]"
        >
          Submit
        </button>
        <button
          onClick={handleRetake}
          className="w-full h-[48px] bg-white border border-[#5260FE] text-[#5260FE] rounded-full font-medium text-[16px] tracking-[-0.43px] transition-transform active:scale-[0.98]"
        >
          Retake
        </button>
      </div>
    </div>
  );
};

export default VideoVerification;
