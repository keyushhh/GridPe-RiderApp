import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

import navigateIcon from '../assets/navigate.svg';
import radioNotSelected from '../assets/radio-not-selected.svg';
import radioSelected from '../assets/radio-selected.svg';

interface Hub {
    id: string;
    name: string; // Changed from title to name
    dist_meters: number;
}

const OnboardingHub: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as { selected_zone_id?: string; selected_zone_name?: string };
    
    const [hubs, setHubs] = useState<Hub[]>([]);
    const [selectedHub, setSelectedHub] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const selectedZoneId = state?.selected_zone_id;
    const selectedZoneName = state?.selected_zone_name || 'Your Zone';

    useEffect(() => {
        const fetchHubs = async () => {
            if (!selectedZoneId) {
                console.error('No zone_id found in onboarding state');
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('hubs')
                    .select('id, location_name, address')
                    .eq('zone_id', selectedZoneId);

                if (error) throw error;
                if (data) {
                    const mappedHubs = data.map(h => ({
                        id: h.id,
                        name: h.location_name,
                        dist_meters: 1200 
                    }));
                    setHubs(mappedHubs);
                    if (mappedHubs.length > 0) setSelectedHub(mappedHubs[0].id);
                }
            } catch (err) {
                console.error('Error fetching hubs:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchHubs();
    }, [selectedZoneId]);

    const formatDistance = (meters: number) => {
        const km = meters / 1000;
        return `${km.toFixed(1)} KM`;
    };

    const handleContinue = () => {
        if (!selectedHub) return;
        navigate('/onboarding/guidelines', {
            state: {
                ...state,
                selected_hub_id: selectedHub 
            }
        });
    };

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

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-[14px] font-medium text-[#616161]">Finding nearby hubs...</p>
                    </div>
                ) : hubs.length > 0 ? (
                    <>
                        {/* Recommended Hub (The first one) */}
                        <div
                            onClick={() => setSelectedHub(hubs[0].id)}
                            className={`mt-[41px] w-[362px] h-[64px] rounded-[12px] border relative cursor-pointer flex-shrink-0 transition-colors ${selectedHub === hubs[0].id ? 'border-[#5260FE]' : 'border-[#E9EAEB]'
                                }`}
                        >
                            <img
                                src={selectedHub === hubs[0].id ? radioSelected : radioNotSelected}
                                alt={selectedHub === hubs[0].id ? "Selected" : "Not Selected"}
                                className="absolute top-[9px] left-[12px]"
                            />
                            <span className="absolute left-[40px] top-[9px] text-[14px] font-bold text-[#000000]">
                                {hubs[0].name}
                            </span>

                            {/* Distance Container */}
                            <div className="absolute left-[40px] top-[33px] flex items-center">
                                <img src={navigateIcon} alt="distance" className="w-[12px] h-[12px]" />
                                <span className="ml-[8px] text-[#616161] text-[14px] font-medium">
                                    {formatDistance(hubs[0].dist_meters)}
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
                        {hubs.length > 1 && (
                            <h3 className="mt-[17px] w-[362px] text-left text-[14px] font-medium text-[#616161]">
                                Nearby Zones
                            </h3>
                        )}

                        {/* Nearby Hubs List (Remaining ones) */}
                        <div className="mt-[8px] w-[362px] flex flex-col gap-[8px] shrink-0 overflow-y-auto max-h-[250px]">
                            {hubs.slice(1).map((hub) => {
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
                                        <span className="absolute left-[40px] top-[9px] text-[14px] font-bold text-[#000000]">
                                            {hub.name}
                                        </span>

                                        {/* Distance Container */}
                                        <div className="absolute left-[40px] top-[33px] flex items-center">
                                            <img src={navigateIcon} alt="distance" className="w-[12px] h-[12px]" />
                                            <span className="ml-[8px] text-[#616161] text-[14px] font-medium">
                                                {formatDistance(hub.dist_meters)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-[14px] font-medium text-[#616161]">No hubs found near you.</p>
                    </div>
                )}

                <div className="flex-1" />

                {/* Continue CTA */}
                <button
                    onClick={handleContinue}
                    disabled={!selectedHub}
                    className={`w-[362px] h-[48px] rounded-full flex items-center justify-center shrink-0 transition-opacity mt-[28px] ${
                        !selectedHub ? 'bg-[#EBEBEB] text-[#A0A0A0] cursor-not-allowed border border-[#E9EAEB]' : 'bg-[#5260FE] text-white hover:opacity-90 active:scale-[0.98]'
                    }`}
                >
                    <span className="text-[16px] font-medium">Confirm Hub</span>
                </button>
            </div>
        </div>
    );
};

export default OnboardingHub;
