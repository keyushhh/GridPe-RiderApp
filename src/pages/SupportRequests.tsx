import SupportStatusBottomSheet, { SupportStatusStep } from "../components/SupportStatusBottomSheet";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import chevronBackward from "../assets/chevron_backward.svg";
import helpCircleIcon from "../assets/help-circle.svg";

interface SupportTicket {
    id: string;
    title: string;
    amount: string;
    date: string;
    status: 'In Progress' | 'Resolved' | 'Closed';
    description?: string;
    footerNote?: string;
    steps?: SupportStatusStep[];
}

const SupportRequests = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'all' | 'open'>('all');
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

    // Each ticket owns its own steps — backend-ready structure
    const [tickets, setTickets] = useState<SupportTicket[]>([
        { 
            id: 'GRDPE-RDR-123', 
            title: 'Auto Payout Failed', 
            amount: '₹24,000', 
            date: '20 Mar', 
            status: 'In Progress',
            description: "My weekly payout for 06 Mar - 12 Mar didn't reach my HDFC bank account. The app shows 'Failed' but I haven't received a reason why.",
            footerNote: "We've identified a technical sync issue with HDFC bank servers. We are re-triggering your payout manually. Please check your wallet in 2 hours.",
            steps: [
                { label: 'Help Requested', timestamp: '20 Mar, 2026 | 11:00 AM', status: 'completed' },
                { label: 'Ticket Created', timestamp: '20 Mar, 2026 | 11:00 AM', status: 'completed' },
                { label: 'Agent Assigned', timestamp: '20 Mar, 2026 | 11:15 AM', status: 'completed' },
                { 
                    label: 'Call Scheduled', 
                    timestamp: '20 Mar, 2026 | 11:30 AM', 
                    description: 'Your call is scheduled, our representative will reach out to you in your registered mobile number.',
                    status: 'completed' 
                },
                { label: 'Call Completed', timestamp: '20 Mar, 2026 | 11:30 AM', status: 'completed' },
                { 
                    label: 'Upload Required Documents', 
                    description: 'In progress', 
                    buttonText: 'Upload Documents',
                    status: 'in_progress' 
                },
                { label: 'Support Provided', description: 'Pending', status: 'pending' },
            ]
        },
        { 
            id: 'GRDPE-RDR-119', 
            title: 'Auto Payout Failed', 
            amount: '₹24,000', 
            date: '18 Mar', 
            status: 'Resolved',
            description: "My weekly payout for 06 Mar - 12 Mar didn't reach my HDFC bank account. The app shows 'Failed' but I haven't received a reason why.",
            footerNote: "We've identified a technical sync issue with HDFC bank servers. Your payout has been re-triggered and credited to your account.",
            steps: [
                { label: 'Help Requested', timestamp: '18 Mar, 2026 | 10:00 AM', status: 'completed' },
                { label: 'Ticket Created', timestamp: '18 Mar, 2026 | 10:00 AM', status: 'completed' },
                { label: 'Agent Assigned', timestamp: '18 Mar, 2026 | 10:10 AM', status: 'completed' },
                { 
                    label: 'Call Scheduled', 
                    timestamp: '18 Mar, 2026 | 10:30 AM', 
                    description: 'Your call is scheduled, our representative will reach out to you in your registered mobile number.',
                    status: 'completed' 
                },
                { label: 'Solution Provided', timestamp: '18 Mar, 2026 | 11:00 AM', status: 'completed' },
                { label: 'Ticket Resolved', timestamp: '18 Mar, 2026 | 11:00 AM', status: 'completed' },
            ]
        },
        { 
            id: 'GRDPE-RDR-115', 
            title: 'Auto Payout Failed', 
            amount: '₹24,000', 
            date: '14 Mar', 
            status: 'Resolved',
            description: "My weekly payout for 06 Mar - 12 Mar didn't reach my HDFC bank account. The app shows 'Failed' but I haven't received a reason why.",
            steps: [
                { label: 'Help Requested', timestamp: '14 Mar, 2026 | 09:00 AM', status: 'completed' },
                { label: 'Ticket Created', timestamp: '14 Mar, 2026 | 09:00 AM', status: 'completed' },
                { label: 'Agent Assigned', timestamp: '14 Mar, 2026 | 09:15 AM', status: 'completed' },
                { label: 'Solution Provided', timestamp: '14 Mar, 2026 | 10:00 AM', status: 'completed' },
                { label: 'Ticket Resolved', timestamp: '14 Mar, 2026 | 10:00 AM', status: 'completed' },
            ]
        },
        { 
            id: 'GRDPE-RDR-108', 
            title: 'Auto Payout Failed', 
            amount: '₹24,000', 
            date: '10 Mar', 
            status: 'Resolved',
            description: "My weekly payout for 06 Mar - 12 Mar didn't reach my HDFC bank account. The app shows 'Failed' but I haven't received a reason why.",
            steps: [
                { label: 'Help Requested', timestamp: '10 Mar, 2026 | 11:00 AM', status: 'completed' },
                { label: 'Ticket Created', timestamp: '10 Mar, 2026 | 11:00 AM', status: 'completed' },
                { label: 'Agent Assigned', timestamp: '10 Mar, 2026 | 11:10 AM', status: 'completed' },
                { 
                    label: 'Call Scheduled', 
                    timestamp: '10 Mar, 2026 | 11:30 AM', 
                    description: 'Your call is scheduled, our representative will reach out to you in your registered mobile number.',
                    status: 'completed' 
                },
                { label: 'Call Completed', timestamp: '10 Mar, 2026 | 12:00 PM', status: 'completed' },
                { label: 'Solution Provided', timestamp: '10 Mar, 2026 | 12:30 PM', status: 'completed' },
                { label: 'Ticket Resolved', timestamp: '10 Mar, 2026 | 12:30 PM', status: 'completed' },
            ]
        },
    ]);

    const openTicketsCount = tickets.filter(t => t.status === 'In Progress').length;
    
    const handleUploadComplete = () => {
        if (!selectedTicket) return;

        // Update the ticket's own steps
        setTickets(prev => prev.map(t => {
            if (t.id !== selectedTicket.id) return t;
            const nextSteps = [...(t.steps || [])];
            const uploadStep = nextSteps.find(s => s.label === "Upload Required Documents");
            if (uploadStep) {
                uploadStep.status = 'completed';
                uploadStep.description = undefined;
                uploadStep.buttonText = undefined;
                uploadStep.timestamp = "20 Mar, 2026 | 11:40 AM";
            }
            // Mark Support Provided as in_progress
            const supportStep = nextSteps.find(s => s.label === "Support Provided");
            if (supportStep) {
                supportStep.status = 'in_progress';
                supportStep.description = 'In progress';
            }
            return { ...t, steps: nextSteps };
        }));

        // Update selected ticket to reflect changes in the open sheet
        setSelectedTicket(prev => {
            if (!prev) return null;
            const nextSteps = [...(prev.steps || [])];
            const uploadStep = nextSteps.find(s => s.label === "Upload Required Documents");
            if (uploadStep) {
                uploadStep.status = 'completed';
                uploadStep.description = undefined;
                uploadStep.buttonText = undefined;
                uploadStep.timestamp = "20 Mar, 2026 | 11:40 AM";
            }
            const supportStep = nextSteps.find(s => s.label === "Support Provided");
            if (supportStep) {
                supportStep.status = 'in_progress';
                supportStep.description = 'In progress';
            }
            return { ...prev, steps: nextSteps };
        });
    };

    const filteredTickets = activeTab === 'all' ? tickets : tickets.filter(t => t.status === 'In Progress');


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

            {/* Ticket List */}
            <div className="flex-1 w-full overflow-y-auto px-[15px] pt-[24px] pb-[40px] flex flex-col gap-[12px] relative z-10 no-scrollbar">
                {filteredTickets.map((ticket, index) => (
                    <div 
                        key={`${ticket.id}-${index}`}
                        onClick={() => {
                            setSelectedTicket(ticket);
                            setIsStatusOpen(true);
                        }}
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
                        <div className="flex flex-col">
                            <h3 className="text-black font-medium text-[16px] font-satoshi leading-tight">
                                {ticket.title} ({ticket.amount})
                            </h3>
                            <span className="mt-[8px] text-black/60 font-medium text-[12px] font-satoshi">
                                Ticket ID: {ticket.id} | {ticket.date}
                            </span>
                        </div>
                    </div>
                ))}
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
