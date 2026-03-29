import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import Login from './pages/Login'
import OTP from './pages/OTP'
import WorkCity from './pages/WorkCity'
import OnboardingVehicle from './pages/OnboardingVehicle'
import OnboardingHub from './pages/OnboardingHub'
import OnboardingGuidelines from './pages/OnboardingGuidelines'
import OnboardingKYC from './pages/OnboardingKYC'
import OnboardingKYCUpload from './pages/OnboardingKYCUpload'
import OnboardingKYCSelfie from './pages/OnboardingKYCSelfie'
import OnboardingKYCReview from './pages/OnboardingKYCReview'
import OnboardingKYCSuccess from './pages/OnboardingKYCSuccess'
import OnboardingStepTwo from './pages/OnboardingStepTwo'
import FetchingVehicleDetails from './pages/FetchingVehicleDetails'
import DetailsFetchedSuccess from './pages/DetailsFetchedSuccess'
import IdentityVerificationInfo from './pages/IdentityVerificationInfo'
import Home from './pages/Home'
import OrderDelivered from './pages/OrderDelivered'
import Shifts from './pages/Shifts'
import Earnings from './pages/Earnings'
import EarningsDetail from './pages/EarningsDetail'
import AutoPayout from './pages/AutoPayout'
import AutoPayoutSuccess from './pages/AutoPayoutSuccess'
import AccountSettings from './pages/AccountSettings'
import EditEmail from './pages/EditEmail'
import Notifications from './pages/Notifications'
import Wallet from './pages/Wallet'
import WithdrawSuccess from '@/pages/WithdrawSuccess'
import TransactionHistory from '@/pages/TransactionHistory'
import SupportRequests from './pages/SupportRequests'
import HelpCategory from './pages/HelpCategory'
import ZingChat from './pages/ZingChat'
import VideoVerification from './pages/VideoVerification'

import { ToastProvider } from './context/ToastContext'
import GlobalCustomToaster from './components/GlobalCustomToaster'

import { useAuth } from './hooks/useAuth'
import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
    const { kycStatus, riderUuid, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (loading) return;

        const isOnboardingPath = location.pathname.startsWith('/onboarding') || 
                                 location.pathname === '/' || 
                                 location.pathname === '/login' || 
                                 location.pathname === '/otp' ||
                                 location.pathname === '/work-city';

        if (kycStatus === 'verified' && isOnboardingPath) {
            console.log('AuthGuard: Verified rider detected on onboarding path. Redirecting to dashboard.');
            navigate('/dashboard', { replace: true });
        }
    }, [kycStatus, loading, location.pathname, navigate]);

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-white">
                <div className="w-12 h-12 border-4 border-[#5260FE] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return <>{children}</>;
};

function App() {
    return (
        <AuthProvider>
            <ToastProvider>
                <Router>
                    <AuthGuard>
                        <Routes>
                            {/* ... existing routes ... */}
                            <Route path="/history" element={<TransactionHistory />} />
                            <Route path="/" element={<Login />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/otp" element={<OTP />} />
                            <Route path="/work-city" element={<WorkCity />} />
                            <Route path="/onboarding/vehicle" element={<OnboardingVehicle />} />
                            <Route path="/onboarding/step-2-new" element={<OnboardingStepTwo />} />
                            <Route path="/onboarding/fetching-details" element={<FetchingVehicleDetails />} />
                            <Route path="/onboarding/details-success" element={<DetailsFetchedSuccess />} />
                            <Route path="/onboarding/step-2" element={<OnboardingHub />} />
                            <Route path="/onboarding/guidelines" element={<OnboardingGuidelines />} />
                            <Route path="/onboarding/kyc" element={<OnboardingKYC />} />
                            <Route path="/onboarding/kyc-upload" element={<OnboardingKYCUpload />} />
                            <Route path="/onboarding/kyc-selfie" element={<OnboardingKYCSelfie />} />
                            <Route path="/onboarding/kyc-review" element={<OnboardingKYCReview />} />
                            <Route path="/onboarding/kyc-success" element={<OnboardingKYCSuccess />} />
                            <Route path="/onboarding/identity-info" element={<IdentityVerificationInfo />} />
                            <Route path="/order-delivered" element={<OrderDelivered />} />
                            <Route path="/dashboard" element={<Home />} />
                            <Route path="/shifts" element={<Shifts />} />
                            <Route path="/earnings" element={<Earnings />} />
                            <Route path="/earnings-detail" element={<EarningsDetail />} />
                            <Route path="/auto-payout" element={<AutoPayout />} />
                            <Route path="/auto-payout-success" element={<AutoPayoutSuccess />} />
                            <Route path="/account-settings" element={<AccountSettings />} />
                            <Route path="/account-settings/email" element={<EditEmail />} />
                            <Route path="/notifications" element={<Notifications />} />
                            <Route path="/wallet" element={<Wallet />} />
                            <Route path="/withdraw-success" element={<WithdrawSuccess />} />
                            <Route path="/account-settings/support-requests" element={<SupportRequests />} />
                            <Route path="/help/category/:categoryId" element={<HelpCategory />} />
                            <Route path="/help/chat" element={<ZingChat />} />
                            <Route path="/video-verification" element={<VideoVerification />} />
                        </Routes>
                    </AuthGuard>
                    <GlobalCustomToaster />
                </Router>
            </ToastProvider>
        </AuthProvider>
    )
}

export default App
