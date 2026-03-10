import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    riderUuid: string | null;
    phoneNumber: string | null;
    setPhoneNumber: (phone: string | null) => void;
    login: (uuid: string) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [riderUuid, setRiderUuid] = useState<string | null>(localStorage.getItem('rider_uuid'));
    const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUuid = localStorage.getItem('rider_uuid');
        if (storedUuid) {
            setRiderUuid(storedUuid);
        }
        setLoading(false);
    }, []);

    const login = (uuid: string) => {
        localStorage.setItem('rider_uuid', uuid);
        setRiderUuid(uuid);
    };

    const logout = () => {
        localStorage.removeItem('rider_uuid');
        setRiderUuid(null);
    };

    return (
        <AuthContext.Provider value={{ riderUuid, phoneNumber, setPhoneNumber, login, logout, loading }}>
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
