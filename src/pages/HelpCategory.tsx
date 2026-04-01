import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { helpCategories } from "../data/helpData";

const HelpCategory = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { categoryId } = useParams<{ categoryId: string }>();
    const [expandedId, setExpandedId] = useState<string | null>(location.state?.expandedId || null);

    useEffect(() => {
        if (location.state?.expandedId) {
            setExpandedId(location.state.expandedId);
        }
    }, [location.state]);

    const category = categoryId ? helpCategories[categoryId] : undefined;

    const toggleFaq = (id: string) => {
        setExpandedId(prev => (prev === id ? null : id));
    };

    if (!category) {
        return (
            <div className="fixed inset-0 bg-white font-satoshi flex items-center justify-center">
                <p className="text-[#7E7E7E] text-[16px]">Category not found.</p>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-white font-satoshi">
            {/* Purple glow decoration */}
            <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[250px] h-[250px] bg-[#5260FE] rounded-full blur-[100px] opacity-30 pointer-events-none z-0" />

            {/* Scrollable content */}
            <div className="relative z-20 h-full w-full flex flex-col overflow-y-auto no-scrollbar pb-[150px]">
                {/* Header */}
                <div className="px-5 pt-12 pb-4 flex items-center mb-[41px]">
                    <button
                        onClick={() => navigate('/account-settings', { state: { activeTab: 'Help & Support' } })}
                        className="w-[40px] h-[40px] rounded-full bg-white border border-[#E9EAEB] flex items-center justify-center shrink-0 active:bg-[#F7F8FA] transition-colors"
                    >
                        <ChevronLeft className="w-[24px] h-[24px] text-black" />
                    </button>
                    <h1 className="flex-1 text-center text-[22px] font-medium text-black font-satoshi mr-[40px]">
                        Help & Support
                    </h1>
                </div>

                {/* Category title */}
                <div className="px-5">
                    <h2 className="text-[16px] font-bold text-black mb-[14px] uppercase font-satoshi">
                        {category.title}
                    </h2>
                </div>

                {/* Accordion FAQ list */}
                <div className="px-5 flex justify-center">
                    <div className="w-[363px] rounded-[13px] overflow-hidden bg-white border border-[#E9EAEB] shadow-sm flex flex-col">
                        {category.faqs.map((faq, index) => {
                            const isExpanded = expandedId === faq.id;
                            const isLast = index === category.faqs.length - 1;

                            return (
                                <div key={faq.id}>
                                    {/* Question button */}
                                    <button
                                        onClick={() => toggleFaq(faq.id)}
                                        className="w-full flex items-center justify-between text-left pl-[14px] pr-[15px] py-[10px] active:bg-[#F7F8FA] transition-colors"
                                    >
                                        <span className="text-[14px] font-normal text-black font-satoshi pr-4">
                                            {faq.question}
                                        </span>
                                        {isExpanded ? (
                                            <ChevronDown className="w-[20px] h-[20px] text-[#7E7E7E] shrink-0" />
                                        ) : (
                                            <ChevronRight className="w-[20px] h-[20px] text-[#7E7E7E] shrink-0" />
                                        )}
                                    </button>

                                    {/* Answer (shown when expanded) */}
                                    {isExpanded && (
                                        <>
                                            {/* Dashed divider between question and answer */}
                                            <div className="w-full border-t border-dashed border-[#E6E8EB]" />
                                            <div className="px-[14px] pt-[10px] pb-4 animate-in fade-in slide-in-from-top-1 duration-200">
                                                <p className="text-[12px] leading-relaxed font-light text-black font-satoshi">
                                                    {faq.answer}
                                                </p>
                                            </div>
                                        </>
                                    )}

                                    {/* Separator between accordion items */}
                                    {!isLast && (
                                        <div className="w-full h-[1px] bg-[#E9EAEB]" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Watermark branding (now inside scrollable area) */}
                <div className="mt-auto px-[25px] pt-[40px] pb-[42px] z-10 pointer-events-none">
                    <p className="text-[40px] font-black text-black/40 leading-none font-satoshi">
                        Grid.Pe
                    </p>
                    <p className="text-[14px] font-medium text-[#7E7E7E] font-satoshi mt-1">
                        We turn 'WTF?' into 'Aah, okay.'
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HelpCategory;
