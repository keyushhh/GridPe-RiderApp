import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, PlusCircle, Send } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useAuth } from "../hooks/useAuth";

// --- Assets ---
import zingSmall from "../assets/zing-small.png";
import deliveredIcon from "../assets/chat-sent.svg";
import avatarImg from "../assets/avatar.png";

interface Message {
    id: string;
    sender: 'zing' | 'user';
    text: string[];
    timestamp: string;
    type?: 'text' | 'actions';
    actions?: string[];
    status?: 'sent' | 'delivered' | 'read';
    image?: string;
}

const ZingChat = () => {
    const navigate = useNavigate();
    const { avatar } = useAuth();
    const [inputValue, setInputValue] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const [isConnectingHuman, setIsConnectingHuman] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- Time Formatting (Example: 12:00 PM) ---
    const formatTime = () => {
        const now = new Date();
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${hours}:${minutes} ${ampm}`;
    };

    const sessionStartTime = useRef(formatTime());

    // Initialize first message
    useEffect(() => {
        setMessages([
            {
                id: '1',
                sender: 'zing',
                text: ["Greetings. I am Zing.", "How may I assist you with your Grid.Pe services today?"],
                timestamp: sessionStartTime.current,
                type: 'actions',
                actions: ["Order Status", "Payment Issues", "Connect with Human Agent"]
            }
        ]);
    }, []);

    // --- Auto-Scroll Logic ---
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isThinking]);

    const handleSend = (textOverride?: string, image?: string) => {
        const text = textOverride || inputValue;
        if (!text.trim() && !image) return;

        setHasInteracted(true);
        const userMsg: Message = {
            id: Date.now().toString(),
            sender: 'user',
            text: text ? [text] : [],
            image: image,
            timestamp: formatTime(),
            status: 'read'
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue("");

        if (text === "Connect with Human Agent") {
            handleHumanAgentRequest();
        } else {
            simulateBotReply(text || "Sent an image");
        }
    };

    const handleHumanAgentRequest = () => {
        setIsThinking(true);
        setTimeout(() => {
            setIsThinking(false);
            setIsConnectingHuman(true);
            const zingReply: Message = {
                id: Date.now().toString(),
                sender: 'zing',
                text: ["Understood. I'm connecting you with a human representative now. Please wait a moment..."],
                timestamp: formatTime(),
                type: 'text'
            };
            setMessages(prev => [...prev, zingReply]);
            
            // Simulate Agent joining
            setTimeout(() => {
                const agentReply: Message = {
                    id: (Date.now() + 1).toString(),
                    sender: 'zing',
                    text: ["Hello, I am Sarah from Rider Support. How can I assist you further?"],
                    timestamp: formatTime(),
                    type: 'text'
                };
                setMessages(prev => [...prev, agentReply]);
                setIsConnectingHuman(false);
            }, 3000);
        }, 1500);
    };

    const simulateBotReply = (input: string) => {
        setIsThinking(true);
        setTimeout(() => {
            setIsThinking(false);
            const lowerInput = input.toLowerCase();
            let replyText = "I have received your inquiry. A support representative will review this if automated assistance is insufficient.";
            
            if (lowerInput.includes('order')) replyText = "I can help with that. Please provide your Order ID so I can check the status for you.";
            if (lowerInput.includes('payment') || lowerInput.includes('wallet')) replyText = "For payment related queries, you can check your Wallet history or let me know if there's a specific transaction issue.";

            const zingReply: Message = {
                id: Date.now().toString(),
                sender: 'zing',
                text: [replyText],
                timestamp: formatTime(),
                type: 'text'
            };
            setMessages(prev => [...prev, zingReply]);
        }, 1200);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleSend(undefined, reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="fixed inset-0 w-full flex flex-col safe-area-top bg-[#FFFFFF] font-satoshi overflow-hidden z-50">
            {/* Light Mode Purple Glow (Matched with AccountSettings) */}
            <div
                className="absolute top-[-20px] left-1/2 -translate-x-1/2 w-[166px] h-[40px] rounded-full pointer-events-none z-0"
                style={{
                    backgroundColor: "#5260FE",
                    filter: "blur(60px)",
                    opacity: 0.8,
                }}
            />
            
            {/* Header (Transparent, matching AccountSettings) */}
            <header className="px-5 pt-12 pb-4 flex items-center relative z-20 shrink-0">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="w-[32px] h-[32px] rounded-full bg-white shadow-sm flex items-center justify-center transition-transform active:scale-90 absolute left-5"
                >
                    <ChevronLeft className="w-[18px] h-[18px] text-black" />
                </button>
                <h1 className="w-full text-center text-[22px] font-medium text-black leading-none">
                    Chat with Zing
                </h1>
            </header>

            {/* Chat Area */}
            <main
                ref={scrollRef}
                className="flex-1 px-5 pt-4 overflow-y-auto no-scrollbar relative z-10 flex flex-col"
            >
                {/* Session Markers */}
                <div className="flex flex-col items-center gap-1 mb-8 shrink-0 opacity-60">
                    <span className="text-[12px] font-medium tracking-tight text-black">Session Started</span>
                    <span className="text-[12px] font-medium tracking-tight text-black">Today {sessionStartTime.current}</span>
                </div>

                {/* Vertical Growth Spacer */}
                <div className="flex-1" />

                {/* Message List */}
                <div className="flex flex-col gap-6 mb-8">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`flex items-end gap-[12px] max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                                {msg.sender === 'zing' ? (
                                    <div className="w-[60px] h-[60px] shrink-0 transform -mb-1 flex items-center justify-center">
                                        {!hasInteracted ? (
                                            <DotLottieReact
                                                src="https://lottie.host/dec60184-c95b-480f-9bdb-e23f2f3545ab/SOlm7P1CIz.lottie"
                                                loop
                                                autoplay
                                            />
                                        ) : (
                                            <div className="w-[35px] h-[24px] flex items-center justify-center">
                                                <img src={zingSmall} alt="Zing" className="w-full h-auto object-contain" />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="w-[40px] h-[40px] rounded-full overflow-hidden shrink-0 mb-1 border border-black/[0.04]">
                                        <img 
                                            src={avatar || avatarImg} 
                                            alt="User" 
                                            className="w-full h-full object-cover" 
                                        />
                                    </div>
                                )}

                                <div className="flex flex-col gap-2">
                                    {/* Bubble (SPEC: 13px Normal, 18px corners, Backdrop blur 25px) */}
                                    <div
                                        className={`p-4 flex flex-col gap-2 backdrop-blur-[25px] transition-colors ${msg.sender === 'zing'
                                            ? 'max-w-[249px] rounded-t-[18px] rounded-br-[18px] rounded-bl-0 bg-[#F7F8FA] border border-[#E9EAEB]'
                                            : 'rounded-t-[18px] rounded-bl-[18px] rounded-br-0 bg-[#5260FE]/[0.05] border border-[#5260FE]/10'
                                            }`}
                                    >
                                        {msg.text.map((t, i) => (
                                            <p key={i} className="text-[13px] font-normal leading-tight text-black">
                                                {t}
                                            </p>
                                        ))}
                                        {msg.image && (
                                            <img 
                                                src={msg.image} 
                                                alt="Attachment" 
                                                className="max-w-full rounded-lg mt-2 border border-black/5" 
                                            />
                                        )}
                                    </div>

                                    {/* Action Buttons (SPEC: 13px Medium) */}
                                    {msg.type === 'actions' && msg.actions && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {msg.actions.map(action => (
                                                <button
                                                    key={action}
                                                    onClick={() => handleSend(action)}
                                                    className="h-[36px] px-4 rounded-full text-[13px] font-medium bg-[#5260FE]/10 border border-[#5260FE]/20 text-[#5260FE] active:bg-[#5260FE]/20"
                                                >
                                                    {action}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* User Status (SPEC: Timestamp + Delivered icon) */}
                                    {msg.sender === 'user' && (
                                        <div className="flex items-center gap-1 self-end mr-1 mt-[-4px]">
                                            <span className="text-[11px] font-medium text-black/40">{msg.timestamp}</span>
                                            <img src={deliveredIcon} alt="delivered" className="w-[12px] h-[12px] opacity-60" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Thinking Indicator */}
                    {isThinking && (
                        <div className="flex items-end gap-[12px] animate-in fade-in slide-in-from-bottom-2">
                            <div className="w-[60px] h-[60px] shrink-0 transform -mb-1">
                                <DotLottieReact src="https://lottie.host/dec60184-c95b-480f-9bdb-e23f2f3545ab/SOlm7P1CIz.lottie" loop autoplay />
                            </div>
                            <div className="backdrop-blur-[25px] border border-[#E9EAEB] bg-[#F7F8FA] rounded-t-[18px] rounded-br-[18px] rounded-bl-0 px-4 py-3 flex gap-1 mb-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#5260FE]/20 animate-bounce [animation-delay:-0.3s]" />
                                <div className="w-1.5 h-1.5 rounded-full bg-[#5260FE]/20 animate-bounce [animation-delay:-0.15s]" />
                                <div className="w-1.5 h-1.5 rounded-full bg-[#5260FE]/20 animate-bounce" />
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Input Bar (SPEC: 48px Height, Shadow-sm, 15px Normal font) */}
            <div className="px-5 pb-[42px] relative z-20 mt-auto">
                <div className="w-full h-[48px] backdrop-blur-[25px] border border-[#E9EAEB] bg-white rounded-full flex items-center px-[18px] shadow-sm">
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-1 hover:bg-[#F7F8FA] rounded-full transition-colors mr-2"
                    >
                        <PlusCircle className="w-6 h-6 text-[#5260FE]" />
                    </button>
                    <input
                        type="text"
                        value={inputValue}
                        disabled={isConnectingHuman}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={isConnectingHuman ? "Connecting to agent..." : "Start typing..."}
                        className="bg-transparent text-[15px] font-normal flex-1 outline-none text-black placeholder:text-black/30 font-satoshi"
                    />
                    <button 
                        onClick={() => handleSend()} 
                        disabled={!inputValue.trim() || isConnectingHuman}
                        className={`p-1 transition-all ${inputValue.trim() ? 'text-[#5260FE]' : 'text-[#B1B1B1]'}`}
                    >
                        <Send className="w-6 h-6" />
                    </button>
                </div>
                <input 
                    type="file" 
                    hidden 
                    ref={fileInputRef} 
                    accept="image/*" 
                    onChange={handleImageUpload}
                />
            </div>
        </div>
    );
};

export default ZingChat;
