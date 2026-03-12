import { useNavigate } from "react-router-dom";
import avatarImg from "../assets/avatar.png";

const Home = () => {
    const navigate = useNavigate();

    // In a real app, 'Rohit' would come from an auth/profile context
    const riderName = "Rohit";

    return (
        <div className="relative h-[100dvh] w-full bg-white font-satoshi overflow-hidden">
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
            <div className="flex-none flex items-center justify-between px-5 pt-12 pb-2 relative z-10">
                <h1 className="text-black text-[24px] font-bold leading-none">
                    Welcome, {riderName}!
                </h1>
                <div className="w-[50px] h-[50px] rounded-full border border-gray-100 overflow-hidden shrink-0">
                    <img src={avatarImg} alt="Avatar" className="w-full h-full object-cover" />
                </div>
            </div>

            {/* Status Container: Exact 148px from top margin */}
            <div className="absolute top-[148px] left-1/2 -translate-x-1/2 w-[362px] h-[186px] rounded-[12px] border border-[#EDEDED] bg-white p-4 z-10 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.04)]">
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
        </div>
    );
};

export default Home;
