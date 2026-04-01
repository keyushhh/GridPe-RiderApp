import SupportStatusBottomSheet, { SupportStatusStep } from "../components/SupportStatusBottomSheet";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import chevronBackward from "../assets/chevron_backward.svg";
import helpCircleIcon from "../assets/help-circle.svg";
import chatIcon from "../assets/chat.svg";

interface SupportTicket {
    id: string;
    title: string;
    amount?: string;
    created_at?: string;
    status: 'In Progress' | 'Resolved' | 'Closed';
    description?: string;
    footerNote?: string;
    steps?: SupportStatusStep[];
}

const SupportRequests = () => {
    const navigate = useNavigate();
    const { riderUuid } = useAuth();
    const [activeTab, setActiveTab] = useState<'all' | 'open'>('all');
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchTickets = useCallback(async () => {
        if (!riderUuid) return;
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('support_tickets')
                .select('*')
                .eq('rider_id', riderUuid)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTickets(data || []);
        } catch (err) {
            console.error('Error fetching tickets:', err);
        } finally {
            setIsLoading(false);
        }
    }, [riderUuid]);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const handleTicketClick = async (ticket: SupportTicket) => {
        setIsLoading(true);
        try {
            const { data: steps, error } = await supabase
                .from('support_ticket_steps')
                .select('*')
                .eq('ticket_id', ticket.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            setSelectedTicket({
                ...ticket,
                steps: steps || []
            });
            setIsStatusOpen(true);
        } catch (err) {
            console.error('Error fetching ticket steps:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUploadComplete = () => {
        if (!selectedTicket) return;
        // Refresh ticket details or steps after upload
        handleTicketClick(selectedTicket);
    };

    const filteredTickets = activeTab === 'all' 
        ? tickets 
        : tickets.filter(t => t.status === 'In Progress');

    const openTicketsCount = tickets.filter(t => t.status === 'In Progress').length;

    return (
        <div className="relative w-[393px] h-screen bg-[#FDFDFD] font-satoshi flex flex-col items-center overflow-hidden">
            {/* Header */}
            <div className="flex-none flex items-center w-[362px] px-0 pt-12 pb-2 relative z-10">
                <button
                    onClick={() => navigate('/account-settings', { state: { activeTab: 'Help & Support' } })}
                    className="w-[32px] h-[32px] rounded-full bg-[#F5F5F5] flex items-center justify-center transition-transform active:scale-90"
                >
                    <img src={chevronBackward} alt="Back" className="w-[18px] h-[18px] brightness-0" />
                </button>

                <div className="flex-1 flex justify-center mr-[32px]">
                    <h1 className="text-black text-[22px] font-medium leading-none">
                        Support Requests
                    </h1>
                </div>
            </div>

            {/* Tabs */}
            <div className="mt-[24px] w-[362px] h-[52px] bg-[#F5F5F5] rounded-full p-[6px] flex items-center relative z-10">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`flex-1 h-full rounded-full transition-all duration-200 text-[14px] font-medium ${
                        activeTab === 'all' ? 'bg-black text-white' : 'text-black'
                    }`}
                >
                    All Tickets
                </button>
                <button
                    onClick={() => setActiveTab('open')}
                    className={`flex-1 h-full rounded-full transition-all duration-200 text-[14px] font-medium ${
                        activeTab === 'open' ? 'bg-black text-white' : 'text-black'
                    }`}
                >
                    Open Tickets ({openTicketsCount})
                </button>
            </div>

            {/* Ticket List / Empty State */}
            <div className="flex-1 w-full overflow-y-auto px-[15px] pt-[24px] pb-[40px] flex flex-col gap-[12px] relative z-10 no-scrollbar">
                {isLoading && tickets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-8 h-8 border-4 border-black/10 border-t-black rounded-full animate-spin" />
                        <span className="text-black/40 text-[14px]">Loading tickets...</span>
                    </div>
                ) : filteredTickets.length > 0 ? (
                    filteredTickets.map((ticket, index) => (
                        <div 
                            key={`${ticket.id}-${index}`}
                            onClick={() => handleTicketClick(ticket)}
                            className="w-[363px] h-auto p-[14px] rounded-[13px] border border-[#E9EAEB] bg-white flex items-start gap-[12px] relative shrink-0 cursor-pointer active:scale-[0.98] transition-transform"
                        >
                            {/* Status Badge */}
                            <div className={`absolute top-[14px] right-[14px] px-[8px] py-[4px] rounded-[4px] flex items-center justify-center
                                ${ticket.status === 'In Progress' ? 'bg-[#EAEDFF]' : 'bg-[#E7F7EF]'}
                            `}>
                                <span className={`text-[12px] font-medium
                                    ${ticket.status === 'In Progress' ? 'text-[#5260FE]' : 'text-[#1CB956]'}
                                `}>
                                    {ticket.status}
                                </span>
                            </div>

                            {/* Icon */}
                            <div className="w-[24px] h-[24px] flex items-center justify-center mt-[1px]">
                                <img src={helpCircleIcon} alt="Icon" className="w-[24px] h-[24px]" />
                            </div>

                            {/* Content */}
                            <div className="flex flex-col pr-[60px]">
                                <h3 className="text-black font-medium text-[16px] font-satoshi leading-tight">
                                    {ticket.title} {ticket.amount ? `(${ticket.amount})` : ''}
                                </h3>
                                <span className="mt-[8px] text-black/60 font-medium text-[12px] font-satoshi">
                                    Ticket ID: {ticket.id} | {new Date(ticket.created_at || '').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 px-10 text-center">
                        <div className="w-[64px] h-[64px] bg-[#F5F5F5] rounded-full flex items-center justify-center mb-6">
                            <img src={helpCircleIcon} alt="Help" className="w-[32px] h-[32px] opacity-20" />
                        </div>
                        <h2 className="text-black font-bold text-[18px]">No active requests</h2>
                        <p className="text-black/40 text-[14px] mt-2 mb-8 leading-relaxed">
                            It looks like you don't have any support tickets at the moment. If you're facing an issue, Zing is here to help!
                        </p>
                        <button 
                            onClick={() => navigate('/help/chat')}
                            className="h-[48px] px-8 rounded-full bg-black text-white font-medium text-[15px] flex items-center gap-2 active:scale-[0.95] transition-transform"
                        >
                            <img src={chatIcon} alt="Chat" className="w-[18px] h-[18px] brightness-0 invert" />
                            Chat with Zing
                        </button>
                    </div>
                )}
            </div>

            {/* Support Status Bottom Sheet */}
            <SupportStatusBottomSheet 
                isOpen={isStatusOpen}
                onClose={() => setIsStatusOpen(false)}
                ticketId={selectedTicket?.id || ""}
                ticketTitle={selectedTicket?.title || ""}
                ticketAmount={selectedTicket?.amount}
                steps={selectedTicket?.steps || []}
                isResolved={selectedTicket?.status === 'Resolved'}
                onUploadComplete={handleUploadComplete}
                variant="detailed"
                ticketDescription={selectedTicket?.description}
                footerNote={selectedTicket?.footerNote}
            />
        </div>
    );
};

export default SupportRequests;
