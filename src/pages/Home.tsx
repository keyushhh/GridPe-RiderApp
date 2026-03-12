import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import avatarImg from "../assets/avatar.png";
import giftIcon from "../assets/gift.svg";
import referralImg from "../assets/referral image.png";
import homeIcon from "../assets/home.svg";
import earningsIcon from "../assets/earnings.svg";
import notificationsIcon from "../assets/notifications.svg";
import refreshIcon from "../assets/Refresh.svg";
const Home = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("home");
    const [isOnline, setIsOnline] = useState(false);
    const [kycStatus, setKycStatus] = useState<"pending" | "verified">(
        (localStorage.getItem("rider_kyc_status") as "pending" | "verified") || "pending"
    );
    const [hasBeenOnline, setHasBeenOnline] = useState(
        localStorage.getItem("rider_has_been_online") === "true"
    );
    const [earnings, setEarnings] = useState(0);

    // Simulation: Auto-verify after 2 minutes
    useEffect(() => {
        if (kycStatus === "pending") {
            const timer = setTimeout(() => {
                setKycStatus("verified");
                localStorage.setItem("rider_kyc_status", "verified");
            }, 120000); // 2 minutes

            return () => clearTimeout(timer);
        }
    }, [kycStatus]);

    // In a real app, 'Rohit' would come from an auth/profile context
    const riderName = "Rohit";

    const navItems = [
        { id: "home", label: "Home", icon: homeIcon },
        { id: "earnings", label: "Earnings", icon: earningsIcon },
        { id: "notifications", label: "Notifications", icon: notificationsIcon },
    ];

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
            <div className="flex-none flex items-center justify-between w-[362px] px-0 pt-12 pb-2 relative z-10">
                <h1 className="text-black text-[24px] font-bold leading-none">
                    Welcome, {riderName}!
                </h1>
                <div className="w-[50px] h-[50px] rounded-full border border-gray-100 overflow-hidden shrink-0">
                    <img src={avatarImg} alt="Avatar" className="w-full h-full object-cover" />
                </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 w-full overflow-y-auto flex flex-col items-center pb-[120px]">
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
                                    ) : (
                                        <>Verification is in progress. <br /> You’ll be notified once your KYC is approved.</>
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
                <div className="w-[362px] h-[113px] rounded-[14px] border border-[#EDEDED] flex items-center justify-center p-6 shrink-0 mb-8 transition-all duration-300">
                    <p className="text-black text-[14px] font-medium text-center opacity-50 px-2">
                        {hasBeenOnline 
                            ? "Shift details will update automatically as you complete deliveries."
                            : kycStatus === "verified"
                                ? "Shifts will be visible once you start accepting orders."
                                : "Your shifts will appear here once your account is verified and active."
                        }
                    </p>
                </div>

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
            </div>

            {/* Bottom Navigation: 279x62px pill shaped */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[279px] h-[62px] rounded-full bg-[#F2F2F2] flex items-center z-20 px-[4px]">
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
                            onClick={() => setActiveTab(item.id)}
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
    );
};

export default Home;
