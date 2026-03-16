import { useNavigate } from "react-router-dom";
import trendUpIcon from "../assets/trend-up.svg";

const Shifts = () => {
    const navigate = useNavigate();

    return (
        <div className="relative h-[100dvh] w-full bg-white font-satoshi overflow-y-auto flex flex-col items-center pb-10">
            {/* Purple Glowing Orb */}
            <div
                className="absolute top-[-20px] left-1/2 -translate-x-1/2 w-[166px] h-[40px] rounded-full pointer-events-none z-0"
                style={{
                    backgroundColor: "#5260FE",
                    filter: "blur(60px)",
                    opacity: 0.8,
                }}
            />

            {/* Header */}
            <div className="flex-none w-[362px] pt-12 flex items-center justify-center relative z-10">
                {/* Back Button */}
                <button
                    onClick={() => navigate("/dashboard")}
                    className="absolute left-0 w-[37px] h-[37px] rounded-full border border-[#EDEDED] bg-white flex items-center justify-center shrink-0 active:scale-95 transition-transform z-20"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 18L9 12L15 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                {/* Heading */}
                <h1 className="text-black text-[22px] font-medium leading-none">
                    Shifts
                </h1>
            </div>

            {/* Shift Container */}
            <div className="mt-7.25 w-[362px] rounded-[14px] border border-[#EDEDED] bg-white z-10 flex flex-col shrink-0 mt-[29px]">
                {/* Header Content */}
                <div className="pt-[10px] pl-[13px] pr-[13px]">
                    <h3 className="text-[14px] font-bold text-black leading-none">
                        Your Preffered Shift
                    </h3>
                    <p className="mt-[7px] text-[14px] font-medium text-black leading-none">
                        9:00 PM - 11:00 PM (Kormangala Hub)
                    </p>
                </div>

                {/* Loader Section */}
                <div className="mt-[20px] px-[13px]">
                    <div className="w-[332px] h-[17px] bg-[#E0E3FF] rounded-full overflow-hidden relative">
                        <div
                            className="h-full bg-[#5260FE] flex items-center justify-center"
                            style={{ width: "66%" }}
                        >
                            <span className="text-white text-[10px] font-medium">66%</span>
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="mt-[14px] px-[13px]">
                    <p className="text-[14px] font-bold text-black leading-none">
                        Consistency: 2/3 days completed
                    </p>
                    <p className="mt-[2px] leading-none">
                        <span className="text-[14px] font-bold text-black">Streak Bonus: </span>
                        <span className="text-[14px] font-medium text-black">₹120</span>
                    </p>
                </div>

                {/* Footer Section */}
                <div className="mt-[6px] px-[13px] pb-[10px]">
                    <p className="text-[12px] font-medium italic text-black/50 leading-[1.4]">
                        Grid.pe learns your shift patterns based on when you start working and when you go offline.
                    </p>
                </div>
            </div>

            {/* Shift Insights Heading */}
            <div className="w-[362px] mt-8 mb-3 shrink-0">
                <h3 className="text-[15px] font-medium text-black">
                    Shift Insights
                </h3>
            </div>

            {/* Insights Container */}
            <div className="w-[362px] rounded-[14px] border border-[#EDEDED] bg-white flex flex-col shrink-0 p-[10px_13px_10px_13px]">
                {/* Top Row: Metrics and Trend */}
                <div className="flex items-start">
                    {/* Daily Average Info */}
                    <div className="flex flex-col">
                        <span className="text-[12px] font-normal text-black leading-none">
                            Daily average
                        </span>
                        <span className="mt-[1px] text-[22px] font-medium text-black leading-none">
                            6 Hours
                        </span>
                    </div>

                    {/* 16px Gap */}
                    <div className="w-[16px]" />

                    {/* Trend Indicator */}
                    <div className="flex flex-col pt-[2px]">
                        <div className="flex items-center gap-1">
                            <img
                                src={trendUpIcon}
                                alt="Trend Up"
                                className="w-4 h-4"
                            />
                            <span className="text-[12px] font-medium text-[#37AD3A] leading-none">
                                25%
                            </span>
                        </div>
                        <p className="mt-[3px] text-[12px] font-medium text-[#9F9FAB] leading-tight">
                            above network average
                        </p>
                    </div>
                </div>

                {/* Weekly Hours Chart Section (Final Polished Grid) */}
                <div className="mt-[12px] w-[314px] flex flex-col">
                    <div className="relative h-[140px] w-full mt-2 mb-10">
                        {/* Vertical Grid Lines (Separators) - 7 lines, framing the START of each day column */}
                        {/* NO line after Sunday. Height 164px ends 4px below labels. */}
                        <div className="absolute inset-0 pointer-events-none h-[164px]">
                            {Array.from({ length: 7 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute h-full border-l-[0.8px] border-dashed border-[#EDEDED]"
                                    style={{ left: `${(i * 100) / 7}%` }}
                                />
                            ))}
                        </div>

                        {/* Y-Axis Labels & Grid Lines - 8 lines, 20px spacing */}
                        <div className="absolute inset-0 flex flex-col pointer-events-none">
                            {[
                                { val: 9, pos: 0, label: null },   // 20px above 8h
                                { val: 8, pos: 20, label: "8h" },
                                { val: 7.33, pos: 40, label: null },
                                { val: 6.66, pos: 60, label: null },
                                { val: 6, pos: 80, label: "6h" },
                                { val: 4, pos: 100, label: null },
                                { val: 2, pos: 120, label: null },
                                { val: 0, pos: 140, label: "0" }
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className="absolute left-0 right-0 border-b-[0.8px] border-[#EDEDED]"
                                    style={{ top: `${item.pos}px` }}
                                >
                                    {item.label && (
                                        <span
                                            className="absolute right-[-24px] text-[12px] font-normal text-black/50 top-0 -translate-y-1/2"
                                        >
                                            {item.label}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Avg Line (Green Dashed) - Distinct from 6h grid level (moved to ~6.5h = 70px from top) */}
                        <div
                            className="absolute left-0 right-0 border-t border-dashed border-[#27C840] z-20"
                            style={{ top: "70px" }}
                        >
                            <span
                                className="absolute right-[-28px] text-[12px] font-normal text-[#27C840] top-0 -translate-y-1/2"
                            >
                                avg
                            </span>
                        </div>

                        {/* Bars & X-Axis */}
                        <div className="absolute inset-0 flex items-end justify-between px-0" style={{ height: "140px" }}>
                            {[
                                { day: "Mon", h: 7 },
                                { day: "Tue", h: 3 },
                                { day: "Wed", h: 6 },
                                { day: "Thu", h: 5 },
                                { day: "Fri", h: 7 },
                                { day: "Sat", h: 8.5 },
                                { day: "Sun", h: 0 }
                            ].map((item, idx) => {
                                // Calculate bar height based on non-linear scale:
                                // 0-6h: 60px (item.h * 10)
                                // 6-8h: 60px ((item.h - 6) * 30)
                                let barH = 0;
                                if (item.h <= 6) {
                                    barH = item.h * 10;
                                } else {
                                    barH = 60 + Math.min(item.h - 6, 2.66) * 30;
                                }

                                return (
                                    <div key={idx} className="flex-1 flex flex-col items-center relative h-full justify-end">
                                        {/* Bar */}
                                        <div
                                            className="w-[20px] bg-[#5260FE] rounded-t-[4px] transition-all duration-500 z-10"
                                            style={{ height: `${barH}px` }}
                                        />

                                        {/* X-Axis Label */}
                                        <span className="absolute bottom-[-20px] text-[12px] font-normal text-black/50">
                                            {item.day}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Chart Divider - Below chart */}
                <div className="mt-[-4px] w-[362px] -ml-[13px] h-[1px] bg-black/15" />

                {/* Insights Metrics Rows */}
                <div className="mt-[12px] flex flex-col gap-[6px]">
                    {[
                        { label: "Total Active Hours:", value: "12h 45m" },
                        { label: "Shifts Completed:", value: "6" },
                        { label: "Total Earnings:", value: "₹780" },
                        { label: "Bonuses Earned:", value: "₹200" }
                    ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center">
                            <span className={`text-[14px] text-black ${i === 0 ? "font-bold" : "font-medium"}`}>
                                {item.label}
                            </span>
                            <span className={`text-[14px] text-black ${i === 0 ? "font-bold" : "font-medium"}`}>
                                {item.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Secondary Insights Container */}
            <div className="mt-[12px] w-[362px] rounded-[14px] border border-[#EDEDED] bg-white flex flex-col shrink-0 p-[12px_14px_12px_14px]">
                {/* Most Active Hubs */}
                <div className="flex flex-col gap-[6px]">
                    <h3 className="text-[14px] font-bold text-black">Most Active Hubs</h3>
                    {[
                        { name: "Kormangala Hub", shifts: "8 Shifts", earnings: "₹960" },
                        { name: "Indiranagar Hub", shifts: "3 Shifts", earnings: "₹280" }
                    ].map((hub, i) => (
                        <div key={i} className="flex justify-between items-center text-[14px] font-medium text-black">
                            <span className="flex-1">{hub.name}</span>
                            <span className="w-[80px] text-right">{hub.shifts}</span>
                            <span className="w-[60px] text-right">{hub.earnings}</span>
                        </div>
                    ))}
                </div>

                {/* Section Spacing */}
                <div className="h-[16px]" />

                {/* Peak Hours */}
                <div className="flex flex-col gap-[6px]">
                    <h3 className="text-[14px] font-bold text-black">Peak Hours</h3>
                    {[
                        { time: "9 PM - 11 PM", shifts: "6 Shifts", earnings: "₹720" },
                        { time: "6 PM - 9 PM", shifts: "2 Shifts", earnings: "₹150" }
                    ].map((peak, i) => (
                        <div key={i} className="flex justify-between items-center text-[14px] font-medium text-black">
                            <span className="flex-1">{peak.time}</span>
                            <span className="w-[80px] text-right">{peak.shifts}</span>
                            <span className="w-[60px] text-right">{peak.earnings}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Final Info Box - 12px below container */}
            <div className="mt-[12px] w-[362px] bg-black rounded-[14px] p-[14px_10px] flex flex-col gap-[6px]">
                <p className="text-[14px] font-medium text-white leading-tight tracking-[-0.43px]">
                    💡You earned 25% more during evening shifts this week.
                </p>
                <p className="text-[14px] font-medium text-white leading-tight tracking-[-0.43px]">
                    Keep your 9-11 PM streak to unlock the ₹500 bonus.
                </p>
            </div>

            {/* Dynamic CTA Button - 17px below info box */}
            <button
                onClick={() => navigate("/")}
                className="mt-[17px] mb-10 w-[362px] h-[48px] bg-black rounded-full flex items-center justify-center transition-opacity active:opacity-80 shrink-0"
            >
                <span className="text-[16px] font-medium text-white">
                    Go Online Now
                </span>
            </button>
        </div>
    );
};

export default Shifts;
