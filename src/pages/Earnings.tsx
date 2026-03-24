import { useState } from "react";
import { useNavigate } from "react-router-dom";
import earningsIcon from "../assets/earnings.svg";
import homeIcon from "../assets/home.svg";
import notificationsIcon from "../assets/notifications.svg";
import chevronBackward from "../assets/chevron_backward.svg";
import chevronForward from "../assets/chevron_forward.svg";
import deliveriesIcon from "../assets/deliveries.png";
import alarmIcon from "../assets/alarm.png";
import targetIcon from "../assets/target.png";

const Earnings = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("earnings");
    const [earningType, setEarningType] = useState("daily");
    const [currentWeekIndex, setCurrentWeekIndex] = useState(0);

    const overviewData = [
        {
            range: "09 Mar - 15 Mar",
            totalEarnings: 22750,
            hoursOnDuty: 32,
            deliveries: 46,
            avgHourly: 710,
            bonus: 450
        },
        {
            range: "02 Mar - 08 Mar",
            totalEarnings: 18500,
            hoursOnDuty: 28,
            deliveries: 38,
            avgHourly: 660,
            bonus: 300
        },
        {
            range: "23 Feb - 01 Mar",
            totalEarnings: 25200,
            hoursOnDuty: 35,
            deliveries: 52,
            avgHourly: 720,
            bonus: 500
        }
    ];

    const currentWeek = overviewData[currentWeekIndex];

    const dailyEarnings = [
        { date: "Thursday, 6 Nov", subtext: "7 hours online", amount: 1750 },
        { date: "Wednesday, 5 Nov", subtext: "10 hours online", amount: 2550 },
        { date: "Tuesday, 4 Nov", subtext: "8 hours online", amount: 850 },
        { date: "Monday, 3 Nov", subtext: "6 hours online", amount: 1200 },
        { date: "Sunday, 2 Nov", subtext: "5 hours online", amount: 950 },
    ];

    const weeklyEarnings = [
        { date: "03 Nov - 09 Nov", subtext: "42 hours online", amount: 12450 },
        { date: "27 Oct - 02 Nov", subtext: "38 hours online", amount: 10200 },
        { date: "20 Oct - 26 Oct", subtext: "45 hours online", amount: 13150 },
    ];

    const navItems = [
        { id: "home", label: "Home", icon: homeIcon, path: "/dashboard" },
        { id: "earnings", label: "Earnings", icon: earningsIcon, path: "/earnings" },
        { id: "notifications", label: "Notifications", icon: notificationsIcon, path: "/notifications" },
    ];

    return (
        <div className="relative w-full h-[100dvh] bg-[#F5F5F5] font-satoshi flex flex-col items-center overflow-hidden">
            {/* Scrollable Content Area */}
            <div className="flex-1 w-full overflow-y-auto no-scrollbar flex flex-col items-center pb-[120px]">
                {/* Purple Glowing Orb */}
                <div
                    className="absolute top-[-20px] left-1/2 -translate-x-1/2 w-[166px] h-[40px] rounded-full pointer-events-none z-0"
                    style={{
                        backgroundColor: "#5260FE",
                        filter: "blur(60px)",
                        opacity: 0.8,
                    }}
                />

                {/* Header Container */}
                <div className="flex-none flex items-center justify-center w-[362px] px-0 pt-12 pb-2 relative z-10">
                    <h1 className="text-black text-[22px] font-medium leading-none">
                        Earnings
                    </h1>
                </div>

                {/* Overview Container: 38px below heading */}
                <div className="mt-[38px] w-[362px] h-[261px] rounded-[14px] bg-white border border-[#EDEDED] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.04)] relative shrink-0">
                    {/* Header */}
                    <div className="flex justify-between items-start pt-[12px] px-[12px]">
                        <h2 className="text-[16px] font-bold text-black leading-none" style={{ letterSpacing: "-0.43px" }}>
                            Overview
                        </h2>
                        <span className="text-[12px] font-medium text-black/50 leading-none pt-[3px]">
                            Updated just now
                        </span>
                    </div>

                    {/* Dashed Divider: 13px below text */}
                    <div 
                        className="mt-[13px] w-full h-[1px]" 
                        style={{ 
                            backgroundImage: "linear-gradient(to right, rgba(120, 120, 120, 0.2) 50%, rgba(255, 255, 255, 0) 0%)",
                            backgroundPosition: "bottom",
                            backgroundSize: "8px 1px",
                            backgroundRepeat: "repeat-x"
                        }} 
                    />

                    {/* Week Navigation: 13px below divider */}
                    <div className="mt-[13px] px-[13px] flex items-center justify-between w-full">
                        {/* Back Button */}
                        <button 
                            onClick={() => setCurrentWeekIndex(prev => Math.min(prev + 1, overviewData.length - 1))}
                            className="w-[22px] h-[22px] rounded-full bg-[#5260FE]/[0.21] flex items-center justify-center transition-transform active:scale-95 shrink-0"
                        >
                            <img src={chevronBackward} alt="Back" className="w-[20px] h-[20px]" />
                        </button>

                        {/* Week Range */}
                        <span className="text-[14px] font-bold text-[#5260FE] leading-none" style={{ letterSpacing: "-0.43px" }}>
                            {currentWeek.range}
                        </span>

                        {/* Forward Button */}
                        <button 
                            onClick={() => setCurrentWeekIndex(prev => Math.max(prev - 1, 0))}
                            className="w-[22px] h-[22px] rounded-full bg-[#5260FE]/[0.21] flex items-center justify-center transition-transform active:scale-95 shrink-0"
                        >
                            <img src={chevronForward} alt="Forward" className="w-[20px] h-[20px]" />
                        </button>
                    </div>

                    {/* Second Dashed Divider: 13px below navigation */}
                    <div 
                        className="mt-[13px] w-full h-[1px]" 
                        style={{ 
                            backgroundImage: "linear-gradient(to right, rgba(120, 120, 120, 0.2) 50%, rgba(255, 255, 255, 0) 0%)",
                            backgroundPosition: "bottom",
                            backgroundSize: "8px 1px",
                            backgroundRepeat: "repeat-x"
                        }} 
                    />

                    {/* Vertical Divider & Column Headers */}
                    <div className="relative w-full h-[121px]">
                        {/* Vertical Divider: Centered */}
                        <div 
                            className="absolute left-1/2 -translate-x-1/2 w-[1px] h-[121px]" 
                            style={{ 
                                backgroundImage: "linear-gradient(rgba(120, 120, 120, 0.2) 50%, rgba(255, 255, 255, 0) 0%)",
                                backgroundPosition: "right",
                                backgroundSize: "1px 8px",
                                backgroundRepeat: "repeat-y"
                            }} 
                        />

                        {/* Left Column Header: 12px below horizontal divider, 14px from left */}
                        <div className="absolute top-[12px] left-[14px] flex flex-col">
                            <span 
                                className="text-[12px] font-bold text-black/50 uppercase"
                                style={{ letterSpacing: "2px" }}
                            >
                                TOTAL EARNINGS
                            </span>

                            {/* Earnings Amount: 9px below label */}
                            <span 
                                className="mt-[9px] text-[24px] font-bold text-black leading-none"
                                style={{ letterSpacing: "-0.43px" }}
                            >
                                ₹{currentWeek.totalEarnings.toLocaleString()}
                            </span>

                            {/* Hours on Duty: 3px below amount */}
                            <span 
                                className="mt-[3px] text-[14px] font-medium text-black/50"
                                style={{ letterSpacing: "-0.43px" }}
                            >
                                {currentWeek.hoursOnDuty} hours on duty
                            </span>
                        </div>

                        {/* Right Column Header: 12px below horizontal divider, 14px from right of vertical divider */}
                        <div className="absolute top-[12px] left-[calc(50%+14px)] right-[14px] flex flex-col">
                            <span 
                                className="text-[12px] font-bold text-black/50 uppercase"
                                style={{ letterSpacing: "2px" }}
                            >
                                QUICK STATS
                            </span>

                            {/* Stats Rows: 13px below label, 6px spacing */}
                            <div className="mt-[13px] flex flex-col gap-[6px]">
                                {/* Deliveries */}
                                <div className="flex justify-between items-center h-[18px]">
                                    <div className="flex items-center gap-[6px]">
                                        <div className="w-[18px] h-[18px] flex items-center justify-center overflow-hidden">
                                            <img src={deliveriesIcon} alt="" className="w-full h-full object-contain" />
                                        </div>
                                        <span className="text-[12px] font-medium text-black leading-none" style={{ letterSpacing: "-0.43px" }}>Deliveries</span>
                                    </div>
                                    <span className="text-[14px] font-bold text-black leading-none" style={{ letterSpacing: "-0.43px" }}>{currentWeek.deliveries}</span>
                                </div>

                                {/* Avg/hours */}
                                <div className="flex justify-between items-center h-[18px]">
                                    <div className="flex items-center gap-[6px]">
                                        <div className="w-[18px] h-[18px] flex items-center justify-center overflow-hidden">
                                            <img src={alarmIcon} alt="" className="w-full h-full object-contain" />
                                        </div>
                                        <span className="text-[12px] font-medium text-black leading-none" style={{ letterSpacing: "-0.43px" }}>Avg/hours</span>
                                    </div>
                                    <span className="text-[14px] font-bold text-black leading-none" style={{ letterSpacing: "-0.43px" }}>₹{currentWeek.avgHourly}/hr</span>
                                </div>

                                {/* Bonus earned */}
                                <div className="flex justify-between items-center h-[18px]">
                                    <div className="flex items-center gap-[6px]">
                                        <div className="w-[18px] h-[18px] flex items-center justify-center overflow-hidden">
                                            <img src={targetIcon} alt="" className="w-full h-full object-contain" />
                                        </div>
                                        <span className="text-[12px] font-medium text-black leading-none" style={{ letterSpacing: "-0.43px" }}>Bonus earned</span>
                                    </div>
                                    <span className="text-[14px] font-bold text-black leading-none" style={{ letterSpacing: "-0.43px" }}>₹{currentWeek.bonus}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Third Dashed Divider: At the end of vertical divider */}
                    <div 
                        className="w-full h-[1px]" 
                        style={{ 
                            backgroundImage: "linear-gradient(to right, rgba(120, 120, 120, 0.2) 50%, rgba(255, 255, 255, 0) 0%)",
                            backgroundPosition: "bottom",
                            backgroundSize: "8px 1px",
                            backgroundRepeat: "repeat-x"
                        }} 
                    />

                    {/* See Details: 11px below divider, center aligned */}
                    <div className="mt-[11px] flex justify-center w-full">
                        <button 
                            onClick={() => navigate("/earnings-detail", { 
                                state: { 
                                    title: "Week earnings",
                                    dateDisplay: currentWeek.range,
                                    amount: currentWeek.totalEarnings,
                                    hoursDisplay: `${currentWeek.hoursOnDuty} hours on duty`,
                                    breakdown: {
                                        orderEarnings: 18000,
                                        tips: 4750
                                    },
                                    deliveries: currentWeek.deliveries
                                } 
                            })}
                            className="text-[14px] font-medium text-[#5260FE] transition-transform active:scale-95"
                            style={{ letterSpacing: "-0.43px" }}
                        >
                            See details
                        </button>
                    </div>
                </div>

                {/* Wallet Container: 16px below Overview */}
                <div className="mt-[16px] w-[362px] rounded-[14px] bg-white border border-[#EDEDED] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.04)] px-[12px] pt-[12px] pb-[18px] shrink-0 relative">
                    <div className="flex justify-between items-start">
                        <h2 className="text-[16px] font-bold text-black leading-none" style={{ letterSpacing: "-0.43px" }}>
                            Wallet
                        </h2>
                        <span 
                            className="absolute top-[14px] right-[14px] text-[16px] font-bold text-black leading-none" 
                            style={{ letterSpacing: "-0.43px" }}
                        >
                            ₹{currentWeek.totalEarnings.toLocaleString()}
                        </span>
                    </div>
                    
                    {/* Body Text */}
                    <p className="mt-[13px] text-[14px] font-medium text-black/50 leading-tight" style={{ letterSpacing: "-0.43px" }}>
                        You wallet balance is shown here, you can start your payout procedure from here
                    </p>

                    {/* CTA Button */}
                    <div className="mt-[18px] flex justify-center">
                        <button 
                            onClick={() => navigate("/wallet", { state: { amount: currentWeek.totalEarnings } })}
                            className="w-[335px] h-[44px] rounded-full flex items-center justify-center text-[16px] font-medium transition-transform active:scale-95 bg-[#5260FE] text-white"
                            style={{ 
                                boxShadow: '0px_4px_12px_rgba(82,96,254,0.2)' 
                            }}
                        >
                            View Wallet
                        </button>
                    </div>
                </div>

                {/* Daily/Weekly Switch Tabs: 20px below Auto Payout */}
                <div className="mt-[20px] w-[362px] h-[52px] rounded-full border border-[#EDEDED] flex items-center px-[4px] gap-[10px] shrink-0 bg-white">
                    <button
                        onClick={() => setEarningType("daily")}
                        className={`w-[172px] h-[44px] rounded-full flex items-center justify-center text-[14px] font-medium transition-all duration-200 active:scale-95 ${
                            earningType === "daily" 
                            ? "bg-black text-white shadow-[0px_4px_12px_rgba(0,0,0,0.1)]" 
                            : "bg-[#EBEBEB] text-black"
                        }`}
                        style={{ letterSpacing: "-0.43px" }}
                    >
                        Daily Earnings
                    </button>
                    <button
                        onClick={() => setEarningType("weekly")}
                        className={`w-[172px] h-[44px] rounded-full flex items-center justify-center text-[14px] font-medium transition-all duration-200 active:scale-95 ${
                            earningType === "weekly" 
                            ? "bg-black text-white shadow-[0px_4px_12px_rgba(0,0,0,0.1)]" 
                            : "bg-[#EBEBEB] text-black"
                        }`}
                        style={{ letterSpacing: "-0.43px" }}
                    >
                        Weekly Earnings
                    </button>
                </div>

                {/* Earnings Table: Dynamic based on earningType */}
                <div className="mt-[20px] mb-[20px] w-[362px] bg-white rounded-[14px] border border-[#EDEDED] p-[18px] shrink-0">
                    <div className="flex flex-col">
                        {(earningType === "daily" ? dailyEarnings : weeklyEarnings).map((item: any, index: number) => (
                            <div key={index}>
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col gap-[2px]">
                                        <span className="text-[16px] font-bold text-black" style={{ letterSpacing: "-0.43px" }}>
                                            {item.date}
                                        </span>
                                        <span className="text-[14px] font-medium text-black/50" style={{ letterSpacing: "-0.43px" }}>
                                            {item.subtext}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-[12px]">
                                        <span className="text-[18px] font-bold text-black" style={{ letterSpacing: "-0.43px" }}>
                                            ₹{item.amount.toLocaleString()}
                                        </span>
                                        <button 
                                            onClick={() => navigate("/earnings-detail", { 
                                                state: { 
                                                    title: earningType === "daily" ? item.date : "Week earnings",
                                                    dateDisplay: earningType === "daily" ? item.date : item.date,
                                                    amount: item.amount,
                                                    hoursDisplay: item.subtext.includes("duty") ? item.subtext : `${item.subtext.replace(" online", "")} on duty`,
                                                    breakdown: earningType === "daily" 
                                                        ? {
                                                            orderEarnings: Math.round(item.amount * 0.85),
                                                            tips: item.amount - Math.round(item.amount * 0.85)
                                                          }
                                                        : {
                                                            orderEarnings: Math.round(item.amount * 0.84),
                                                            tips: item.amount - Math.round(item.amount * 0.84)
                                                          },
                                                    deliveries: earningType === "weekly" ? 46 : 5 // Defaulting to some logical numbers for now as mock data doesn't have it
                                                } 
                                            })}
                                            className="w-[32px] h-[32px] rounded-full bg-[#5260FE]/15 flex items-center justify-center transition-transform active:scale-90"
                                        >
                                            <img src={chevronForward} alt="Details" className="w-[18px] h-[18px] brightness-50" />
                                        </button>
                                    </div>
                                </div>
                                
                                {index !== (earningType === "daily" ? dailyEarnings : weeklyEarnings).length - 1 && (
                                    <div 
                                        className="w-full h-[1px] my-[15px]" 
                                        style={{ 
                                            backgroundImage: "linear-gradient(to right, rgba(120, 120, 120, 0.2) 50%, rgba(255, 255, 255, 0) 0%)",
                                            backgroundPosition: "bottom",
                                            backgroundSize: "6px 1px",
                                            backgroundRepeat: "repeat-x"
                                        }} 
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
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
                                    setActiveTab(item.id);
                                    if (item.path) navigate(item.path);
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
                                    className={`text-[10px] mt-[4px] transition-all duration-300 ${isActive ? "font-bold text-black" : "font-medium text-[#676767]"
                                        }`}
                                >
                                    {item.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Earnings;
