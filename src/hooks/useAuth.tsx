import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    riderUuid: string | null;
    riderId: string | null;
    phoneNumber: string | null;
    fullName: string | null;
    kycStatus: string | null;
    email: string | null;
    pendingEmail: string | null;
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
    workCity: string | null;
    hasPasskeys: boolean;
    isOnboarded: boolean;
    setIsOnline: (online: boolean) => void;
    setIsOnboarded: (val: boolean) => void;
    setPhoneNumber: (phone: string | null) => void;
    updateEmail: (email: string | null) => void;
    updateAvatar: (file: File) => Promise<string | null>;
    login: (uuid: string, riderId: string, fullName?: string | null, kycStatus?: string | null) => void;
    refreshProfile: () => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [riderUuid, setRiderUuid] = useState<string | null>(localStorage.getItem('rider_uuid'));
    const [riderId, setRiderId] = useState<string | null>(localStorage.getItem('rider_id'));
    const [phoneNumber, setPhoneNumberState] = useState<string | null>(localStorage.getItem('rider_phone'));
    const [fullName, setFullName] = useState<string | null>(localStorage.getItem('rider_kyc_name'));
    const [kycStatus, setKycStatus] = useState<string | null>(localStorage.getItem('rider_kyc_status'));
    const [email, setEmailState] = useState<string | null>(localStorage.getItem('rider_email'));
    const [pendingEmail, setPendingEmailState] = useState<string | null>(localStorage.getItem('rider_pending_email'));
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
    const [workCity, setWorkCity] = useState<string | null>(localStorage.getItem('rider_work_city'));
    const [hasPasskeys, setHasPasskeys] = useState<boolean>(localStorage.getItem('rider_has_passkeys') === 'true');
    const [isOnboarded, setIsOnboardedState] = useState<boolean>(localStorage.getItem('rider_is_onboarded') === 'true');
    const [loading, setLoading] = useState(true);

    const setIsOnline = (online: boolean) => {
        localStorage.setItem('rider_is_online', online.toString());
        setIsOnlineState(online);
    };

    const setIsOnboarded = (val: boolean) => {
        localStorage.setItem('rider_is_onboarded', val.toString());
        setIsOnboardedState(val);
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

    const updateAvatar = async (file: File) => {
        if (!riderUuid) return null;

        try {
            const fileExt = file.name.split('.').pop() || 'jpg';
            const filePath = `${riderUuid}/profile.${fileExt}`;

            // Upload/Overwrite to Storage
            const { error: uploadError } = await supabase.storage
                .from('rider-profiles')
                .upload(filePath, file, {
                    upsert: true,
                    cacheControl: '3600',
                });

            if (uploadError) throw uploadError;

            // Get the public URL
            const { data: { publicUrl } } = supabase.storage
                .from('rider-profiles')
                .getPublicUrl(filePath);

            // Update profile_url in the riders table
            const { error: dbError } = await supabase
                .from('riders')
                .update({ profile_url: publicUrl })
                .eq('id', riderUuid);

            if (dbError) throw dbError;

            // Update local state and storage
            setAvatarState(publicUrl);
            localStorage.setItem('rider_avatar', publicUrl);

            return publicUrl;
        } catch (err) {
            console.error('Error updating avatar:', err);
            throw err;
        }
    };

    const refreshProfile = async () => {
        if (!riderUuid) return;

        try {
            const { data: authData } = await supabase.auth.getUser();
            const confirmedEmail = authData?.user?.email || null;
            const newEmail = authData?.user?.new_email || null;

            if (newEmail) {
                setPendingEmailState(newEmail);
                localStorage.setItem('rider_pending_email', newEmail);
            } else {
                setPendingEmailState(null);
                localStorage.removeItem('rider_pending_email');
            }

            let currentUuid = riderUuid;
            let currentRiderId = riderId;

            // 1. Resolve UUID from riderId if UUID is missing or dummy
            if (!currentUuid || currentUuid.startsWith('00000000')) {
                // Only lookup if currentRiderId is a valid text ID (e.g. GRIDPE-RDR...)
                if (currentRiderId && currentRiderId.includes('GRIDPE-RDR')) {
                    console.log(`Resolving UUID for text rider_id: ${currentRiderId}...`);
                    const { data: resolver, error: resolveError } = await supabase
                        .from('riders')
                        .select('id')
                        .eq('rider_id', currentRiderId)
                        .maybeSingle();
                    
                    if (resolveError) {
                        console.error('Error resolving UUID from rider_id:', resolveError);
                    } else if (resolver?.id) {
                        currentUuid = resolver.id;
                        setRiderUuid(currentUuid);
                        localStorage.setItem('rider_uuid', currentUuid);
                        console.log(`UUID resolved: ${currentUuid}`);
                    }
                } else if (currentRiderId && !currentRiderId.startsWith('00000000')) {
                    // If currentRiderId is not a text ID but looks like a valid UUID, use it
                    currentUuid = currentRiderId;
                    setRiderUuid(currentUuid);
                    localStorage.setItem('rider_uuid', currentUuid);
                }
            }

            if (!currentUuid || currentUuid.startsWith('00000000')) {
                console.warn('Cannot refresh profile: No valid UUID available. Attempting auth-based resolution...');
                
                // Try resolving via Supabase Auth session
                const authUserId = authData?.user?.id;
                if (authUserId && !authUserId.startsWith('00000000')) {
                    const { data: authRider } = await supabase
                        .from('riders')
                        .select('id, rider_id')
                        .eq('id', authUserId)
                        .maybeSingle();
                    
                    if (authRider?.id) {
                        currentUuid = authRider.id;
                        setRiderUuid(currentUuid);
                        localStorage.setItem('rider_uuid', currentUuid);
                        if (authRider.rider_id) {
                            setRiderId(authRider.rider_id);
                            localStorage.setItem('rider_id', authRider.rider_id);
                        }
                        console.log(`UUID resolved via auth session: ${currentUuid}`);
                    } else {
                        console.warn('No rider found via auth session either. Profile refresh aborted.');
                        return;
                    }
                } else {
                    return;
                }
            }

            const { data, error } = await supabase
                .from('riders')
                .select('*, service_zones(id, name), hubs(id, location_name)')
                .eq('id', currentUuid)
                .maybeSingle();

            if (error) {
                console.error('Error refreshing profile:', error);
                return;
            }

            if (!data) {
                console.warn(`Rider profile for ${currentUuid} not found in database.`);
                // Fallback for development if rider is not in DB
                if (currentUuid.startsWith('00000000')) {
                    setFullName('GridPe Rider');
                    setKycStatus('pending');
                }
                return;
            }

            // Sync Supabase data to local state & storage
            if (data.rider_id) {
                setFullName(data.full_name);
                setRiderId(data.rider_id);
                localStorage.setItem('rider_kyc_name', data.full_name);
                localStorage.setItem('rider_id', data.rider_id);
            }

            if (confirmedEmail && data.email !== confirmedEmail) {
                await supabase.from('riders').update({ email: confirmedEmail }).eq('id', currentUuid);
                setEmailState(confirmedEmail);
                localStorage.setItem('rider_email', confirmedEmail);
            } else if (data.email) {
                setEmailState(data.email);
                localStorage.setItem('rider_email', data.email);
            } else if (confirmedEmail) {
                setEmailState(confirmedEmail);
                localStorage.setItem('rider_email', confirmedEmail);
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
            if (data.profile_url) {
                setAvatarState(data.profile_url);
                localStorage.setItem('rider_avatar', data.profile_url);
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
            if (data.service_zones && (data.service_zones as any).name) {
                const zName = (data.service_zones as any).name;
                setSelectedZoneName(zName);
                localStorage.setItem('rider_selected_zone_name', zName);
            }
            if (data.hubs?.location_name) {
                setSelectedHubName(data.hubs.location_name);
                localStorage.setItem('rider_selected_hub_name', data.hubs.location_name);
            }
            if (data.work_city) {
                setWorkCity(data.work_city);
                localStorage.setItem('rider_work_city', data.work_city);
            }
            if (data.has_passkeys !== undefined) {
                setHasPasskeys(data.has_passkeys);
                localStorage.setItem('rider_has_passkeys', data.has_passkeys.toString());
            }
            if (data.is_onboarded !== undefined) {
                setIsOnboardedState(data.is_onboarded);
                localStorage.setItem('rider_is_onboarded', data.is_onboarded.toString());
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


    const login = (uuid: string, rId: string, name?: string | null, status?: string | null) => {
        console.log('login called:', { uuid, rId, name, status });
        
        // Safety: Don't let rId (text ID) be overwritten by a UUID if we already have one
        const currentStoredId = localStorage.getItem('rider_id');
        const isNewIdUuid = rId && (rId.includes('-') && rId.length > 20);
        const shouldUpdateId = !isNewIdUuid || !currentStoredId || !currentStoredId.includes('GRIDPE-RDR');

        localStorage.setItem('rider_uuid', uuid);
        setRiderUuid(uuid);

        if (shouldUpdateId && rId) {
            localStorage.setItem('rider_id', rId);
            setRiderId(rId);
        }
        
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
        localStorage.removeItem('rider_id');
        localStorage.removeItem('rider_phone');
        localStorage.removeItem('rider_kyc_name');
        localStorage.removeItem('rider_kyc_status');
        localStorage.removeItem('rider_is_online');
        localStorage.removeItem('rider_has_been_online');
        localStorage.removeItem('rider_earnings');
        localStorage.removeItem('rider_email');
        localStorage.removeItem('rider_pending_email');
        localStorage.removeItem('rider_avatar');
        localStorage.removeItem('rider_selected_city');
        localStorage.removeItem('rider_selected_hub');
        localStorage.removeItem('rider_selected_zone_id');
        localStorage.removeItem('rider_selected_hub_id');
        localStorage.removeItem('rider_selected_zone_name');
        localStorage.removeItem('rider_selected_hub_name');
        localStorage.removeItem('rider_bank_accounts');
        localStorage.removeItem('rider_work_city');
        localStorage.removeItem('rider_has_passkeys');
        localStorage.removeItem('rider_is_onboarded');
        
        // Ensure absolutely no Didit cache keys stick around between Rider accounts.
        Object.keys(localStorage).forEach(key => {
            if (key.toLowerCase().includes('didit')) {
                localStorage.removeItem(key);
            }
        });

        // Reset all React state
        setRiderUuid(null);
        setRiderId(null);
        setPhoneNumberState(null);
        setFullName(null);
        setKycStatus(null);
        setEmailState(null);
        setPendingEmailState(null);
        setAvatarState(null);
        setTotalEarnings(0);
        setIsOnlineState(false);
        setSelectedCity(null);
        setSelectedHub(null);
        setSelectedZoneId(null);
        setSelectedHubId(null);
        setSelectedZoneName(null);
        setSelectedHubName(null);
        setWorkCity(null);
        setHasPasskeys(false);
        setIsOnboardedState(false);
        
        console.log('User logged out, all state cleared.');
    };

    return (
        <AuthContext.Provider value={{ 
            riderUuid, 
            riderId,
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
            pendingEmail,
            avatar, 
            totalEarnings,
            isOnline,
            workCity,
            hasPasskeys,
            isOnboarded,
            setIsOnline,
            setIsOnboarded,
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
