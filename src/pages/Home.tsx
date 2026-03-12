import { useState } from "react";
import { useNavigate } from "react-router-dom";
import avatarImg from "../assets/avatar.png";
import giftIcon from "../assets/gift.svg";
import referralImg from "../assets/referral image.png";
import homeIcon from "../assets/home.svg";
import earningsIcon from "../assets/earnings.svg";
import notificationsIcon from "../assets/notifications.svg";
const Home = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("home");

    // In a real app, 'Rohit' would come from an auth/profile context
    const riderName = "Rohit";

    const navItems = [
        { id: "home", label: "Home", icon: homeIcon },
        { id: "earnings", label: "Earnings", icon: earningsIcon },
        { id: "notifications", label: "Notifications", icon: notificationsIcon },
    ];

    return (
        <div className="relative h-[100dvh] w-full bg-white font-satoshi overflow-hidden flex flex-col items-center">
            {/* Standardized Glowing Orb: Yellow */}
            <div
                className="absolute top-[-20px] left-1/2 -translate-x-1/2 w-[166px] h-[40px] rounded-full pointer-events-none z-0"
                style={{
                    backgroundColor: "#FACC15",
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
                {/* Status Container: 148px total from top approx */}
                <div className="w-[362px] h-[186px] rounded-[12px] border border-[#EDEDED] bg-white p-4 z-10 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.04)] mt-[10px] shrink-0">
                    {/* Toggle Switch */}
                    <div className="flex items-center mb-[13px]">
                        <div 
                            className="w-[84px] h-[28px] rounded-full flex items-center px-0.5 relative"
                            style={{ backgroundColor: "rgba(120, 120, 120, 0.2)" }}
                        >
                            <div className="w-[24px] h-[24px] rounded-full bg-white shadow-sm" />
                            <span className="text-[14px] font-medium text-[#737373] ml-2">
                                offline
                            </span>
                        </div>
                    </div>

                    {/* KYC Progress Text */}
                    <div className="mb-[7px]">
                        <h2 className="text-[20px] font-bold text-black leading-[1.4]">
                            Verification is in progress. <br />
                            You’ll be notified once your KYC is approved.
                        </h2>
                    </div>

                    {/* Sub-text */}
                    <p 
                        className="text-[14px] font-medium text-black"
                        style={{ lineHeight: "22px", letterSpacing: "-0.43px" }}
                    >
                        (Usually within 30 minutes)
                    </p>
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
                <div className="w-[362px] h-[113px] rounded-[14px] border border-[#EDEDED] flex items-center justify-center p-6 shrink-0 mb-8">
                    <p className="text-black text-[14px] font-medium text-center opacity-50">
                        Your shifts will appear here once your account is verified and active.
                    </p>
                </div>
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
