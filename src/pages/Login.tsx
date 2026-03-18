import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bgLight from '../assets/bg-light.png';
import logo from '../assets/gridpe-logo.svg';
import { useAuth } from '../hooks/useAuth';

const Login: React.FC = () => {
    const [mobileNumber, setMobileNumber] = useState('');
    const navigate = useNavigate();
    const { setPhoneNumber } = useAuth();

    React.useEffect(() => {
        const kycStatus = localStorage.getItem('rider_kyc_status');
        if (kycStatus === 'verified' || kycStatus === 'in_review') {
            navigate('/dashboard');
        }
    }, [navigate]);

    const handleGetOtp = () => {
        if (mobileNumber.length === 10) {
            setPhoneNumber(mobileNumber);
            navigate('/otp');
        }
    };

    return (
        <div className="relative h-screen w-full flex flex-col items-center bg-white overflow-hidden font-satoshi">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src={bgLight}
                    alt="background"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-[400px] h-full flex flex-col items-center px-4 pt-[146px]">
                {/* Logo */}
                <div className="mb-[10px]">
                    <img
                        src={logo}
                        alt="GridPe Logo"
                        className="w-[146px] h-auto"
                        style={{ filter: 'brightness(0)' }}
                    />
                </div>

                {/* Sub-text below logo - One line */}
                <p className="text-[18px] font-medium text-black text-center leading-[24px] whitespace-nowrap">
                    Deliver with GridPe. Earn securely, every trip.
                </p>

                {/* Header */}
                <h1 className="mt-[92px] text-[26px] font-medium text-black text-center">
                    Mobile Number Login
                </h1>

                {/* Header Subtext */}
                <p className="mt-[10px] text-[14px] font-medium text-black text-center">
                    Enter your 10-digit mobile number
                </p>

                {/* Input Field */}
                <div className="mt-[40px] w-full max-w-[362px] h-[49px] flex items-center bg-[#F7F8FA] border border-[#E6E8EB] rounded-full px-[19px]">
                    <span className="text-[14px] font-normal text-black whitespace-nowrap">
                        + 91
                    </span>
                    <div className="mx-[24px] h-[35px] w-[1px] bg-black opacity-30" />
                    <input
                        type="tel"
                        maxLength={10}
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value.replace(/[^0-9]/g, ''))}
                        className="flex-1 bg-transparent border-none outline-none text-[16px] font-medium text-black"
                        placeholder=""
                    />
                </div>

                {/* Primary CTA */}
                <button
                    onClick={handleGetOtp}
                    disabled={mobileNumber.length !== 10}
                    className={`mt-[16px] w-full max-w-[362px] h-[48px] bg-primary rounded-full flex items-center justify-center transition-opacity hover:opacity-90 active:scale-[0.98] ${mobileNumber.length !== 10 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <span className="text-white text-[16px] font-medium">Get OTP</span>
                </button>

                {/* Post-CTA Text */}
                <p className="mt-[10px] text-[14px] font-medium text-black text-center leading-[21px] max-w-[300px]">
                    Your number will be used for login, payouts, and verification.
                </p>

                {/* Footer Text - 3 lines & Pushed up */}
                <div className="mt-auto mb-[40px] text-[14px] font-normal text-black text-center leading-[20px] max-w-[362px]">
                    By continuing, you agree to grid.pe’s{' '}
                    <span className="text-primary cursor-pointer hover:underline">Terms & Conditions</span> and{' '}
                    <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span> and consent to receive calls anytime over the next 7 days to assist with onboarding
                </div>
            </div>
        </div>
    );
};

export default Login;
