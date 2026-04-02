import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bgLight from '../assets/bg-light.png';
import logo from '../assets/gridpe-logo.svg';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { getDeviceName } from '../utils/deviceInfo';

const OTP: React.FC = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(20);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const navigate = useNavigate();
    const { phoneNumber, login } = useAuth();
    const inputs = useRef<(HTMLInputElement | null)[]>([]);

    const logSession = async (riderId: string) => {
        try {
            await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/log-rider-session`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
                    },
                    body: JSON.stringify({
                        riderId: riderId,
                        deviceName: getDeviceName()
                    })
                }
            )
        } catch (e) {
            console.log('Session log failed silently:', e)
        }
    }

    useEffect(() => {
        if (!phoneNumber) {
            navigate('/login');
        }
    }, [phoneNumber, navigate]);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleChange = (element: HTMLInputElement, index: number) => {
        if (isNaN(Number(element.value))) return false;
        if (errorMsg) setErrorMsg(null); // Clear error on typing

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        // Focus next input
        if (element.value !== '' && index < 5) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handleContinue = async () => {
        const otpValue = otp.join('');
        // Ensure we don't double-prefix with 91 if it's already there
        const fullPhone = phoneNumber?.startsWith('91') ? phoneNumber : `91${phoneNumber}`;
        setErrorMsg(null);

        // Normalization check & Test credentials
        if (fullPhone === '918730889502') {
            if (otpValue === '123456') {
                try {
                    // Test path: We have NO Supabase Auth session here.
                    // RLS policies require auth.uid() — so INSERT will fail with 42501.
                    // Strategy: Only SELECT (which may be allowed), and if no profile
                    // exists, navigate to onboarding where the real auth flow handles creation.

                    const { data: rider, error: riderError } = await supabase
                        .from('riders')
                        .select('*')
                        .eq('phone_number', fullPhone)
                        .maybeSingle();

                    if (riderError) {
                        console.warn('Test rider fetch error (RLS may block this):', riderError);
                    }

                    console.log('Rider data fetched (test):', rider);

                    if (rider) {
                        // Existing rider found — login and navigate
                        const finalId = rider.id;
                        const finalRiderId = rider.rider_id || '';
                        const finalName = rider.full_name || null;
                        const kycStatus = rider.kyc_status || 'pending';
                        const isOnboarded = rider.is_onboarded || false;

                        console.log('Test login — existing rider:', { finalId, finalRiderId, kycStatus });

                        login(finalId, finalRiderId, finalName, kycStatus);

                        if (finalRiderId && finalRiderId !== '') {
                            await logSession(finalRiderId);
                        }

                        setTimeout(() => {
                            if ((kycStatus === 'verified' || kycStatus === 'in_review')) {
                                if (!isOnboarded) {
                                    navigate('/onboarding/identity-info');
                                } else {
                                    navigate('/dashboard');
                                }
                            } else {
                                navigate('/work-city');
                            }
                        }, 1000);
                    } else {
                        // No profile exists and we can't INSERT without auth session.
                        // Navigate to onboarding — profile will be created during KYC submission
                        // where the real auth session exists.
                        console.log('Test user: No profile found. Navigating to onboarding.');
                        console.log('NOTE: Profile will be created during the KYC step with a real auth session.');

                        // Set minimal local state so the app knows we're in onboarding
                        login('', '', 'Test Rider', 'pending');

                        setTimeout(() => {
                            navigate('/work-city');
                        }, 1000);
                    }
                } catch (err) {
                    console.error('Test login flow error:', err);
                    setErrorMsg('Login failed. Please try again.');
                }
                return;

            } else {
                setErrorMsg("That code's off target. Double-check your SMS.");
            }
        } else {
            // Real OTP verification logic with Supabase
            try {
                const { data, error } = await supabase.auth.verifyOtp({
                    phone: fullPhone,
                    token: otpValue,
                    type: 'sms'
                });

                if (error) {
                    setErrorMsg("That code's off target. Double-check your SMS.");
                    throw error;
                }

                if (data.user) {
                    const authUserId = data.user.id;
                    console.log('Auth user ID:', authUserId);

                    // CRITICAL: Verify auth session is valid before any DB operations
                    const { data: authCheck } = await supabase.auth.getUser();
                    if (!authCheck?.user?.id) {
                        console.error('CRITICAL: auth.getUser() returned null after OTP verify');
                        setErrorMsg('Session validation failed. Please try again.');
                        return;
                    }
                    console.log('Auth session confirmed. user.id:', authCheck.user.id);

                    // Fetch rider profile — riders.id = auth user UUID
                    let rider: any = null;
                    const { data: existingRider, error: riderError } = await supabase
                        .from('riders')
                        .select('*')
                        .eq('id', authUserId)
                        .maybeSingle();

                    if (riderError) {
                        console.error('Error fetching rider profile:', riderError);
                    }

                    rider = existingRider;
                    console.log('Rider data fetched (real):', rider);

                    // Auto-create profile if this is a brand new user
                    if (!rider) {
                        // Use timestamp for unique rider_id — no collisions
                        const newRiderId = `GRIDPE-RDR${Date.now()}`;

                        const newRiderData = {
                            id: authUserId, // UUID type — matches auth.uid() for RLS
                            phone_number: fullPhone,
                            rider_id: newRiderId,
                            kyc_status: 'pending',
                            full_name: '',
                        };

                        // Log the exact payload before insert
                        console.log('Inserting Rider:', newRiderData);

                        try {
                            const { data: newRider, error: insertError } = await supabase
                                .from('riders')
                                .insert(newRiderData)
                                .select('*')
                                .single();

                            if (insertError) throw insertError;

                            rider = newRider;
                            console.log('Auto-created rider profile:', newRider);
                        } catch (insertErr: any) {
                            console.error('Insert failed:', insertErr.message, insertErr.code);
                            // Profile may already exist — fetch by phone as fallback
                            const { data: fallback } = await supabase
                                .from('riders')
                                .select('*')
                                .eq('phone_number', fullPhone)
                                .maybeSingle();

                            if (fallback) {
                                rider = fallback;
                                console.log('Fetched existing profile via phone fallback:', fallback);
                            } else {
                                console.error('CRITICAL: Could not create or find rider profile');
                            }
                        }
                    }

                    const fetchedName = rider?.full_name || null;
                    const kycStatus = rider?.kyc_status || 'pending';
                    const riderId = rider?.rider_id || '';
                    const isOnboarded = rider?.is_onboarded || false;

                    // Update auth state synchronously
                    login(authUserId, riderId, fetchedName, kycStatus);

                    // Await session log before navigating
                    if (riderId && riderId !== '') {
                        await logSession(riderId);
                    }

                    // Navigate
                    if (rider && (kycStatus === 'verified' || kycStatus === 'in_review')) {
                        if (!isOnboarded) {
                            navigate('/onboarding/identity-info');
                        } else {
                            navigate('/dashboard');
                        }
                    } else {
                        navigate('/work-city');
                    }
                }
            } catch (err) {
                console.error('Verification failed', err);
                if (!errorMsg) setErrorMsg("Session validation failed. Please try again.");
            }
        }
    };

    const handleResend = () => {
        if (timer === 0) {
            setTimer(20);
            setErrorMsg(null);
            // Trigger resend logic
        }
    };

    return (
        <div className="relative h-screen w-full flex flex-col items-center bg-white overflow-hidden font-satoshi">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img src={bgLight} alt="background" className="w-full h-full object-cover" />
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-[400px] h-full flex flex-col items-center px-4 pt-[146px]">
                {/* Logo */}
                <div className="mb-[10px]">
                    <img src={logo} alt="GridPe Logo" className="w-[146px] h-auto" style={{ filter: 'brightness(0)' }} />
                </div>

                {/* Sub-text */}
                <p className="text-[18px] font-medium text-black text-center leading-[24px] whitespace-nowrap">
                    Deliver with GridPe. Earn securely, every trip.
                </p>

                {/* Header */}
                <h1 className="mt-[92px] text-[26px] font-medium text-black text-center">
                    Enter your OTP
                </h1>

                {/* Header Subtext */}
                <p className="mt-[10px] text-[14px] font-medium text-black text-center">
                    Code sent to <span className="text-primary font-bold">+91 {phoneNumber}</span>
                </p>

                {/* OTP Input Boxes */}
                <div className="mt-[40px] flex gap-[8px]">
                    {otp.map((data, index) => (
                        <input
                            key={index}
                            ref={(el) => { inputs.current[index] = el; }}
                            type="text"
                            maxLength={1}
                            value={data}
                            onChange={(e) => handleChange(e.target, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            className={`w-[52px] h-[68px] bg-[#F7F8FA] border ${errorMsg ? 'border-[#FA1515]' : 'border-[#E6E8EB]'} rounded-[8px] text-center text-[24px] font-medium focus:border-primary outline-none transition-colors`}
                        />
                    ))}
                </div>

                {/* Messaging & Controls Container */}
                <div className="w-full max-w-[362px] flex flex-col items-start">
                    {/* Error Message */}
                    {errorMsg && (
                        <p className="mt-[12px] text-[14px] font-medium text-[#FA1515] text-left">
                            {errorMsg}
                        </p>
                    )}

                    {/* OTP Controls */}
                    <div className="mt-[12px] w-full flex justify-between">
                        <span
                            onClick={() => navigate('/login')}
                            className="text-primary text-[14px] font-medium cursor-pointer"
                        >
                            Wrong number? Fix it here.
                        </span>
                        <span
                            onClick={handleResend}
                            className={`text-primary text-[14px] font-medium ${timer > 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                            {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
                        </span>
                    </div>
                </div>

                {/* Continue CTA */}
                <button
                    onClick={handleContinue}
                    disabled={otp.join('').length !== 6}
                    className={`mt-[16px] w-full max-w-[362px] h-[48px] bg-primary rounded-full flex items-center justify-center transition-opacity hover:opacity-90 active:scale-[0.98] ${otp.join('').length !== 6 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <span className="text-white text-[16px] font-medium">Continue</span>
                </button>

                {/* Post-CTA Text */}
                <p className="mt-[10px] text-[14px] font-medium text-black text-center leading-[21px] max-w-[300px]">
                    Your number will be used for login, payouts, and verification.
                </p>

                {/* Footer Text */}
                <div className="mt-auto mb-[40px] text-[14px] font-normal text-black text-center leading-[20px] max-w-[362px]">
                    By continuing, you agree to grid.pe’s{' '}
                    <span className="text-primary cursor-pointer hover:underline">Terms & Conditions</span> and{' '}
                    <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span> and consent to receive calls anytime over the next 7 days to assist with onboarding
                </div>
            </div>
        </div>
    );
};

export default OTP;
