import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    riderUuid: string | null;
    phoneNumber: string | null;
    fullName: string | null;
    kycStatus: string | null;
    email: string | null;
    avatar: string | null;
    setPhoneNumber: (phone: string | null) => void;
    updateEmail: (email: string | null) => void;
    updateAvatar: (avatar: string | null) => void;
    login: (uuid: string, fullName?: string | null, kycStatus?: string | null) => void;
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
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        const storedUuid = localStorage.getItem('rider_uuid');
        const storedPhone = localStorage.getItem('rider_phone');
        const storedName = localStorage.getItem('rider_kyc_name');
        const storedStatus = localStorage.getItem('rider_kyc_status');
        const storedEmail = localStorage.getItem('rider_email');
        const storedAvatar = localStorage.getItem('rider_avatar');
        
        console.log('AuthProvider init:', { storedUuid, storedPhone, storedName, storedStatus, storedEmail, storedAvatar });
        
        if (storedUuid) setRiderUuid(storedUuid);
        if (storedPhone) setPhoneNumberState(storedPhone);
        if (storedName) setFullName(storedName);
        if (storedStatus) setKycStatus(storedStatus);
        if (storedEmail) setEmailState(storedEmail);
        if (storedAvatar) setAvatarState(storedAvatar);
        
        setLoading(false);
    }, []);

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
        
        // Reset all React state
        setRiderUuid(null);
        setPhoneNumberState(null);
        setFullName(null);
        setKycStatus(null);
        setEmailState(null);
        setAvatarState(null);
        
        console.log('User logged out, all state cleared.');
    };

    return (
        <AuthContext.Provider value={{ riderUuid, phoneNumber, fullName, kycStatus, email, avatar, setPhoneNumber, updateEmail, updateAvatar, login, logout, loading }}>
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
