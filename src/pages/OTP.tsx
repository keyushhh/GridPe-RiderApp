import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bgLight from '../assets/bg-light.png';
import logo from '../assets/gridpe-logo.svg';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

const OTP: React.FC = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(20);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const navigate = useNavigate();
    const { phoneNumber, login } = useAuth();
    const inputs = useRef<(HTMLInputElement | null)[]>([]);

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
                // Simulate login for test credentials
                const riderUuid = '00000000-0000-0000-0000-000000000001';

                const { data: rider, error: riderError } = await supabase
                    .from('riders')
                    .select('*')
                    .eq('phone_number', fullPhone)
                    .maybeSingle(); // Better: doesn't throw PGRST116 if not found

                if (riderError) {
                    console.warn('Supabase rider fetch error (expected for new test users):', riderError);
                }

                console.log('Rider data fetched (test):', rider);

                const finalId = rider?.id || riderUuid;
                
                // --- TEST ACCOUNT PERSISTENCE FALLBACK ---
                // Since RLS prevents DB updates for the mock bypass account, 
                // we check local storage for previously saved test data that survives logout.
                const persistentTestData = localStorage.getItem(`test_data_${fullPhone}`);
                let parsedTestData = null;
                if (persistentTestData) {
                    try { parsedTestData = JSON.parse(persistentTestData); } catch (e) { console.error(e); }
                }

                const finalName = rider?.full_name || (rider as any)?.fullName || (rider as any)?.name || parsedTestData?.fullName || null;
                const kycStatus = (rider?.kyc_status as any) || parsedTestData?.kycStatus || (finalName ? 'in_review' : 'pending');
                // ------------------------------------------

                console.log('Login details (test bypass):', { finalId, finalName, kycStatus });
                
                setTimeout(() => {
                    // Update local auth state
                    login(finalId, finalName, kycStatus);
                    
                    if (kycStatus === 'verified' || kycStatus === 'in_review') {
                        navigate('/dashboard');
                    } else {
                        navigate('/work-city');
                    }
                }, 1500);
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
                    // Fetch rider profile to check for existing KYC
                    const { data: rider, error: riderError } = await supabase
                        .from('riders')
                        .select('*')
                        .eq('id', data.user.id)
                        .single();

                    if (riderError && riderError.code !== 'PGRST116') {
                        console.error('Error fetching rider profile:', riderError);
                    }

                    console.log('Rider data fetched (real):', rider);

                    // Fallback for name columns
                    const fetchedName = rider?.full_name || (rider as any)?.fullName || (rider as any)?.name || null;
                    const kycStatus = localStorage.getItem('rider_kyc_status') || (fetchedName ? 'in_review' : 'pending');
                    
                    login(data.user.id, fetchedName, kycStatus);

                    if (kycStatus === 'verified' || kycStatus === 'in_review') {
                        navigate('/dashboard');
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
