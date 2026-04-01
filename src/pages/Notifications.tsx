import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import chevronBackward from "../assets/chevron_backward.svg";
import cashPickupIcon from "../assets/cash-pickup.svg";
import crossIcon from "../assets/cross.svg";
import pinLocationIcon from "../assets/pin-location.svg";
import payoutProcessedIcon from "../assets/payout-processed.svg";
import cashReceivedIcon from "../assets/cash-received.svg";
import incentiveSchemeIcon from "../assets/incentive-scheme.svg";
import updateIcon from "../assets/update.svg";
import bellIcon from "../assets/bell.svg";
import deleteWhiteIcon from "../assets/delete.svg";
import readIcon from "../assets/read.svg";

interface Notification {
    id: string | number;
    title: string;
    message: string;
    created_at: string;
    type: string;
    is_read: boolean;
}

const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just Now";
    
    const minutes = Math.floor(diffInSeconds / 60);
    if (minutes < 60) return `${minutes}min`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}hr`;
    
    const days = Math.floor(hours / 24);
    return `${days}d`;
};

const getNotificationIcon = (type: string) => {
    switch (type.toLowerCase()) {
        case 'payout': return payoutProcessedIcon;
        case 'system': return bellIcon;
        case 'update': return updateIcon;
        case 'delivery': return cashPickupIcon;
        case 'cancelled': return crossIcon;
        case 'location_update': return pinLocationIcon;
        case 'cash_received': return cashReceivedIcon;
        case 'incentive': return incentiveSchemeIcon;
        default: return bellIcon;
    }
};

const SwipeableNotification = ({ notif, onMute, onDismiss, onRead }: { notif: Notification, onMute: (id: string | number) => void, onDismiss: (id: string | number) => void, onRead: (id: string | number) => void }) => {
    const [swipeX, setSwipeX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isActioning, setIsActioning] = useState(false);
    const [actionType, setActionType] = useState<'dismiss' | 'read' | 'mute' | null>(null);
    const startX = useRef(0);
    const maxSwipeLeft = -150; 
    const maxSwipeRight = 80;
    const threshold = 220;

    const onTouchStart = (e: React.TouchEvent) => {
        startX.current = e.touches[0].clientX;
        setIsDragging(true);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        if (!isDragging || isActioning) return;
        const currentX = e.touches[0].clientX;
        const deltaX = currentX - startX.current;
        setSwipeX(deltaX);
    };

    const onTouchEnd = () => {
        setIsDragging(false);
        if (swipeX < -threshold) {
            setIsActioning(true);
            setActionType('dismiss');
            setSwipeX(-500); 
            setTimeout(() => onDismiss(notif.id), 400);
        } else if (swipeX > threshold) {
            setIsActioning(true);
            setActionType('read');
            setSwipeX(500);
            setTimeout(() => onRead(notif.id), 400);
        } else if (swipeX < -80) {
            setSwipeX(maxSwipeLeft);
        } else if (swipeX > 40) {
            setSwipeX(maxSwipeRight);
        } else {
            setSwipeX(0);
        }
    };

    const isSwiping = swipeX !== 0;

    return (
        <div className={`relative w-full h-auto rounded-[14px] transition-all duration-300 ${isActioning ? 'max-h-0 opacity-0 mb-0 mt-0 overflow-hidden' : 'max-h-[200px] mb-[12px] p-[1px]'}`}>
            {/* Background Actions */}
            {isSwiping && (
                <div className="absolute inset-0 z-0 rounded-[14px] overflow-hidden">
                    {/* Left side action (Read) - Revealed when swiping RIGHT (swipeX > 0) */}
                    <div 
                        className="absolute left-0 top-[1px] bottom-[1px] bg-[#5260FE] flex items-center justify-start overflow-hidden transition-opacity duration-200"
                        style={{ width: '100px', opacity: swipeX > 0 ? 1 : 0 }}
                    >
                        <div className="flex flex-col items-center justify-center w-[80px] shrink-0 h-full">
                            <img src={readIcon} alt="Read" className="w-[24px] h-[24px]" />
                            <span className="text-white text-[12px] font-bold mt-1">Read</span>
                        </div>
                    </div>

                    {/* Right side actions (Mute, Dismiss) - Revealed when swiping LEFT (swipeX < 0) */}
                    <div 
                        className="absolute right-0 top-[1px] bottom-[1px] bg-[#D90E0D] flex items-center justify-end overflow-hidden transition-opacity duration-200"
                        style={{ width: '160px', opacity: swipeX < 0 ? 1 : 0 }}
                    >
                        <div className="flex h-full w-full">
                            <div 
                                className="w-[80px] h-full bg-[#E37700] flex flex-col items-center justify-center cursor-pointer"
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    setIsActioning(true);
                                    setActionType('mute');
                                    setSwipeX(-500);
                                    setTimeout(() => onMute(notif.id), 400);
                                }}
                            >
                                <img src={bellIcon} alt="Mute" className="w-[20px] h-[20px]" />
                                <span className="text-white text-[12px] font-bold mt-1">Mute</span>
                            </div>
                            <div 
                                className="w-[80px] h-full bg-[#D90E0D] flex flex-col items-center justify-center cursor-pointer"
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    setIsActioning(true);
                                    setActionType('dismiss');
                                    setSwipeX(-500);
                                    setTimeout(() => onDismiss(notif.id), 400);
                                }}
                            >
                                <img src={deleteWhiteIcon} alt="Dismiss" className="w-[20px] h-[20px] brightness-0 invert" />
                                <span className="text-white text-[12px] font-bold mt-1">Dismiss</span>
                            </div>
                        </div>
                    </div>

                    {/* Full Swipe Overlays (Threshold-based) */}
                    {swipeX < -threshold && (
                        <div className="absolute inset-0 bg-[#D90E0D] flex items-center justify-center z-20 rounded-[14px]">
                            <span className="text-white text-[18px] font-bold">Dismissed</span>
                        </div>
                    )}
                    {swipeX > threshold && (
                        <div className="absolute inset-0 bg-[#5260FE] flex items-center justify-center z-20 rounded-[14px]">
                            <span className="text-white text-[18px] font-bold">Read</span>
                        </div>
                    )}

                    {/* Actioning Overlays (Triggered by Button Clicks) */}
                    {isActioning && actionType === 'mute' && (
                        <div className="absolute inset-0 bg-[#E37700] flex items-center justify-center z-20 rounded-[14px]">
                            <span className="text-white text-[18px] font-bold">Notification Muted</span>
                        </div>
                    )}
                    {isActioning && actionType === 'dismiss' && (
                         <div className="absolute inset-0 bg-[#D90E0D] flex items-center justify-center z-20 rounded-[14px]">
                             <span className="text-white text-[18px] font-bold">Dismissed</span>
                         </div>
                    )}
                    {isActioning && actionType === 'read' && (
                        <div className="absolute inset-0 bg-[#5260FE] flex items-center justify-center z-20 rounded-[14px]">
                            <span className="text-white text-[18px] font-bold">Read</span>
                        </div>
                    )}
                </div>
            )}

            {/* Foreground Card Content */}
            <div 
                className={`w-full h-auto p-[14px] flex items-start gap-[14px] relative transition-transform duration-200 ease-out z-10 select-none cursor-grab active:cursor-grabbing rounded-[14px]
                    ${isSwiping ? 'bg-[#EAEDFF]' : 'bg-white border border-[#676767]/30'}`}
                style={{ 
                    transform: `translateX(${swipeX}px)`,
                }}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onMouseDown={(e) => {
                    // Supporting mouse swipe for testing
                    const startXPos = e.clientX;
                    const onMouseMove = (moveEvent: MouseEvent) => {
                        const deltaX = moveEvent.clientX - startXPos;
                        setSwipeX(deltaX);
                    };
                    const onMouseUp = (upEvent: MouseEvent) => {
                        document.removeEventListener('mousemove', onMouseMove);
                        document.removeEventListener('mouseup', onMouseUp);
                        setIsDragging(false);
                        const finalDeltaX = upEvent.clientX - startXPos;
                        if (finalDeltaX < -threshold) {
                            setIsActioning(true);
                            setActionType('dismiss');
                            setSwipeX(-500); 
                            setTimeout(() => onDismiss(notif.id), 400);
                        } else if (finalDeltaX > threshold) {
                            setIsActioning(true);
                            setActionType('read');
                            setSwipeX(500);
                            setTimeout(() => onRead(notif.id), 400);
                        } else if (finalDeltaX < -80) {
                            setSwipeX(maxSwipeLeft);
                        } else if (finalDeltaX > 40) {
                            setSwipeX(maxSwipeRight);
                        } else {
                            setSwipeX(0);
                        }
                    };
                    document.addEventListener('mousemove', onMouseMove);
                    document.addEventListener('mouseup', onMouseUp);
                    setIsDragging(true);
                }}
            >
                {/* Icon Container (24x24) */}
                <div className="w-[24px] h-[24px] flex-shrink-0 flex items-center justify-center">
                    <img src={getNotificationIcon(notif.type)} alt={notif.title} className="w-[24px] h-[24px] object-contain" />
                </div>
                
                {!notif.is_read && (
                    <div className="absolute top-2 right-2 w-[8px] h-[8px] bg-[#5260FE] rounded-full" />
                )}

                {/* Content Area */}
                <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-center w-full">
                        <h3 className="text-black font-bold text-[14px] leading-tight">
                            {notif.title}
                        </h3>
                        <span className="text-black text-[14px] font-medium whitespace-nowrap ml-2" style={{ letterSpacing: '-0.43px' }}>
                            {getRelativeTime(notif.created_at)}
                        </span>
                    </div>
                    <p className="mt-[8px] text-black font-medium text-[14px] leading-snug">
                        {notif.message}
                    </p>
                </div>
            </div>
        </div>
    );
};

const Notifications = () => {
    const navigate = useNavigate();
    const { riderUuid } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        if (!riderUuid) return;
        
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('rider_id', riderUuid)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setNotifications(data || []);
        } catch (err) {
            console.error('Error fetching notifications:', err);
        } finally {
            setLoading(false);
        }
    }, [riderUuid]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleMarkAllAsRead = async () => {
        if (!riderUuid || notifications.length === 0) return;
        
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('rider_id', riderUuid)
                .eq('is_read', false);

            if (error) throw error;
            
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (err) {
            console.error('Error marking all as read:', err);
        }
    };

    const handleMute = (id: string | number) => {
        console.log(`Muted notification ${id}`);
    };

    const handleDismiss = async (id: string | number) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('id', id);

            if (error) throw error;
            
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (err) {
            console.error('Error deleting notification:', err);
        }
    };

    const handleRead = async (id: string | number) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', id);

            if (error) throw error;
            
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    };

    return (
        <div className="relative w-[393px] h-screen bg-white font-satoshi flex flex-col items-center overflow-hidden">
            {/* Glowing Orb */}
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
                    onClick={() => navigate('/dashboard')}
                    className="w-[32px] h-[32px] rounded-full bg-white shadow-sm flex items-center justify-center transition-transform active:scale-90"
                >
                    <img src={chevronBackward} alt="Back" className="w-[18px] h-[18px] brightness-0" />
                </button>

                <div className="flex-1 flex justify-center mr-[32px]">
                    <h1 className="text-black text-[22px] font-medium leading-none">
                        Notifications
                    </h1>
                </div>
            </div>

            {notifications.length > 0 ? (
                <div className="flex-1 w-full flex flex-col bg-transparent relative z-10 overflow-hidden">
                    {/* List Header */}
                    <div className="flex items-center justify-between w-full px-[18px] mt-[24px] mb-[16px]">
                        <span className="text-black font-medium text-[14px]" style={{ letterSpacing: '-0.43px' }}>New</span>
                        <button 
                            onClick={handleMarkAllAsRead}
                            className="text-[#5260FE] font-bold text-[14px]"
                            style={{ letterSpacing: '-0.43px' }}
                        >
                            Mark all as read
                        </button>
                    </div>

                    {/* Scrollable List Area */}
                    <div className="flex-1 w-full overflow-y-auto no-scrollbar px-[16px] pb-[40px] flex flex-col">
                        {loading ? (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="w-8 h-8 border-4 border-[#5260FE] border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <SwipeableNotification 
                                    key={notif.id} 
                                    notif={notif} 
                                    onMute={handleMute} 
                                    onDismiss={handleDismiss} 
                                    onRead={handleRead}
                                />
                            ))
                        )}
                    </div>
                </div>
            ) : (
                /* Empty State Content */
                <div className="flex-1 w-full flex flex-col items-center justify-center -mt-[80px] px-[24px]">
                    {loading ? (
                        <div className="w-8 h-8 border-4 border-[#5260FE] border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <>
                            {/* Illustration: Stacked Cards */}
                            <div className="relative w-[300px] h-[180px] flex justify-center items-center mb-[32px]">
                                {/* Bottom Card */}
                                <div className="absolute top-[0px] w-[230px] h-[75px] bg-white border border-[#F2F2F2] rounded-[16px] opacity-40 shadow-sm flex items-center px-4 gap-3">
                                    <div className="w-[42px] h-[42px] bg-[#F2F2F2] rounded-[10px] flex-shrink-0" />
                                    <div className="flex flex-col gap-2 flex-grow">
                                        <div className="h-[9px] bg-[#F2F2F2] rounded-full w-[60%]" />
                                        <div className="h-[9px] bg-[#F2F2F2] rounded-full w-[85%]" />
                                    </div>
                                </div>
                                {/* Middle Card */}
                                <div className="absolute top-[20px] w-[265px] h-[75px] bg-white border border-[#F2F2F2] rounded-[18px] opacity-70 shadow-sm flex items-center px-4 gap-3">
                                     <div className="w-[42px] h-[42px] bg-[#F2F2F2] rounded-[10px] flex-shrink-0" />
                                    <div className="flex flex-col gap-2 flex-grow">
                                        <div className="h-[9px] bg-[#F2F2F2] rounded-full w-[65%]" />
                                        <div className="h-[9px] bg-[#F2F2F2] rounded-full w-[90%]" />
                                    </div>
                                </div>
                                {/* Top Card */}
                                <div className="absolute top-[45px] w-[300px] h-[85px] bg-white border border-[#EDEDED] rounded-[22px] shadow-[0px_12px_32px_rgba(0,0,0,0.06)] z-10 flex items-center px-[18px] gap-4">
                                    {/* Blue Icon Case */}
                                    <div className="w-[50px] h-[50px] bg-[#5260FE] rounded-[14px] flex-shrink-0" />
                                    
                                    <div className="flex flex-col gap-3 flex-grow">
                                        <div className="h-[10px] bg-[#F2F2F2] rounded-full w-[45%]" />
                                        <div className="h-[10px] bg-[#F2F2F2] rounded-full w-[95%]" />
                                        <div className="h-[10px] bg-[#F2F2F2] rounded-full w-[70%]" />
                                    </div>
                                </div>
                            </div>
        
                            {/* Text Content */}
                            <h2 className="text-black font-bold text-[20px] text-center mb-2">
                                All caught up!
                            </h2>
                            <p className="text-black font-medium text-[16px] text-center opacity-60 w-[240px] leading-snug">
                                You’ve checked all your updates. Great job!
                            </p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default Notifications;
