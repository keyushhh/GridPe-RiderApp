import 'maplibre-gl/dist/maplibre-gl.css';
import React, { useEffect, useRef, useState } from 'react';
import Map, { MapRef, Marker } from 'react-map-gl/maplibre';
import { useNavigate } from 'react-router-dom';

import chevronDownIcon from '../assets/chevron-down-solid.svg';
import locationIcon from '../assets/location.svg';
import { supabase } from '../lib/supabase';

interface ServiceZone {
    zone_id: string;   // UUID from active_cities
    city_name: string; // Text from active_cities
}

const WorkCity: React.FC = () => {
    const navigate = useNavigate();
    const mapRef = useRef<MapRef>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [zones, setZones] = useState<ServiceZone[]>([]);
    const [selectedZone, setSelectedZone] = useState<ServiceZone | null>(null);
    const [loading, setLoading] = useState(true);

    // Initial view state (defaults to Bangalore center)
    const [viewState, setViewState] = useState({
        longitude: 77.5946,
        latitude: 12.9716,
        zoom: 11
    });

    useEffect(() => {
        const fetchZones = async () => {
            try {
                // Fetch from active_cities view: zone_id (UUID), city_name (Text)
                const { data, error } = await supabase
                    .from('active_cities')
                    .select('*')
                    .order('city_name');

                if (error) throw error;
                if (data) {
                    setZones(data);
                    if (data.length > 0) {
                        setSelectedZone(data[0]);
                    }
                }
            } catch (err) {
                console.error('Error fetching active cities:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchZones();
    }, []);

    // Helper to clean city name string
    const cleanCityName = (name: string) => {
        return name
            .replace(/^(North|South|East|West)\s+/i, '')
            .replace(/\s*\(.*?\)$/, '')
            .replace(/\s+(District|City|Town|Village)$/i, '')
            .trim();
    };

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;

                    // Smoothly fly to user's current location
                    mapRef.current?.flyTo({
                        center: [longitude, latitude],
                        zoom: 11,
                        duration: 2000
                    });

                    setViewState((prev) => ({
                        ...prev,
                        latitude,
                        longitude,
                    }));

                    // Basic Reverse Geocoding via Nominatim
                    try {
                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`);
                        const data = await res.json();
                        let city = data.address.city ||
                            data.address.town ||
                            data.address.municipality ||
                            data.address.village ||
                            data.address.suburb ||
                            data.address.county ||
                            data.address.state || "Unknown City";

                        if (city && zones.length > 0) {
                            const cleaned = cleanCityName(city);
                            const matchedZone = zones.find(z => z.city_name.toLowerCase().includes(cleaned.toLowerCase()));
                            if (matchedZone) {
                                setSelectedZone(matchedZone);
                            }
                        }
                    } catch (err) {
                        console.error("Reverse geocoding failed:", err);
                    }
                },
                (error) => {
                    console.error("Error fetching location:", error);
                }
            );
        }
    }, [zones]);

    const handleCitySelect = (zone: ServiceZone) => {
        setSelectedZone(zone);
        setIsOpen(false);
        // Map center stays on default or user's current location since view lacks city-specific coords
    };

    const cartoStyle = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

    const benefits = [
        { title: 'Instant Earnings', desc: 'Daily payouts directly to your bank.' },
        { title: 'Flexible Work Hours', desc: 'Work anytime — no shift lock-ins.' },
        { title: 'Performance Rewards', desc: 'Weekly bonuses for consistent deliveries.' }
    ];

    return (
        <div className="relative h-screen w-full flex flex-col items-center bg-white overflow-hidden font-satoshi">
            {/* Map Section - Explicitly 223px at top */}
            <div className="absolute top-0 left-0 w-full h-[223px] z-0">
                <Map
                    {...viewState}
                    ref={mapRef}
                    onMove={evt => setViewState(evt.viewState)}
                    style={{ width: '100%', height: '100%' }}
                    mapStyle={cartoStyle}
                    interactive={false}
                    attributionControl={false}
                >
                    {/* Custom Location Pill Marker */}
                    <Marker longitude={viewState.longitude} latitude={viewState.latitude} anchor="bottom">
                        <div className="relative flex flex-col items-center">
                            <div className="h-[40px] px-[24px] bg-black rounded-full flex items-center justify-center min-w-[124px]">
                                <span className="text-white text-[14px] font-normal leading-[21px]">
                                    {selectedZone?.city_name || 'Loading...'}
                                </span>
                            </div>
                            <div className="w-0 h-0 border-l-[11px] border-l-transparent border-r-[11px] border-r-transparent border-t-[11px] border-t-black mt-[-1px]" />
                        </div>
                    </Marker>
                </Map>
                {/* Visual White Fade - Subtle at bottom edge to blend into content background */}
                <div className="absolute bottom-0 left-0 w-full h-[100px] z-10 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
            </div>

            {/* Main Content Layer - Positioned exactly at 190px from top of viewport */}
            <div className="relative z-20 w-full max-w-[400px] flex-1 flex flex-col items-center pt-[190px] px-4 overflow-y-auto overflow-x-hidden">
                {/* Heading */}
                <h2 className="text-[18px] font-bold text-primary leading-[25px] text-center w-full">
                    Earn upto ₹5,500 per week!
                </h2>

                {/* Benefits Section - Starts 21px below heading */}
                <div className="mt-[21px] w-full flex flex-col items-center">
                    {/* Extra Benefits Heading */}
                    <div className="flex items-center gap-[12px] mb-[26px]">
                        <div className="w-[109px] h-[1px] bg-[#E6E8EB]" />
                        <span className="text-[12px] font-bold text-black opacity-50 whitespace-nowrap">
                            EXTRA BENEFITS
                        </span>
                        <div className="w-[109px] h-[1px] bg-[#E6E8EB]" />
                    </div>

                    {/* Benefits List */}
                    <div className="flex flex-col gap-[16px] w-full mb-[31px]">
                        {benefits.map((benefit, idx) => (
                            <div key={idx} className="flex flex-col items-center text-center">
                                <span className="text-[14px] font-semibold text-black leading-[21px]">
                                    {benefit.title}
                                </span>
                                <span className="text-[14px] font-normal text-black leading-[21px]">
                                    {benefit.desc}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dropdown Section */}
                <div className="w-full max-w-[362px] flex flex-col gap-[8px]">
                    <div
                        onClick={() => setIsOpen(!isOpen)}
                        className="h-[48px] w-full bg-[#f7f8fa] border border-[#e6e8eb] rounded-full flex items-center px-[12px] cursor-pointer"
                    >
                        <img src={locationIcon} alt="location" className="w-[24px] h-[24px]" />
                        <span className="ml-[10px] text-[14px] font-medium text-black flex-1">
                            {selectedZone?.city_name || 'Select City'}
                        </span>
                        <img
                            src={chevronDownIcon}
                            alt="chevron"
                            className={`w-[24px] h-[24px] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                            style={{ filter: 'brightness(0)' }}
                        />
                    </div>

                    {isOpen && (
                        <div className="w-[362px] min-h-[241px] bg-[#f7f8fa] border border-[#e6e8eb] rounded-[13px] flex flex-col overflow-hidden">
                            <div className="px-[16px] py-[16px] flex items-center justify-center text-center">
                                <span className="text-[12px] font-medium text-black leading-[18px]">
                                    We're available only on these cities, we're coming near you, soon!
                                </span>
                            </div>
                            <div className="w-full h-[1px] bg-[#e6e8eb]" />
                            <div className="flex-1 overflow-y-auto px-[16px]">
                                {zones.map((zone, idx) => (
                                    <div key={zone.zone_id}>
                                        <div
                                            className="flex items-center justify-between py-[10px] cursor-pointer"
                                            onClick={() => handleCitySelect(zone)}
                                        >
                                            <span className="text-[14px] font-medium text-black">{zone.city_name}</span>
                                            <div className={`w-[20px] h-[20px] rounded-full border-2 border-primary flex items-center justify-center ${selectedZone?.zone_id === zone.zone_id ? 'bg-primary' : ''}`}>
                                                {selectedZone?.zone_id === zone.zone_id && <div className="w-[8px] h-[8px] bg-white rounded-full" />}
                                            </div>
                                        </div>
                                        {idx < zones.length - 1 && <div className="h-[1px] bg-[#e6e8eb]" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <button
                    onClick={() => navigate('/onboarding/vehicle', { 
                        state: { 
                            selected_zone_id: selectedZone?.zone_id,
                            selected_zone_name: selectedZone?.city_name 
                        } 
                    })}
                    className="mt-[21px] mb-[40px] w-full max-w-[362px] h-[48px] bg-primary rounded-full flex items-center justify-center transition-opacity hover:opacity-90 active:scale-[0.98] shrink-0"
                >
                    <span className="text-white text-[16px] font-medium">Continue</span>
                </button>
            </div>

            {/* Override MapLibre Defaults via Style */}
            <style>{`
                .maplibregl-ctrl-attrib, .maplibregl-ctrl-logo, .maplibregl-ctrl-attrib-button {
                    display: none !important;
                }
            `}</style>
        </div>
    );
};

export default WorkCity;
