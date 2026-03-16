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
import IdentityVerificationInfo from './pages/IdentityVerificationInfo'
import Home from './pages/Home'
import OrderDelivered from './pages/OrderDelivered'
import Shifts from './pages/Shifts'

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/otp" element={<OTP />} />
                    <Route path="/work-city" element={<WorkCity />} />
                    <Route path="/onboarding/vehicle" element={<OnboardingVehicle />} />
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
                </Routes>
            </Router>
        </AuthProvider>
    )
}

export default App
