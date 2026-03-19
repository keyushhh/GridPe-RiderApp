import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import avatarImg from "../assets/avatar.png";
import giftIcon from "../assets/gift.svg";
import referralImg from "../assets/referral image.png";
import homeIcon from "../assets/home.svg";
import earningsIcon from "../assets/earnings.svg";
import notificationsIcon from "../assets/notifications.svg";
import refreshIcon from "../assets/Refresh.svg";
import OrderModal from "../components/OrderModal";
import PickUpVerificationModal from "../components/PickUpVerificationModal";
import FaceVerification from "../components/FaceVerification";
import DeliveryOTPModal from "../components/DeliveryOTPModal";
import NotificationBottomSheet from "../components/NotificationBottomSheet";
import { useAuth } from "../hooks/useAuth";

const Home = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState("home");
    const [isOnline, setIsOnline] = useState(
        localStorage.getItem("rider_is_online") === "true"
    );
    const { kycStatus, fullName } = useAuth();
    const [hasBeenOnline, setHasBeenOnline] = useState(
        localStorage.getItem("rider_has_been_online") === "true"
    );
    const [earnings, setEarnings] = useState(
        Number(localStorage.getItem("rider_earnings")) || 0
    );
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [hasActiveOrder, setHasActiveOrder] = useState(false);
    const [showPickUpModal, setShowPickUpModal] = useState(false);
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [showFaceVerification, setShowFaceVerification] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [orderStatus, setOrderStatus] = useState<'pickup_pending' | 'picked_up'>('pickup_pending');
    const [verificationType, setVerificationType] = useState<'pickup' | 'delivery'>('pickup');
    const [isAtHub, setIsAtHub] = useState(false);
    const [isAtCustomer, setIsAtCustomer] = useState(false);
    const [showNotificationSheet, setShowNotificationSheet] = useState(false);

    // Simulation: Reach hub after 5 seconds of active order
    useEffect(() => {
        if (hasActiveOrder && !isAtHub) {
            const timer = setTimeout(() => {
                setIsAtHub(true);
            }, 5000); // 5 seconds
            return () => clearTimeout(timer);
        }
    }, [hasActiveOrder, isAtHub]);

    // Use actual name if available from KYC
    const riderName = fullName || "";

    const navItems = [
        { id: "home", label: "Home", icon: homeIcon },
        { id: "earnings", label: "Earnings", icon: earningsIcon },
        { id: "notifications", label: "Notifications", icon: notificationsIcon },
    ];

    // Simulation: Reach customer after 8 seconds of picked up
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (orderStatus === 'picked_up') {
            timer = setTimeout(() => {
                setIsAtCustomer(true);
            }, 8000);
        }
        return () => clearTimeout(timer);
    }, [orderStatus]);

    // Handle Order Completion from OrderDelivered page
    useEffect(() => {
        const state = location.state as any;
        if (state?.orderCompleted) {
            setHasActiveOrder(false);
            // Refresh local earnings from storage
            setEarnings(Number(localStorage.getItem("rider_earnings")) || 0);
            // Clear location state to prevent repeat logic
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const handleOpenInMaps = () => {
        const address = orderStatus === 'picked_up' 
            ? "No. 83, 7th Cross, 4th Block, Koramangala, Bangalore - 560034"
            : "Kormangala Hub, E 61 St & S Rhodes Ave, Bangalore - 560063";
        const encodedAddress = encodeURIComponent(address);
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
    };

    return (
        <div className="relative h-[100dvh] w-full bg-white font-satoshi overflow-hidden flex flex-col items-center">
            {/* Standardized Glowing Orb: Dynamic Color */}
            <div
                className="absolute top-[-20px] left-1/2 -translate-x-1/2 w-[166px] h-[40px] rounded-full pointer-events-none z-0 transition-colors duration-500"
                style={{
                    backgroundColor: kycStatus === "verified" ? "#5260FE" : "#FACC15",
                    filter: "blur(60px)",
                    opacity: 0.8,
                }}
            />

            {/* Header Container */}
            <div className={`flex-none flex items-center justify-between w-[362px] px-0 pt-12 pb-2 relative z-10`}>
                <h1 className="text-black text-[24px] font-bold leading-none">
                    Welcome, {riderName}!
                </h1>
                <div 
                    className="w-[50px] h-[50px] rounded-full border border-gray-100 overflow-hidden shrink-0 cursor-pointer transition-transform active:scale-95"
                    onClick={() => navigate('/account-settings')}
                >
                    <img src={avatarImg} alt="Avatar" className="w-full h-full object-cover" />
                </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 w-full overflow-y-auto no-scrollbar flex flex-col items-center pb-[120px]">
                {hasActiveOrder ? (
                    /* Active Order View */
                    <div className="w-[362px] rounded-[12px] border border-[#EDEDED] bg-white z-10 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.04)] mt-[10px] shrink-0 relative flex flex-col items-center">
                        {/* Status Header */}
                        <div className="flex items-center justify-between mt-[15px] px-[17px] w-full">
                            <span className="font-satoshi font-bold text-[16px] text-black">Active Order</span>
                            <div 
                                className={`w-[128px] h-[28px] rounded-full flex items-center justify-center ${orderStatus === 'picked_up' ? 'bg-[#34C759]' : 'bg-[#FFCC00]'}`}
                            >
                                <span className="font-satoshi font-medium text-[14px] text-black">
                                    {orderStatus === 'picked_up' ? 'Picked Up' : 'Pickup Pending'}
                                </span>
                            </div>
                        </div>

                        {/* Order Container */}
                        <div className="w-[333px] h-auto border border-[#E6E8EB] rounded-[14px] mt-[10px] mx-auto flex flex-col px-4 pt-4 pb-[14px] shrink-0">
                            <h3 className="font-satoshi font-bold text-[12px] text-black/50">
                                {orderStatus === 'picked_up' ? 'DELIVER TO' : 'PICKUP FROM'}
                            </h3>
                            <p className="mt-2 text-black font-satoshi font-medium text-[14px] leading-tight">
                                {orderStatus === 'picked_up' 
                                    ? "No. 83, 7th Cross, 4th Block, Koramangala, Bangalore - 560034"
                                    : "Kormangala Hub, E 61 St & S Rhodes Ave, Bangalore - 560063"
                                }
                            </p>
                            
                            <button 
                                onClick={handleOpenInMaps}
                                className="mt-4 w-full h-[42px] bg-black rounded-full flex items-center justify-center transition-transform active:scale-95"
                            >
                                <span className="text-white font-satoshi font-bold text-[14px]">Open in Maps</span>
                            </button>

                            <p className="mt-4 text-center font-satoshi font-medium text-[12px] text-black">
                                {orderStatus === 'picked_up' ? 'Arriving in 15 minutes' : 'Arriving in 2 minutes'}
                            </p>
                        </div>

                        {/* Order Details Section */}
                        <div className="w-full px-[17px] mt-[24px] flex flex-col">
                            <span className="text-black/50 text-[12px] font-bold font-satoshi tracking-wider">ORDER DETAILS</span>
                            
                            <div className="mt-4 flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-black/60 text-[14px] font-medium font-satoshi">Cash to Collect:</span>
                                    <span className="text-black text-[14px] font-bold font-satoshi">₹5,000</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-black/60 text-[14px] font-medium font-satoshi">Your Earning:</span>
                                    <span className="text-black text-[14px] font-bold font-satoshi">₹120</span>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="mt-6 w-full h-[1px] bg-[#E6E8EB]" />
                        </div>

                        {/* Customer Details Section */}
                        <div className="w-full px-[17px] mt-6 flex flex-col">
                            <span className="text-black/50 text-[12px] font-bold font-satoshi tracking-wider">CUSTOMER DETAILS</span>
                            
                            <div className="mt-4 flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-black/60 text-[14px] font-medium font-satoshi">Customer Name:</span>
                                    <span className="text-black text-[14px] font-bold font-satoshi">Sangeeta Deb</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-black/60 text-[14px] font-medium font-satoshi">Customer Contact Number:</span>
                                    <span className="text-black text-[14px] font-bold font-satoshi">+91 9876543210</span>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="mt-6 w-full h-[1px] bg-[#E6E8EB]" />
                        </div>

                        {/* CTAs */}
                        <div className="mt-8 px-[17px] w-full flex flex-col gap-2 mb-[25px]">
                            {orderStatus === 'picked_up' ? (
                                <>
                                    <button 
                                        className={`w-full h-[48px] rounded-full text-white font-satoshi font-medium text-[16px] transition-all
                                            ${isAtCustomer ? 'bg-[#5260FE] active:scale-95' : 'bg-[#5260FE]/50 cursor-not-allowed'}`}
                                        disabled={!isAtCustomer}
                                        onClick={() => {
                                            if (isAtCustomer) {
                                                setVerificationType('delivery');
                                                setIsVerified(false);
                                                setShowPickUpModal(true);
                                            }
                                        }}
                                    >
                                        Confirm Delivery
                                    </button>
                                    <button 
                                        className="w-full h-[48px] rounded-full bg-white border border-[#5260FE] text-[#5260FE] font-satoshi font-medium text-[16px] transition-transform active:scale-95"
                                        onClick={() => window.location.href = 'tel:+919876543210'}
                                    >
                                        Call Customer
                                    </button>
                                </>
                            ) : (
                                <button 
                                    className={`w-full h-[48px] rounded-full text-white font-satoshi font-medium text-[16px] transition-all
                                        ${isAtHub ? 'bg-[#5260FE] active:scale-95 cursor-pointer' : 'bg-[#5260FE]/50 cursor-not-allowed'}`}
                                    onClick={() => setShowPickUpModal(true)}
                                    disabled={!isAtHub}
                                >
                                    Pick Up
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Status Container: Dynamic Content */}
                        <div 
                            className={`w-[362px] ${hasBeenOnline ? "min-h-[198px]" : "min-h-[140px]"} rounded-[12px] border border-[#EDEDED] bg-white p-4 z-10 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.04)] mt-[10px] shrink-0 transition-all duration-300 relative`}
                        >
                            {/* Top Row: Toggle + Earnings (if hasBeenOnline) */}
                            <div className="flex items-center justify-between">
                                {/* Toggle Switch */}
                                <div 
                                    className={`w-[84px] h-[28px] rounded-full flex items-center px-0.5 relative transition-all duration-300 ${
                                        kycStatus === "verified" ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                                    }`}
                                    style={{ backgroundColor: isOnline ? "#0C7E4B" : "rgba(120, 120, 120, 0.2)" }}
                                    onClick={() => {
                                        if (kycStatus === "verified") {
                                            const nextOnline = !isOnline;
                                            setIsOnline(nextOnline);
                                            localStorage.setItem("rider_is_online", nextOnline.toString());
                                            if (nextOnline && !hasBeenOnline) {
                                                setHasBeenOnline(true);
                                                localStorage.setItem("rider_has_been_online", "true");
                                            }
                                        }
                                    }}
                                >
                                    <div 
                                        className="w-[24px] h-[24px] rounded-full bg-white shadow-sm transition-transform duration-300" 
                                        style={{ transform: isOnline ? "translateX(56px)" : "translateX(0)" }}
                                    />
                                    <span 
                                        className="text-[14px] font-medium absolute transition-all duration-300"
                                        style={{ 
                                            color: isOnline ? "white" : "#000000",
                                            left: isOnline ? "12px" : "32px"
                                        }}
                                    >
                                        {isOnline ? "online" : "offline"}
                                    </span>
                                </div>

                                {hasBeenOnline && (
                                    <span className="text-black text-[18px] font-bold mr-[1px]">
                                        Today's earnings: ₹{earnings}
                                    </span>
                                )}
                            </div>

                            {!hasBeenOnline ? (
                                <>
                                    {/* Verification State Text */}
                                    <div className="mt-[13px]">
                                        <h2 className="text-[20px] font-bold text-black leading-[1.4]">
                                            {kycStatus === "verified" ? (
                                                <>Verification is completed! <br /> You can now go online, and start accepting orders.</>
                                            ) : kycStatus === "in_review" ? (
                                                <>Verification is in progress. <br /> You’ll be notified once your KYC is approved.</>
                                            ) : (
                                                <>KYC Verification Required. <br /> Please complete your KYC to start earning.</>
                                            )}
                                        </h2>
                                    </div>

                                    {kycStatus === "pending" && (
                                        <p 
                                            className="text-[14px] font-medium text-black mt-[7px]"
                                            style={{ lineHeight: "22px", letterSpacing: "-0.43px" }}
                                        >
                                            (Usually within 30 minutes)
                                        </p>
                                    )}
                                </>
                            ) : (
                                <div className="flex flex-col items-center">
                                    {/* Active Session Status Message: 82px from top */}
                                    <p className="absolute top-[82px] text-black text-[14px] font-medium opacity-50 text-center w-[300px]">
                                        {isOnline 
                                            ? "You’re online. New orders will appear here shortly."
                                            : "You’re offline, go online now to receive new orders."
                                        }
                                    </p>

                                    {/* Refresh CTA: 40px below message */}
                                    <button 
                                        disabled={!isOnline}
                                        onClick={() => {
                                            if (isOnline) {
                                                setShowOrderModal(true);
                                            }
                                        }}
                                        className={`mt-[96px] w-[193px] h-[42px] rounded-full flex items-center justify-center transition-all duration-300 ${
                                            isOnline ? "bg-black cursor-pointer active:scale-95" : "bg-[#BDBDBD] cursor-not-allowed"
                                        }`}
                                    >
                                        <span className="text-white text-[14px] font-medium mr-[6px]">Refresh</span>
                                        <img src={refreshIcon} alt="Refresh" className="w-[11px] h-[11px]" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Referral Banner: 20px below container */}
                        <div className="w-[362px] h-[104px] rounded-[16px] bg-black mt-5 shrink-0 overflow-hidden flex relative">
                            {/* Left Content */}
                            <div className="flex-1 pt-3.5 pl-3.5 flex flex-col">
                                <img src={giftIcon} alt="Gift" className="w-6 h-6 mb-1" />
                                <h3 className="text-white text-[16px] font-bold leading-tight mb-1">
                                    Refer & Earn!
                                </h3>
                                <p className="text-white text-[12px] font-normal leading-tight">
                                    Earn ₹500 on each referral
                                </p>
                            </div>
                            {/* Right Image */}
                            <div className="w-[188px] h-[104px] shrink-0">
                                <img src={referralImg} alt="Referral" className="w-full h-full object-cover" />
                            </div>
                        </div>

                        {/* Shifts Header: 32px below banner */}
                        <div className="w-[362px] mt-8 mb-3 shrink-0 px-1">
                            <h3 className="text-[15px] font-medium text-black">
                                My Shifts
                            </h3>
                        </div>

                        {/* Shifts Container: 12px below header */}
                        {hasBeenOnline ? (
                            <div className="w-[362px] rounded-[14px] border border-[#EDEDED] flex flex-col pt-[14px] pl-[14px] pr-[14px] pb-[16px] shrink-0 mb-8 z-10 bg-white">
                                <h4 className="text-[14px] font-bold text-black leading-none">
                                    Current Shift
                                </h4>
                                <p className="mt-[11px] text-[14px] font-medium text-black leading-none" style={{ letterSpacing: "-0.43px" }}>
                                    9:00 PM - 11:00 PM (Kormangala Hub)
                                </p>
                                
                                <div className="mt-[13px] w-full h-[1px] bg-[#E9E9E9]" />
                                
                                <p className="mt-[9px] text-[14px] font-medium italic text-black/50 leading-none" style={{ letterSpacing: "-0.43px" }}>
                                    Complete 3 consecutive days in this slot to unlock ₹200 streak bonus.
                                </p>
                                
                                <button 
                                    className="mt-[11px] text-[14px] font-medium text-[#5260FE] underline leading-none text-left" 
                                    style={{ letterSpacing: "-0.43px" }}
                                    onClick={() => navigate('/shifts')}
                                >
                                    View Shift Details
                                </button>
                                
                                <p className="mt-[18px] text-[12px] font-medium italic text-black/50 leading-[1.4]" style={{ letterSpacing: "-0.43px" }}>
                                    Grid.pe learns your shift patterns based on when you start working and when you go offline.
                                </p>
                            </div>
                        ) : (
                            <div className="w-[362px] h-[113px] rounded-[14px] border border-[#EDEDED] flex items-center justify-center p-6 shrink-0 mb-8 transition-all duration-300 bg-white">
                                <p className="text-black text-[14px] font-medium text-center opacity-50 px-2">
                                    {kycStatus === "verified"
                                        ? "Shifts will be visible once you start accepting orders."
                                        : "Your shifts will appear here once your account is verified and active."
                                    }
                                </p>
                            </div>
                        )}

                        {/* New Rider Bonus Banner: Only visible if verified and NEVER gone online */}
                        {kycStatus === "verified" && !hasBeenOnline && (
                            <div className="w-[362px] h-[110px] rounded-[16px] bg-black shrink-0 relative flex flex-col items-center mb-8">
                                {/* Badge: Half in, half out */}
                                <div className="absolute top-[-16px] left-1/2 -translate-x-1/2 w-[160px] h-[32px] rounded-full bg-[#5260FE] flex items-center justify-center z-10 shadow-sm">
                                    <span className="text-white text-[12px] font-bold">First Login Offer!</span>
                                </div>

                                {/* Banner Content */}
                                <h3 className="text-white text-[16px] font-bold mt-[31px] mb-1">
                                    New Rider!
                                </h3>
                                <p className="text-white text-[12px] font-normal text-center w-[266px] leading-[1.4]">
                                    Complete 5 deliveries today and earn a ₹1500 bonus in your wallet.
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Bottom Navigation Container: Glassmorphism effect */}
            <div 
                className="fixed bottom-0 w-full h-[105px] z-20 flex flex-col items-center"
                style={{
                    backgroundColor: "rgba(255, 255, 255, 0.7)",
                    backdropFilter: "blur(15px)",
                    WebkitBackdropFilter: "blur(15px)"
                }}
            >
                {/* Inner Nav Bar: 12px from the top */}
                <div className="mt-[12px] w-[279px] h-[62px] rounded-full bg-[#F2F2F2] flex items-center px-[4px] relative">
                    {/* Active Tab Background Pill: 96x54px */}
                    <div 
                        className="absolute h-[54px] w-[96px] rounded-full transition-all duration-300 ease-[cubic-bezier(0.25, 0.1, 0.25, 1)] z-0"
                        style={{ 
                            backgroundColor: "rgba(146, 146, 146, 0.26)",
                            left: activeTab === "home" ? "4px" : activeTab === "earnings" ? "91.5px" : "179px"
                        }}
                    />

                    {navItems.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                            <div 
                                key={item.id}
                                onClick={() => {
                                    if (item.id === "earnings") {
                                        navigate("/earnings");
                                    } else if (item.id === "notifications") {
                                        const hasSeenPrompt = localStorage.getItem("has_seen_notification_prompt") === "true";
                                        if (!hasSeenPrompt) {
                                            setShowNotificationSheet(true);
                                        } else {
                                            navigate("/notifications");
                                        }
                                    } else {
                                        setActiveTab(item.id);
                                    }
                                }}
                                className="relative flex flex-col items-center justify-center h-full cursor-pointer z-10 transition-colors duration-300"
                                style={{ 
                                    width: "93px" // 279 / 3 = 93px slots for distribution
                                }}
                            >
                                <img 
                                    src={item.icon} 
                                    alt={item.label} 
                                    className="w-6 h-6 transition-all duration-300"
                                    style={{ 
                                        filter: isActive ? "brightness(0)" : "none",
                                        opacity: isActive ? 1 : 1,
                                        color: isActive ? "#000000" : "#676767"
                                    }}
                                />
                                <span 
                                    className={`text-[10px] mt-[4px] transition-all duration-300 ${
                                        isActive ? "font-bold text-black" : "font-medium text-[#676767]"
                                    }`}
                                >
                                    {item.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Order Request Modal */}
            {showOrderModal && (
                <OrderModal 
                    onAccept={() => {
                        setHasActiveOrder(true);
                        setShowOrderModal(false);
                    }}
                    onReject={() => {
                        // For now should do nothing
                        setShowOrderModal(false);
                    }}
                    onClose={() => setShowOrderModal(false)}
                />
            )}
            {/* Pick Up/Delivery Verification Modal */}
            {showPickUpModal && (
                <PickUpVerificationModal 
                    isVerified={isVerified}
                    riderName={riderName}
                    verifiedCTA={verificationType === 'delivery' ? 'Enter Verification Code' : 'Pick Up'}
                    onStart={() => {
                        if (isVerified) {
                            setShowPickUpModal(false);
                            if (verificationType === 'pickup') {
                                setOrderStatus('picked_up');
                                console.log("Order Status changed to Picked Up!");
                            } else {
                                setShowPickUpModal(false);
                                setShowOTPModal(true);
                                console.log("Delivery Verification: Face matched, opening OTP modal");
                            }
                        } else {
                            setShowPickUpModal(false);
                            setShowFaceVerification(true);
                        }
                    }}
                    onClose={() => setShowPickUpModal(false)}
                />
            )}

            {showOTPModal && (
                <DeliveryOTPModal 
                    onClose={() => setShowOTPModal(false)}
                    onVerify={() => {
                        setShowOTPModal(false);
                        navigate("/order-delivered");
                        console.log("Navigating to Order Delivered Page...");
                    }}
                />
            )}

            {/* Face Verification Screen */}
            {showFaceVerification && (
                <FaceVerification 
                    onCapture={(image) => {
                        console.log("Captured face:", image);
                        setIsVerified(true);
                        setShowFaceVerification(false);
                        setShowPickUpModal(true);
                    }}
                    onClose={() => setShowFaceVerification(false)}
                />
            )}

            {/* Notification Bottom Sheet */}
            {showNotificationSheet && (
                <NotificationBottomSheet 
                    onClose={() => setShowNotificationSheet(false)}
                    onEnable={() => {
                        localStorage.setItem("has_seen_notification_prompt", "true");
                        localStorage.setItem("push_notifications_enabled", "true");
                        setShowNotificationSheet(false);
                        navigate("/notifications");
                        console.log("Push notifications enabled!");
                    }}
                    onDecline={() => {
                        localStorage.setItem("has_seen_notification_prompt", "true");
                        localStorage.setItem("push_notifications_enabled", "false");
                        setShowNotificationSheet(false);
                        navigate("/notifications");
                        console.log("Push notifications declined.");
                    }}
                />
            )}
        </div>
    );
};

export default Home;
