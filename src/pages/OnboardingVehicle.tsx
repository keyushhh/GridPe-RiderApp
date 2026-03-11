import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import cycleIcon from '../assets/cycle.svg';
import evIcon from '../assets/electric-vehicle.svg';
import motorcycleIcon from '../assets/motorcycle.svg';
import radioNotSelected from '../assets/radio-not-selected.svg';
import radioSelected from '../assets/radio-selected.svg';
import scooterIcon from '../assets/scooter.svg';

const OnboardingVehicle: React.FC = () => {
    const navigate = useNavigate();
    const [selectedVehicle, setSelectedVehicle] = useState('motorcycle');

    const vehicles = [
        { id: 'motorcycle', title: 'Motorcycle (Gear)', icon: motorcycleIcon },
        { id: 'scooter', title: 'Scooter (Non-gear)', icon: scooterIcon },
        { id: 'ev', title: 'Electric Vehicle', icon: evIcon },
        { id: 'cycle', title: 'Cycle', icon: cycleIcon }
    ];

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
                        Step 1/4
                    </span>
                    <span className="absolute right-[14px] top-[15px] text-[14px] font-medium text-black">
                        Vehicle
                    </span>

                    {/* Progress Bar */}
                    <div className="absolute left-[12px] bottom-[11px] w-[338px] h-[10px] bg-[#EBEBEB] rounded-full overflow-hidden">
                        <div className="h-full w-1/4 bg-[#5260FE] rounded-full" />
                    </div>
                </div>

                {/* Subheading */}
                <h2 className="mt-[14px] w-[362px] text-left text-[16px] font-bold text-black">
                    Select your vehicle
                </h2>
                <p className="mt-[8px] w-[362px] text-left text-[14px] font-medium text-[#616161]">
                    Accurate vehicle details are required for security and payouts.
                </p>

                {/* Vehicle Options Grid */}
                <div className="mt-[24px] w-[362px] grid grid-cols-2 gap-[10px] shrink-0">
                    {vehicles.map((vehicle) => {
                        const isSelected = selectedVehicle === vehicle.id;
                        return (
                            <div
                                key={vehicle.id}
                                onClick={() => setSelectedVehicle(vehicle.id)}
                                className={`w-[176px] h-[104px] rounded-[12px] border relative cursor-pointer flex-shrink-0 transition-colors ${isSelected ? 'border-[#5260FE]' : 'border-[#E9EAEB]'
                                    }`}
                            >
                                <img
                                    src={vehicle.icon}
                                    alt={vehicle.title}
                                    className="absolute top-[10px] left-[10px]"
                                />
                                <img
                                    src={isSelected ? radioSelected : radioNotSelected}
                                    alt={isSelected ? "Selected" : "Not Selected"}
                                    className="absolute top-[8px] right-[8px]"
                                />
                                <span className="absolute left-[10px] bottom-[12px] text-[14px] font-medium text-black">
                                    {vehicle.title}
                                </span>
                            </div>
                        );
                    })}
                </div>

                <div className="flex-1" />

                {/* Continue CTA */}
                <button
                    onClick={() => navigate('/onboarding/step-2')}
                    className="w-[362px] h-[48px] bg-[#5260FE] rounded-full flex items-center justify-center shrink-0 transition-opacity hover:opacity-90 active:scale-[0.98]"
                >
                    <span className="text-white text-[16px] font-medium">Continue</span>
                </button>
            </div>
        </div>
    );
};

export default OnboardingVehicle;
