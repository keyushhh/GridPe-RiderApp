import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import Login from './pages/Login'
import OTP from './pages/OTP'
import WorkCity from './pages/WorkCity'
import OnboardingVehicle from './pages/OnboardingVehicle'
import OnboardingHub from './pages/OnboardingHub'
import OnboardingGuidelines from './pages/OnboardingGuidelines'
import OnboardingKYC from './pages/OnboardingKYC'
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
import logo from './assets/gridpe-logo.svg'

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
    const { kycStatus, riderUuid, isOnboarded, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (loading) return;

        const isOnboardingPath = location.pathname.startsWith('/onboarding') || 
                                 location.pathname === '/' || 
                                 location.pathname === '/login' || 
                                 location.pathname === '/otp' ||
                                 location.pathname === '/work-city';

        if ((kycStatus === 'verified' || kycStatus === 'in_review') && isOnboardingPath) {
            if (!isOnboarded && location.pathname !== '/onboarding/identity-info') {
                console.log('AuthGuard: Verified rider needs operational briefing. Redirecting to identity-info.');
                navigate('/onboarding/identity-info', { replace: true });
            } else if (isOnboarded) {
                console.log('AuthGuard: Verified/In-Review rider detected on onboarding path. Redirecting to dashboard.');
                navigate('/dashboard', { replace: true });
            }
        } else if (riderUuid && (!kycStatus || kycStatus === 'pending') && !isOnboardingPath) {
            console.log('AuthGuard: Pending rider detected outside onboarding. Redirecting to onboarding.');
            navigate('/work-city', { replace: true });
        } else if (!riderUuid && !isOnboardingPath) {
            console.log('AuthGuard: Logged out user. Redirecting to login.');
            navigate('/', { replace: true });
        }
    }, [kycStatus, riderUuid, loading, location.pathname, navigate]);

    if (loading) {
        return (
            <div className="h-[100dvh] w-full flex items-center justify-center bg-white">
                <img src={logo} alt="GridPe" className="w-[120px] animate-pulse" />
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
