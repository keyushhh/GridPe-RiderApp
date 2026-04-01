import SupportStatusBottomSheet, { SupportStatusStep } from "../components/SupportStatusBottomSheet";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import chatIcon from "../assets/chat.svg";
import helpCircleIcon from "../assets/help-circle.svg";
import GlowingOrb from "../components/GlowingOrb";
import PageHeader from "../components/PageHeader";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Button from "../components/ui/Button";
import { SupportTicket } from "../types/database";

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
            // Error handled silently
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
            // Error handled silently
        } finally {
            setIsLoading(false);
        }
    };

    const handleUploadComplete = () => {
        if (!selectedTicket) return;
        handleTicketClick(selectedTicket);
    };

    const filteredTickets = activeTab === 'all' 
        ? tickets 
        : tickets.filter(t => t.status === 'In Progress');

    const openTicketsCount = tickets.filter(t => t.status === 'In Progress').length;

    return (
        <div className="relative w-full h-[100dvh] bg-[#FDFDFD] font-satoshi flex flex-col items-center overflow-hidden">
            {/* Purple Glowing Orb */}
            <GlowingOrb />

            {/* Support Header */}
            <PageHeader title="Support & Help" backPath="/account-settings" />

            {/* Scrollable Content Area */}
            <div className="flex-1 w-full overflow-y-auto no-scrollbar flex flex-col items-center pb-[120px]">
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
                <div className="w-full px-[15px] pt-[24px] pb-[40px] flex flex-col gap-[12px] relative z-10">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <LoadingSpinner />
                            <p className="mt-4 text-black/50 text-[14px]">Loading tickets...</p>
                        </div>
                    ) : filteredTickets.length > 0 ? (
                        filteredTickets.map((ticket, index) => (
                            <div 
                                key={`${ticket.id}-${index}`}
                                onClick={() => handleTicketClick(ticket)}
                                className="w-[363px] h-auto p-[14px] rounded-[13px] border border-[#E9EAEB] bg-white flex items-start gap-[12px] relative shrink-0 cursor-pointer active:scale-[0.98] transition-transform"
                            >
                                <div className={`absolute top-[14px] right-[14px] px-[8px] py-[4px] rounded-[4px] flex items-center justify-center
                                    ${ticket.status === 'In Progress' ? 'bg-[#EAEDFF]' : 'bg-[#E7F7EF]'}
                                `}>
                                    <span className={`text-[12px] font-medium
                                        ${ticket.status === 'In Progress' ? 'text-[#5260FE]' : 'text-[#1CB956]'}
                                    `}>
                                        {ticket.status}
                                    </span>
                                </div>

                                <div className="w-[24px] h-[24px] flex items-center justify-center mt-[1px]">
                                    <img src={helpCircleIcon} alt="Icon" className="w-[24px] h-[24px]" />
                                </div>

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
                                It looks like you don't have any support tickets at the moment.
                            </p>
                            <div className="mt-8 px-4 flex flex-col gap-3 w-full">
                                <Button 
                                    onClick={() => navigate('/zing-ai')}
                                    variant="primary"
                                    className="w-full h-[52px]"
                                >
                                    <img src={chatIcon} alt="Chat" className="w-5 h-5 mr-2 brightness-0 invert" />
                                    Chat with Zing AI
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
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
