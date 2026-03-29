import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    riderUuid: string | null;
    phoneNumber: string | null;
    fullName: string | null;
    kycStatus: string | null;
    email: string | null;
    avatar: string | null;
    kycDocsUrl: string[] | null;
    selectedCity: string | null;
    selectedHub: string | null;
    selectedZoneId: string | null;
    selectedHubId: string | null;
    selectedZoneName: string | null;
    selectedHubName: string | null;
    totalEarnings: number;
    isOnline: boolean;
    setIsOnline: (online: boolean) => void;
    setPhoneNumber: (phone: string | null) => void;
    updateEmail: (email: string | null) => void;
    updateAvatar: (avatar: string | null) => void;
    login: (uuid: string, fullName?: string | null, kycStatus?: string | null) => void;
    refreshProfile: () => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [riderUuid, setRiderUuid] = useState<string | null>(localStorage.getItem('rider_uuid'));
    const [phoneNumber, setPhoneNumberState] = useState<string | null>(localStorage.getItem('rider_phone'));
    const [fullName, setFullName] = useState<string | null>(localStorage.getItem('rider_kyc_name'));
    const [kycStatus, setKycStatus] = useState<string | null>(localStorage.getItem('rider_kyc_status'));
    const [email, setEmailState] = useState<string | null>(localStorage.getItem('rider_email'));
    const [avatar, setAvatarState] = useState<string | null>(localStorage.getItem('rider_avatar'));
    const [kycDocsUrl, setKycDocsUrl] = useState<string[] | null>(JSON.parse(localStorage.getItem('rider_kyc_docs') || 'null'));
    const [selectedCity, setSelectedCity] = useState<string | null>(localStorage.getItem('rider_selected_city'));
    const [selectedHub, setSelectedHub] = useState<string | null>(localStorage.getItem('rider_selected_hub'));
    const [selectedZoneId, setSelectedZoneId] = useState<string | null>(localStorage.getItem('rider_selected_zone_id'));
    const [selectedHubId, setSelectedHubId] = useState<string | null>(localStorage.getItem('rider_selected_hub_id'));
    const [selectedZoneName, setSelectedZoneName] = useState<string | null>(localStorage.getItem('rider_selected_zone_name'));
    const [selectedHubName, setSelectedHubName] = useState<string | null>(localStorage.getItem('rider_selected_hub_name'));
    const [totalEarnings, setTotalEarnings] = useState<number>(Number(localStorage.getItem('rider_earnings')) || 0);
    const [isOnline, setIsOnlineState] = useState<boolean>(localStorage.getItem('rider_is_online') === 'true');
    const [loading, setLoading] = useState(true);

    const setIsOnline = (online: boolean) => {
        localStorage.setItem('rider_is_online', online.toString());
        setIsOnlineState(online);
    };

    const setPhoneNumber = (phone: string | null) => {
        if (phone) localStorage.setItem('rider_phone', phone);
        else localStorage.removeItem('rider_phone');
        setPhoneNumberState(phone);
    };

    const updateEmail = (email: string | null) => {
        if (email) localStorage.setItem('rider_email', email);
        else localStorage.removeItem('rider_email');
        setEmailState(email);
    };

    const updateAvatar = (avatar: string | null) => {
        if (avatar) localStorage.setItem('rider_avatar', avatar);
        else localStorage.removeItem('rider_avatar');
        setAvatarState(avatar);
    };

    const refreshProfile = async () => {
        if (!riderUuid) return;

        try {
            const { data, error } = await supabase
                .from('riders')
                .select('*, service_zones(id, zone_name), hubs(id, location_name)')
                .eq('id', riderUuid)
                .single();

            if (error) {
                console.error('Error refreshing profile:', error);
                return;
            }

            if (data) {
                // Sync Supabase data to local state & storage
                if (data.full_name) {
                    setFullName(data.full_name);
                    localStorage.setItem('rider_kyc_name', data.full_name);
                }
                if (data.kyc_status) {
                    setKycStatus(data.kyc_status);
                    localStorage.setItem('rider_kyc_status', data.kyc_status);
                }
                if (data.total_earnings !== undefined) {
                    setTotalEarnings(data.total_earnings);
                    localStorage.setItem('rider_earnings', data.total_earnings.toString());
                }
                if (data.is_online !== undefined) {
                    setIsOnlineState(data.is_online);
                    localStorage.setItem('rider_is_online', data.is_online.toString());
                }
                if (data.kyc_docs_url) {
                    setKycDocsUrl(data.kyc_docs_url);
                    localStorage.setItem('rider_kyc_docs', JSON.stringify(data.kyc_docs_url));
                }
                if (data.selected_city) {
                    setSelectedCity(data.selected_city);
                    localStorage.setItem('rider_selected_city', data.selected_city);
                }
                if (data.selected_hub) {
                    setSelectedHub(data.selected_hub);
                    localStorage.setItem('rider_selected_hub', data.selected_hub);
                }

                // New Zone-Based Sync
                if (data.zone_id) {
                    setSelectedZoneId(data.zone_id);
                    localStorage.setItem('rider_selected_zone_id', data.zone_id);
                }
                if (data.hub_id) {
                    setSelectedHubId(data.hub_id);
                    localStorage.setItem('rider_selected_hub_id', data.hub_id);
                }
                if (data.service_zones?.zone_name) {
                    setSelectedZoneName(data.service_zones.zone_name);
                    localStorage.setItem('rider_selected_zone_name', data.service_zones.zone_name);
                }
                if (data.hubs?.location_name) {
                    setSelectedHubName(data.hubs.location_name);
                    localStorage.setItem('rider_selected_hub_name', data.hubs.location_name);
                }
            }
        } catch (err) {
            console.error('Failed to sync profile with Supabase:', err);
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            const storedUuid = localStorage.getItem('rider_uuid');
            if (storedUuid) {
                setRiderUuid(storedUuid);
                // Trigger profile refresh from Supabase after initial load
                await refreshProfile();
            }
            setLoading(false);
        };
        
        initAuth();
    }, [riderUuid]);

    // Simulation: Auto-verify after 30 seconds
    useEffect(() => {
        if (kycStatus === "in_review") {
            const timer = setTimeout(() => {
                setKycStatus("verified");
                localStorage.setItem("rider_kyc_status", "verified");
                console.log("KYC Auto-verified!");
            }, 30000); // 30 seconds

            return () => clearTimeout(timer);
        }
    }, [kycStatus]);

    const login = (uuid: string, name?: string | null, status?: string | null) => {
        console.log('login called:', { uuid, name, status });
        localStorage.setItem('rider_uuid', uuid);
        setRiderUuid(uuid);
        
        if (name !== undefined) {
            if (name) {
                localStorage.setItem('rider_kyc_name', name);
                setFullName(name);
            } else {
                localStorage.removeItem('rider_kyc_name');
                setFullName(null);
            }
        }
        
        if (status !== undefined) {
            if (status) {
                localStorage.setItem('rider_kyc_status', status);
                setKycStatus(status);
            } else {
                localStorage.removeItem('rider_kyc_status');
                setKycStatus(null);
            }
        }
    };

    const logout = () => {
        // Clear all auth and app state from localStorage
        localStorage.removeItem('rider_uuid');
        localStorage.removeItem('rider_phone');
        localStorage.removeItem('rider_kyc_name');
        localStorage.removeItem('rider_kyc_status');
        localStorage.removeItem('rider_is_online');
        localStorage.removeItem('rider_has_been_online');
        localStorage.removeItem('rider_earnings');
        localStorage.removeItem('rider_email');
        localStorage.removeItem('rider_avatar');
        localStorage.removeItem('rider_selected_city');
        localStorage.removeItem('rider_selected_hub');
        localStorage.removeItem('rider_selected_zone_id');
        localStorage.removeItem('rider_selected_hub_id');
        localStorage.removeItem('rider_selected_zone_name');
        localStorage.removeItem('rider_selected_hub_name');
        
        // Reset all React state
        setRiderUuid(null);
        setPhoneNumberState(null);
        setFullName(null);
        setKycStatus(null);
        setEmailState(null);
        setAvatarState(null);
        setTotalEarnings(0);
        setIsOnlineState(false);
        setSelectedCity(null);
        setSelectedHub(null);
        setSelectedZoneId(null);
        setSelectedHubId(null);
        setSelectedZoneName(null);
        setSelectedHubName(null);
        
        console.log('User logged out, all state cleared.');
    };

    return (
        <AuthContext.Provider value={{ 
            riderUuid, 
            phoneNumber, 
            fullName, 
            kycStatus, 
            kycDocsUrl,
            selectedCity,
            selectedHub,
            selectedZoneId,
            selectedHubId,
            selectedZoneName,
            selectedHubName,
            email, 
            avatar, 
            totalEarnings,
            isOnline,
            setIsOnline,
            setPhoneNumber, 
            updateEmail, 
            updateAvatar, 
            login, 
            refreshProfile,
            logout, 
            loading 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
