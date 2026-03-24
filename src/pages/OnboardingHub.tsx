import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import navigateIcon from '../assets/navigate.svg';
import radioNotSelected from '../assets/radio-not-selected.svg';
import radioSelected from '../assets/radio-selected.svg';

const OnboardingHub: React.FC = () => {
    const navigate = useNavigate();
    const [selectedHub, setSelectedHub] = useState('kormangala');

    const recommendedHub = {
        id: 'kormangala',
        title: 'Kormangala',
        distance: '1 kms',
    };

    const nearbyHubs = [
        { id: 'indiranagar', title: 'Indiranagar', distance: '5 kms' },
        { id: 'btm-2nd-stage', title: 'BTM 2nd Stage', distance: '8 kms' },
        { id: 'mg-road', title: 'MG Road', distance: '10 kms' },
        { id: 'kalyan-nagar', title: 'Kalyan Nagar', distance: '15 kms' },
        { id: 'banaswadi', title: 'Banaswadi', distance: '20 kms' },
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
                        Step 3/5
                    </span>
                    <span className="absolute right-[14px] top-[15px] text-[14px] font-medium text-black">
                        Hub Selection
                    </span>

                    {/* Progress Bar */}
                    <div className="absolute left-[12px] bottom-[11px] w-[338px] h-[10px] bg-[#EBEBEB] rounded-full overflow-hidden">
                        <div className="h-full w-3/5 bg-[#5260FE] rounded-full" />
                    </div>
                </div>

                {/* Subheading */}
                <h2 className="mt-[14px] w-[362px] text-left text-[16px] font-bold text-black">
                    Select the area you want to work in
                </h2>
                <p className="mt-[8px] w-[362px] text-left text-[14px] font-medium text-[#616161]">
                    Select area on the basis of distance from your location.
                </p>

                {/* Recommended Hub */}
                <div
                    onClick={() => setSelectedHub(recommendedHub.id)}
                    className={`mt-[41px] w-[362px] h-[64px] rounded-[12px] border relative cursor-pointer flex-shrink-0 transition-colors ${selectedHub === recommendedHub.id ? 'border-[#5260FE]' : 'border-[#E9EAEB]'
                        }`}
                >
                    <img
                        src={selectedHub === recommendedHub.id ? radioSelected : radioNotSelected}
                        alt={selectedHub === recommendedHub.id ? "Selected" : "Not Selected"}
                        className="absolute top-[9px] left-[12px]"
                    />
                    <span className="absolute left-[40px] top-[9px] text-[14px] font-medium text-black">
                        {recommendedHub.title}
                    </span>

                    {/* Distance Container */}
                    <div className="absolute left-[40px] top-[33px] flex items-center">
                        <img src={navigateIcon} alt="distance" className="w-[12px] h-[12px]" />
                        <span className="ml-[8px] text-[#616161] text-[14px] font-medium">
                            {recommendedHub.distance}
                        </span>
                    </div>

                    {/* Recommended Badge */}
                    <div className="absolute right-[12px] top-1/2 -translate-y-1/2 w-[117px] h-[33px] bg-[#5260FE] rounded-full flex items-center justify-center px-[10px] py-[8px]">
                        <span className="text-white text-[14px] font-medium">
                            Recommended
                        </span>
                    </div>
                </div>

                {/* Nearby Zones Header */}
                <h3 className="mt-[17px] w-[362px] text-left text-[14px] font-medium text-[#616161]">
                    Nearby Zones
                </h3>

                {/* Nearby Hubs List */}
                <div className="mt-[8px] w-[362px] flex flex-col gap-[8px] shrink-0">
                    {nearbyHubs.map((hub) => {
                        const isSelected = selectedHub === hub.id;
                        return (
                            <div
                                key={hub.id}
                                onClick={() => setSelectedHub(hub.id)}
                                className={`w-full h-[64px] rounded-[12px] border relative cursor-pointer flex-shrink-0 transition-colors ${isSelected ? 'border-[#5260FE]' : 'border-[#E9EAEB]'
                                    }`}
                            >
                                <img
                                    src={isSelected ? radioSelected : radioNotSelected}
                                    alt={isSelected ? "Selected" : "Not Selected"}
                                    className="absolute top-[9px] left-[12px]"
                                />
                                <span className="absolute left-[40px] top-[9px] text-[14px] font-medium text-black">
                                    {hub.title}
                                </span>

                                {/* Distance Container */}
                                <div className="absolute left-[40px] top-[33px] flex items-center">
                                    <img src={navigateIcon} alt="distance" className="w-[12px] h-[12px]" />
                                    <span className="ml-[8px] text-[#616161] text-[14px] font-medium">
                                        {hub.distance}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex-1" />

                {/* Continue CTA */}
                <button
                    onClick={() => navigate('/onboarding/guidelines')}
                    className="w-[362px] h-[48px] bg-[#5260FE] rounded-full flex items-center justify-center shrink-0 transition-opacity hover:opacity-90 active:scale-[0.98] mt-[28px]"
                >
                    <span className="text-white text-[16px] font-medium">Confirm Hub</span>
                </button>
            </div>
        </div>
    );
};

export default OnboardingHub;
