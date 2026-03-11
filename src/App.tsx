import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import Login from './pages/Login'
import OTP from './pages/OTP'
import WorkCity from './pages/WorkCity'
import OnboardingVehicle from './pages/OnboardingVehicle'
import OnboardingHub from './pages/OnboardingHub'

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
                </Routes>
            </Router>
        </AuthProvider>
    )
}

export default App
