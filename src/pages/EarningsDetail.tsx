import { useLocation, useNavigate } from "react-router-dom";
import chevronBackward from "../assets/chevron_backward.svg";
import downloadIcon from "../assets/download.svg";

const EarningsDetail = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { title, dateDisplay, amount, hoursDisplay, breakdown, deliveries } = location.state || {
        title: "Earnings details",
        dateDisplay: "---",
        amount: 0,
        hoursDisplay: "0 hours on duty",
        breakdown: { orderEarnings: 0, tips: 0 },
        deliveries: 0
    };

    const downloadSummary = () => {
        const headers = ["Date", "Orders Completed", "Order Earnings (₹)", "Tips (₹)", "Total Earnings (₹)"];
        const row = [
            dateDisplay,
            deliveries || 0,
            breakdown?.orderEarnings || 0,
            breakdown?.tips || 0,
            amount
        ];
        
        const csvContent = [headers.join(","), row.join(",")].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `GridPe_Earnings_${dateDisplay.replace(/ /g, '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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
                <div className="flex-none flex items-center w-[362px] px-0 pt-12 pb-2 relative z-10">
                    <button
                        onClick={() => navigate('/earnings')}
                        className="w-[32px] h-[32px] rounded-full bg-white shadow-sm flex items-center justify-center transition-transform active:scale-90"
                    >
                        <img src={chevronBackward} alt="Back" className="w-[18px] h-[18px] brightness-0" />
                    </button>

                    <div className="flex-1 flex justify-center mr-[32px]">
                        <h1 className="text-black text-[22px] font-medium leading-none">
                            {title}
                        </h1>
                    </div>
                </div>

                {/* Data Container: 29px below header */}
                <div className="mt-[29px] w-[362px] h-auto rounded-[14px] bg-white border border-[#EDEDED] pt-[18px] pb-[12px] flex flex-col items-center shrink-0">
                    {/* Date Range */}
                    <span
                        className="text-[15px] font-bold text-[#5260FE] leading-none mb-[2px]"
                        style={{ letterSpacing: "-0.43px" }}
                    >
                        {dateDisplay}
                    </span>

                    {/* Amount: 2px below date */}
                    <span className="text-[24px] font-bold text-black leading-none mb-[2px]">
                        ₹{Number(amount).toLocaleString()}
                    </span>

                    {/* Hours: 2px below amount */}
                    <span
                        className="text-[14px] font-medium text-black/50 leading-none"
                        style={{ letterSpacing: "-0.43px" }}
                    >
                        {hoursDisplay}
                    </span>

                    {/* Horizontal Divider: 16px below hours */}
                    <div
                        className="mt-[16px] w-full border-t border-dashed"
                        style={{ borderColor: "rgba(120, 120, 120, 0.2)" }}
                    />

                    {/* Breakdown Section: 12px below divider, 12px horizontal padding */}
                    <div className="mt-[12px] w-full px-[12px] flex flex-col gap-[8px]">
                        {/* Order Earnings */}
                        <div className="flex justify-between items-center w-full">
                            <span className="text-[14px] font-medium text-black/50" style={{ letterSpacing: "-0.43px" }}>
                                Order Earnings
                            </span>
                            <span className="text-[14px] font-medium text-black" style={{ letterSpacing: "-0.43px" }}>
                                ₹{breakdown?.orderEarnings?.toLocaleString() || "0"}
                            </span>
                        </div>

                        {/* Customer Tips */}
                        <div className="flex justify-between items-center w-full">
                            <span className="text-[14px] font-medium text-black/50" style={{ letterSpacing: "-0.43px" }}>
                                Customer Tips
                            </span>
                            <span className="text-[14px] font-medium text-[#22C55E]" style={{ letterSpacing: "-0.43px" }}>
                                ₹{breakdown?.tips?.toLocaleString() || "0"}
                            </span>
                        </div>
                    </div>

                    {/* Second Divider: 12px below breakdown */}
                    <div
                        className="mt-[12px] w-full border-t border-dashed"
                        style={{ borderColor: "rgba(120, 120, 120, 0.2)" }}
                    />

                    {/* Summary Row: 12px below divider */}
                    <div className="mt-[12px] w-full px-[12px] flex justify-between items-center">
                        <span className="text-[14px] font-medium text-black" style={{ letterSpacing: "-0.43px" }}>
                            {title?.includes("Week") ? "Average per delivery:" : "Total earning:"}
                        </span>
                        <span className="text-[14px] font-medium text-black" style={{ letterSpacing: "-0.43px" }}>
                            ₹{title?.includes("Week")
                                ? (deliveries > 0 ? Math.round(amount / deliveries).toLocaleString() : "0")
                                : Number(amount).toLocaleString()
                            }
                        </span>
                    </div>
                </div>

                {/* Payout Activity Section: 13px below first container */}
                <div className="mt-[13px] w-[362px] h-auto rounded-[14px] bg-white border border-[#EDEDED] flex flex-col items-start shrink-0 relative">
                    {/* Header: 12px from top/left */}
                    <div className="w-full flex justify-between items-start pt-[12px] px-[12px]">
                        <span
                            className="text-[16px] font-bold text-black"
                            style={{ letterSpacing: "-0.43px" }}
                        >
                            Payout activity
                        </span>
                    </div>

                    {/* Body: 4px below header */}
                    <p
                        className="mt-[4px] px-[12px] text-[14px] font-medium text-black/50"
                        style={{ letterSpacing: "-0.43px" }}
                    >
                        No payout occured in the last 2 weeks
                    </p>

                    {/* Bottom Padding: 16px below body */}
                    <div className="pb-[16px]" />
                </div>

                {/* Download Summary CTA */}
                <button 
                    onClick={downloadSummary}
                    className="mt-auto mb-[20px] w-[362px] h-[48px] rounded-full bg-black flex items-center justify-center gap-[8px] transition-transform active:scale-95 shrink-0"
                >
                    <span className="text-white text-[16px] font-medium" style={{ letterSpacing: "-0.43px" }}>
                        Download Summary
                    </span>
                    <img src={downloadIcon} alt="Download" className="w-[20px] h-[20px]" />
                </button>
            </div>
        </div>
    );
};

export default EarningsDetail;
