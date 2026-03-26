import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import scooterIcon from '../assets/scooter.svg';
import motorcycleIcon from '../assets/motorcycle.svg';
import carIcon from '../assets/electric-vehicle.svg';
import fileIcon from '../assets/file.svg';
import searchIcon from '../assets/search.svg';

const FetchingVehicleDetails: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/onboarding/details-success', { state: location.state });
        }, 5000);
        return () => clearTimeout(timer);
    }, [navigate]);
    return (
        <div className="relative h-[100dvh] w-full flex flex-col items-center bg-white font-satoshi overflow-hidden">
            {/* Glowing Orb */}
            <div
                className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[250px] h-[250px] rounded-full blur-[100px] opacity-30 pointer-events-none z-0 bg-[#5260FE]"
            />

            {/* Animation Container */}
            <div className="relative z-10 w-full flex flex-col items-center pt-[180px]">
                <div className="relative w-[200px] h-[120px] flex items-center justify-center mb-8 perspective-[1000px]">
                    {/* Centered Document & Magnifier */}
                    <div className="relative z-20">
                        {/* Note/Page */}
                        <div className="w-[45px] h-[60px] bg-[#F7F8FA] border-2 border-[#5260FE]/20 rounded-[4px] flex flex-col p-2 gap-1 animate-pulse-slow">
                            <div className="w-full h-[2px] bg-[#5260FE]/10 rounded-full" />
                            <div className="w-4/5 h-[2px] bg-[#5260FE]/10 rounded-full" />
                            <div className="w-full h-[2px] bg-[#5260FE]/10 rounded-full" />
                        </div>

                        {/* Magnifying Glass */}
                        <div className="absolute -top-2 -right-4 animate-scan">
                            <img 
                                src={searchIcon} 
                                style={{ filter: 'invert(34%) sepia(91%) saturate(2853%) hue-rotate(228deg) brightness(101%) contrast(101%)' }}
                                className="w-8 h-8" 
                                alt=""
                            />
                        </div>
                    </div>

                    {/* 3D Rotating Vehicles */}
                    <div className="absolute inset-0 preserve-3d">
                        {/* Car */}
                        <div className="absolute inset-0 flex items-center justify-center animate-orbit-1 preserve-3d">
                            <img 
                                src={carIcon} 
                                style={{ filter: 'invert(34%) sepia(91%) saturate(2853%) hue-rotate(228deg) brightness(101%) contrast(101%)' }}
                                className="w-10 h-10 opacity-20 transform-style-flat" 
                                alt=""
                            />
                        </div>
                        {/* Scooter */}
                        <div className="absolute inset-0 flex items-center justify-center animate-orbit-2 preserve-3d">
                            <img 
                                src={scooterIcon} 
                                style={{ filter: 'invert(34%) sepia(91%) saturate(2853%) hue-rotate(228deg) brightness(101%) contrast(101%)' }}
                                className="w-7 h-7 opacity-20 transform-style-flat" 
                                alt=""
                            />
                        </div>
                        {/* Motorcycle */}
                        <div className="absolute inset-0 flex items-center justify-center animate-orbit-3 preserve-3d">
                            <img 
                                src={motorcycleIcon} 
                                style={{ filter: 'invert(34%) sepia(91%) saturate(2853%) hue-rotate(228deg) brightness(101%) contrast(101%)' }}
                                className="w-8 h-8 opacity-20 transform-style-flat" 
                                alt=""
                            />
                        </div>
                    </div>
                </div>

                {/* Text */}
                <p className="text-[18px] font-medium text-black text-center leading-tight">
                    Fetching your vehicle details...
                </p>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .perspective-[1000px] { perspective: 1000px; }
                .preserve-3d { transform-style: preserve-3d; }
                .transform-style-flat { transform-style: flat; }
                
                @keyframes orbit-1 {
                    from { transform: rotateY(0deg) translateZ(80px); }
                    to { transform: rotateY(360deg) translateZ(80px); }
                }
                @keyframes orbit-2 {
                    from { transform: rotateY(120deg) translateZ(80px); }
                    to { transform: rotateY(480deg) translateZ(80px); }
                }
                @keyframes orbit-3 {
                    from { transform: rotateY(240deg) translateZ(80px); }
                    to { transform: rotateY(600deg) translateZ(80px); }
                }
                
                .animate-orbit-1 { animation: orbit-1 6s linear infinite; }
                .animate-orbit-2 { animation: orbit-2 6s linear infinite; }
                .animate-orbit-3 { animation: orbit-3 6s linear infinite; }
                
                @keyframes scan {
                    0% { transform: translate(0, 0); }
                    25% { transform: translate(-20px, 10px); }
                    50% { transform: translate(-10px, 30px); }
                    75% { transform: translate(10px, 10px); }
                    100% { transform: translate(0, 0); }
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(0.98); }
                }
                .animate-scan {
                    animation: scan 4s ease-in-out infinite;
                }
                .animate-pulse-slow {
                    animation: pulse-slow 3s ease-in-out infinite;
                }
                `
            }} />
        </div>
    );
};

export default FetchingVehicleDetails;
