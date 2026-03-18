import { useState } from "react";
import { useNavigate } from "react-router-dom";
import avatarImg from "../assets/avatar.png";
import bankIcon from "../assets/bank.svg";
import chevronBackward from "../assets/chevron_backward.svg";
import copyIcon from "../assets/copy.svg";
import kycLockIcon from "../assets/kyc-lock.svg";
import logoutIcon from "../assets/log-out.svg";
import personalInfoIcon from "../assets/personal-info.svg";
import securityIcon from "../assets/security.svg";
import verifiedBadge from "../assets/verified-badge.svg";
import { useAuth } from "../hooks/useAuth";

const AccountSettings = () => {
    const navigate = useNavigate();
    const { phoneNumber, logout, kycStatus, fullName } = useAuth();
    const [activeTab, setActiveTab] = useState("Home");

    console.log('AccountSettings render:', { kycStatus, fullName });

    const menuItems = ["Home", "Personal Info", "Security", "Banking", "Privacy & Data"];

    // Get actual data for the rider
    const riderName = fullName || "";
    const riderMobile = phoneNumber ? `+91 ${phoneNumber}` : "";
    const riderId = "GRIDPE-RDR1023";

    const handleCopyId = () => {
        navigator.clipboard.writeText(riderId);
        // We could add a toast here if needed
    };

    const quickLinks = [
        { label: "Personal Info", icon: personalInfoIcon, tab: "Personal Info" },
        { label: "Security", icon: securityIcon, tab: "Security" },
        { label: "Bank & UPI", icon: bankIcon, tab: "Banking" },
    ];

    return (
        <div className="relative w-[393px] h-screen bg-[#F5F5F5] font-satoshi flex flex-col items-center overflow-hidden">
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
            <div className="flex-none flex items-center w-[362px] px-0 pt-12 pb-2 relative z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="w-[32px] h-[32px] rounded-full bg-white shadow-sm flex items-center justify-center transition-transform active:scale-90"
                >
                    <img src={chevronBackward} alt="Back" className="w-[18px] h-[18px] brightness-0" />
                </button>

                <div className="flex-1 flex justify-center mr-[32px]">
                    <h1 className="text-black text-[22px] font-medium leading-none">
                        Account Settings
                    </h1>
                </div>
            </div>

            {/* Slider Menu: 25px below heading */}
            <div className="mt-6 w-full overflow-x-auto no-scrollbar flex relative z-10 shrink-0">
                <div className="flex min-w-full px-4 relative">
                    {/* Gray Divider Bar */}
                    <div className="absolute bottom-0 left-0 w-full h-[5px] bg-[#DFDFDF] z-0" />

                    {menuItems.map((item) => (
                        <button
                            key={item}
                            onClick={() => setActiveTab(item)}
                            className={`px-4 py-3 text-[14px] font-bold whitespace-nowrap transition-all relative text-black
                                    ${activeTab === item ? 'bg-[#B4BAFF]/[0.21]' : ''}
                                `}
                        >
                            {item}
                            {activeTab === item && (
                                <div className="absolute bottom-0 left-0 w-full h-[5px] bg-[#5260FE] z-10" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="w-[362px] flex flex-col items-center flex-1">
                {activeTab === "Home" && (
                    <>
                        {/* Avatar: 18px below divider */}
                        <div className="mt-[18px] w-[83px] h-[83px] rounded-full border border-gray-100 overflow-hidden shrink-0">
                            <img src={avatarImg} alt="Avatar" className="w-full h-full object-cover" />
                        </div>

                        {/* Name: 12px below avatar */}
                        <h2 className="mt-[12px] text-black font-bold text-[22px] leading-tight text-center">
                            {riderName}
                        </h2>

                        {/* Mobile Info: 3px below name */}
                        <div className="mt-[3px] flex items-center justify-center gap-2">
                            <span className="text-black font-medium text-[14px] leading-none">
                                {riderMobile}
                            </span>
                            <img src={verifiedBadge} alt="Verified" className="w-[16px] h-[16px]" />
                        </div>

                        {/* KYC Text: 18px below mobile info */}
                        <p className="mt-[18px] w-[340px] text-black/50 font-medium italic text-[12px] text-center leading-tight">
                            These details are verified from your KYC and cannot be edited.
                        </p>

                        {/* Rider ID Row: 18px below KYC text */}
                        <div className="mt-[18px] w-full flex items-center justify-between">
                            <span className="text-black font-medium text-[14px]">
                                Rider ID
                            </span>
                            <div className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform" onClick={handleCopyId}>
                                <span className="text-[#5260FE] font-medium text-[14px]">
                                    {riderId}
                                </span>
                                <img src={copyIcon} alt="Copy" className="w-[16px] h-[16px]" />
                            </div>
                        </div>

                        {/* Quick Link Boxes: 27px below rider id */}
                        <div className="mt-[27px] w-full flex gap-[13px] justify-center">
                            {quickLinks.map((link) => (
                                <button
                                    key={link.label}
                                    onClick={() => setActiveTab(link.tab)}
                                    className="w-[112px] h-[107px] rounded-[12px] border border-[#E9EAEB] bg-white flex flex-col items-center justify-center transition-transform active:scale-95"
                                >
                                    <img src={link.icon} alt={link.label} className="w-[24px] h-[24px]" />
                                    <span className="mt-[18px] text-black font-medium text-[14px] leading-none">
                                        {link.label}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Security & KYC Banner: 18px below boxes */}
                        <div
                            className={`mt-[18px] w-[362px] h-[82px] rounded-[13px] border flex items-center relative overflow-hidden shrink-0
                                    ${kycStatus === "verified" ? "border-[#1CB956]" : kycStatus === "in_review" ? "border-[#FFCC00]" : "border-[#FF3B30]"}
                                `}
                            style={{
                                backgroundColor: kycStatus === "verified" ? "rgba(28, 185, 86, 0.21)" : kycStatus === "in_review" ? "rgba(255, 204, 0, 0.21)" : "rgba(255, 59, 48, 0.21)"
                            }}
                        >
                            <div className="flex items-center ml-[19px]">
                                {/* Icon Circle */}
                                <div
                                    className="w-[39px] h-[39px] rounded-full border flex items-center justify-center"
                                    style={{
                                        borderColor: kycStatus === "verified" ? "#1CB956" : kycStatus === "in_review" ? "#FFCC00" : "#FF3B30",
                                        backgroundColor: kycStatus === "verified" ? "rgba(28, 185, 86, 0.22)" : kycStatus === "in_review" ? "rgba(255, 204, 0, 0.22)" : "rgba(255, 59, 48, 0.22)"
                                    }}
                                >
                                    <img src={kycLockIcon} alt="KYC" className="w-[14px] h-[14px]" />
                                </div>

                                {/* Text Content */}
                                <div className="ml-[20px] flex flex-col">
                                    <span className="text-black font-medium text-[14px] leading-tight">Security & KYC</span>
                                    <span
                                        className="mt-[3px] font-medium text-[14px] leading-tight"
                                        style={{ color: kycStatus === "verified" ? "#1CB956" : kycStatus === "in_review" ? "#FFCC00" : "#FF3B30" }}
                                    >
                                        {kycStatus === "verified" ? "Account secured" : kycStatus === "in_review" ? "KYC in progress" : "KYC pending"}
                                    </span>
                                </div>
                            </div>

                            {/* CTA Button */}
                            <button className="absolute top-[21.5px] right-[18px] w-[118px] h-[39px] rounded-full bg-black text-white text-[12px] font-medium flex items-center justify-center transition-transform active:scale-95">
                                Check Security
                            </button>
                        </div>

                        {/* Logout CTA: 42px below banner */}
                        <button
                            onClick={() => {
                                logout();
                                navigate("/login");
                            }}
                            className="mt-[42px] w-[362px] h-[48px] rounded-full bg-black text-white flex items-center justify-center transition-transform active:scale-95 shrink-0"
                        >
                            <span className="text-[16px] font-medium">Logout</span>
                            <img src={logoutIcon} alt="Logout" className="ml-2 w-[20px] h-[20px] brightness-0 invert" />
                        </button>

                        {/* Footer: Bottom Left */}
                        <div className="mt-auto w-full flex flex-col items-start pb-[32px]">
                            <h3 className="text-[40px] font-black text-black/30 leading-none">grid.pe</h3>
                            <p className="mt-3 text-[14px] font-medium text-black/30 leading-tight">
                                App Version v2.1.7 — 100% drama compatible.
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AccountSettings;
