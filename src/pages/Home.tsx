import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import safetyToolkitIcon from "../assets/safety-toolkit.svg";
import menuIcon from "../assets/menu.jpg";
import giftIcon from "../assets/gift.svg";
import referralImg from "../assets/referral image.png";
import homeIcon from "../assets/home.svg";
import earningsIcon from "../assets/earnings.svg";
import notificationsIcon from "../assets/notifications.svg";
import refreshIcon from "../assets/Refresh.svg";
import OrderModal from "../components/OrderModal";
import PickUpVerificationModal from "../components/PickUpVerificationModal";
import FaceVerification from "../components/FaceVerification";
import DeliveryOTPModal from "../components/DeliveryOTPModal";
import NotificationBottomSheet from "../components/NotificationBottomSheet";
import { useAuth } from "../hooks/useAuth";
import TransactionDetailBottomSheet, { Transaction } from "../components/TransactionDetailBottomSheet";
import SafetyToolkitBottomSheet from "../components/SafetyToolkitBottomSheet";
import EmergencyAssistanceBottomSheet from "../components/EmergencyAssistanceBottomSheet";
import ShareTripBottomSheet from "../components/ShareTripBottomSheet";
import HotlineBottomSheet from "../components/HotlineBottomSheet";
import { transactionService } from "../services/transactionService";
import DeliveryFallbackPopups from "../components/DeliveryFallbackPopups";
import { supabase } from "../lib/supabase";
import { storageService } from "../services/storageService";
import SecurityAlert from "../components/SecurityAlert";

const Home = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState("home");
    const { kycStatus, fullName, riderUuid, totalEarnings, isOnline, setIsOnline, refreshProfile, selectedZoneId, selectedHubName, selectedZoneName } = useAuth();
    const [hasBeenOnline, setHasBeenOnline] = useState(
        localStorage.getItem("rider_has_been_online") === "true"
    );
    
    // Fallback if totalEarnings is not yet synced
    const earnings = totalEarnings || Number(localStorage.getItem("rider_earnings")) || 0;

    const [showOrderModal, setShowOrderModal] = useState(false);
    const [pendingOrder, setPendingOrder] = useState<any>(null);
    const [activeOrder, setActiveOrder] = useState<any>(null);
    const [customerInfo, setCustomerInfo] = useState<{name: string, phone: string} | null>(null);
    const [hasActiveOrder, setHasActiveOrder] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [securityAlert, setSecurityAlert] = useState<{show: boolean, message: string}>({show: false, message: ""});
    
    // Subscribe to Orders Realtime
    useEffect(() => {
        if (!riderUuid) {
            console.log('Order subscription blocked: Missing riderUuid');
            return;
        }
        if (!isOnline) {
            console.log('Order subscription blocked: Rider is Offline');
            return;
        }

        const filter = selectedZoneId ? `zone_id=eq.${selectedZoneId}` : '';
        console.log(`Subscribing to real-time orders for rider ${riderUuid} in zone ${selectedZoneId} (Filter: ${filter})...`);

        const channel = supabase
            .channel('orders-realtime')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'orders',
                    filter: filter
                },
                (payload) => {
                    console.log('Real-time order event received:', payload);
                    
                    if (payload.eventType === 'INSERT' && payload.new.status === 'pending') {
                        console.log('MATCH: New pending order detected!');
                        enrichOrderData(payload.new).then(enriched => {
                            if (enriched) {
                                setPendingOrder(enriched);
                                setShowOrderModal(true);
                            }
                        });
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'orders',
                    filter: `rider_id=eq.${riderUuid}`
                },
                (payload) => {
                    console.log('MATCH: Active order updated for this rider!');
                    enrichOrderData(payload.new).then(enriched => {
                        if (enriched) {
                            setActiveOrder(enriched);
                            setHasActiveOrder(true);
                            
                            // Sync local UI status
                            if (enriched.status === 'picked_up') {
                                setOrderStatus('picked_up');
                            } else if (enriched.status === 'delivered') {
                                setHasActiveOrder(false);
                                setActiveOrder(null);
                                refreshProfile();
                                navigate("/order-delivered");
                            }
                        }
                    });
                }
            )
            .subscribe((status) => {
                console.log('Supabase subscription status:', status);
            });

        return () => {
            console.log('Cleaning up order subscription...');
            supabase.removeChannel(channel);
        };
    }, [riderUuid, isOnline, selectedZoneId]);

    // Fetch Customer Info when Active Order changes
    useEffect(() => {
        const fetchCustomerInfo = async () => {
            if (!activeOrder?.id) {
                setCustomerInfo(null);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('active_order_customer_info')
                    .select('customer_name, customer_phone')
                    .eq('order_id', activeOrder.id)
                    .maybeSingle();

                if (error) {
                    console.error('Failed to fetch customer info:', error);
                    return;
                }

                if (data) {
                    setCustomerInfo({
                        name: data.customer_name,
                        phone: data.customer_phone
                    });
                }
            } catch (err) {
                console.error('Customer info fetch error:', err);
            }
        };

        fetchCustomerInfo();
    }, [activeOrder?.id]);

    const [showPickUpModal, setShowPickUpModal] = useState(false);
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [showFaceVerification, setShowFaceVerification] = useState(false);
    const [faceVerificationMode, setFaceVerificationMode] = useState<'photo' | 'video'>('photo');
    const [isVerified, setIsVerified] = useState(false);
    const [orderStatus, setOrderStatus] = useState<'pickup_pending' | 'picked_up'>('pickup_pending');
    const [verificationType, setVerificationType] = useState<'pickup' | 'delivery'>('pickup');
    
    // Helper to enrich order data (Hub Details + Delivery Details + Financials)
    const enrichOrderData = async (order: any) => {
        if (!order) return null;
        
        let enriched = { ...order };
        
        // 1. Pickup Details (from pickup_location id)
        if (order.pickup_location) {
            try {
                const { data: hubData } = await supabase
                    .from('hubs')
                    .select('location_name, address')
                    .eq('id', order.pickup_location)
                    .maybeSingle();
                
                if (hubData) {
                    enriched.pickup_name = hubData.location_name;
                    enriched.pickup_address = hubData.address;
                }
            } catch (err) {
                console.error('Hub fetch error:', err);
            }
        }

        // 2. Delivery Details (from delivery_address_text or address_id)
        if (!enriched.delivery_address && order.address_id) {
            try {
                const { data: addressData } = await supabase
                    .from('user_addresses')
                    .select('full_address')
                    .eq('id', order.address_id)
                    .maybeSingle();
                
                if (addressData) {
                    enriched.delivery_address = addressData.full_address;
                }
            } catch (err) {
                console.error('Delivery address fetch error:', err);
            }
        } else if (order.delivery_address_text) {
            enriched.delivery_address = order.delivery_address_text;
        }

        // 3. Distance & Earnings Sync
        const distance = Number(order.distance_km || order.distance || 2.1);
        enriched.distance = distance;
        
        // Ensure earnings are valid numbers
        enriched.rider_earnings = Number(order.rider_earnings || 0);
        enriched.delivery_tip = Number(order.delivery_tip || 0);
        enriched.total_potential = enriched.rider_earnings + enriched.delivery_tip;
        
        return enriched;
    };
    const [isAtHub, setIsAtHub] = useState(false);
    const [isAtCustomer, setIsAtCustomer] = useState(false);
    const [showNotificationSheet, setShowNotificationSheet] = useState(false);
    const [showTipBottomSheet, setShowTipBottomSheet] = useState(false);
    const [newTipTransaction, setNewTipTransaction] = useState<Transaction | null>(null);
    const [showSafetyToolkit, setShowSafetyToolkit] = useState(false);
    const [showEmergencyAssistance, setShowEmergencyAssistance] = useState(false);
    const [showShareTrip, setShowShareTrip] = useState(false);
    const [showHotline, setShowHotline] = useState(false);
    const [locationName, setLocationName] = useState("Detecting location...");
    
    // Tracking references
    const lastLocationRef = useRef<{lat: number, lng: number} | null>(null);
    const lastUpdateTimeRef = useRef<number>(0);
    const watchIdRef = useRef<number | null>(null);

    // Helper: Haversine distance in meters
    const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371e3; // metres
        const φ1 = lat1 * Math.PI/180;
        const φ2 = lat2 * Math.PI/180;
        const Δφ = (lat2-lat1) * Math.PI/180;
        const Δλ = (lon2-lon1) * Math.PI/180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return R * c;
    };

    const updatePresenceAndLocation = async (lat: number, lng: number) => {
        if (!riderUuid) return;
        
        try {
            // Update location via RPC
            await supabase.rpc('update_rider_location', { 
                lat: lat, 
                lng: lng 
            });
            
        } catch (err) {
            console.error('Failed to update location heartbeat:', err);
        }
    };
    
    // Initial Fetch for Active Order
    useEffect(() => {
        const fetchInitialActiveOrder = async () => {
            if (!riderUuid) return;
            
            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('rider_id', riderUuid)
                    .in('status', ['accepted', 'picked_up'])
                    .maybeSingle();
                
                if (data) {
                    console.log('Found existing active order on load:', data);
                    const enriched = await enrichOrderData(data);
                    if (enriched) {
                        setActiveOrder(enriched);
                        setHasActiveOrder(true);
                        setOrderStatus(enriched.status === 'picked_up' ? 'picked_up' : 'pickup_pending');
                    }
                }
            } catch (err) {
                console.error('Initial active order fetch error:', err);
            }
        };

        fetchInitialActiveOrder();
    }, [riderUuid]);

    // Location Heartbeat & Watcher
    useEffect(() => {
        if (isOnline && riderUuid) {
            console.log('Starting location watcher (isOnline=true)...');
            
            if ("geolocation" in navigator) {
                watchIdRef.current = navigator.geolocation.watchPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        const now = Date.now();
                        
                        let shouldUpdate = false;
                        
                        if (!lastLocationRef.current) {
                            shouldUpdate = true;
                        } else {
                            const dist = getDistance(
                                lastLocationRef.current.lat, 
                                lastLocationRef.current.lng, 
                                latitude, 
                                longitude
                            );
                            const timeDiff = now - lastUpdateTimeRef.current;
                            
                            if (dist > 50 || timeDiff > 15000) {
                                shouldUpdate = true;
                            }
                        }

                        if (shouldUpdate) {
                            await updatePresenceAndLocation(latitude, longitude);
                        }
                    },
                    (error) => console.error("Watcher error:", error),
                    { enableHighAccuracy: true, maximumAge: 10000 }
                );
            }
        } else {
            // Stop watcher if offline
            if (watchIdRef.current !== null) {
                console.log('Stopping location watcher (isOnline=false)...');
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
            }
        }

        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, [isOnline, riderUuid]);

    // Fallback Flow State
    const [isFallbackOpen, setIsFallbackOpen] = useState(false);
    const [fallbackStatus, setFallbackStatus] = useState<'none' | 'mismatch' | 'waiting' | 'in_progress' | 'failure' | 'request_approval' | 'approved' | 'complete'>('none');
    const [activeOrderId] = useState("CASH-789"); // Mock order ID
    const [retryCount, setRetryCount] = useState(0);

    // Timer-based Simulation for Fallback Flow (Frontend-only test)
    useEffect(() => {
        if (!isFallbackOpen || fallbackStatus !== 'waiting') return;

        console.log("Starting approval simulation timer...");
        const timer = setTimeout(() => {
            setFallbackStatus('approved');
            console.log("Simulation: Customer Approved!");
        }, 3000); // 3 seconds wait

        return () => clearTimeout(timer);
    }, [isFallbackOpen, fallbackStatus]);

    // Fetch live location (Initial Reverse Geocode)
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                        const data = await res.json();
                        const addr = data.locality || data.city || data.principalSubdivision || "Current Location";
                        const street = data.street || data.neighborhood || "";
                        const fullAddr = street ? `${street}, ${addr}` : addr;
                        setLocationName(fullAddr);
                    } catch (err) {
                        console.error("Reverse geocoding failed:", err);
                        setLocationName("Location found");
                    }
                },
                (error) => {
                    console.error("Error fetching location:", error);
                    setLocationName("Location access denied");
                }
            );
        } else {
            setLocationName("Geolocation not supported");
        }
    }, []);

    // Listen for new transactions (Tips)
    useEffect(() => {
        const handleNewTx = (e: any) => {
            const tx = e.detail as Transaction;
            if (tx.type === 'Earnings' && tx.title?.toLowerCase().includes('tip')) {
                setNewTipTransaction(tx);
                setShowTipBottomSheet(true);
            }
        };

        window.addEventListener('new-transaction', handleNewTx);
        return () => window.removeEventListener('new-transaction', handleNewTx);
    }, []);

    // Simulation: Reach hub/customer logic (Kept for visual testing but integrated with real order state)
    useEffect(() => {
        if (hasActiveOrder && activeOrder?.status === 'accepted') {
            const timer = setTimeout(() => setIsAtHub(true), 2000); // 2 seconds for demo
            return () => clearTimeout(timer);
        } else {
            setIsAtHub(false);
        }
    }, [hasActiveOrder, activeOrder?.status]);

    useEffect(() => {
        if (activeOrder?.status === 'picked_up') {
            const timer = setTimeout(() => setIsAtCustomer(true), 3000); // 3 seconds for demo
            return () => clearTimeout(timer);
        } else {
            setIsAtCustomer(false);
        }
    }, [activeOrder?.status]);

    // Handle Order Completion from OrderDelivered page and Camera Retakes
    useEffect(() => {
        const state = location.state as any;
        if (state?.orderCompleted) {
            setHasActiveOrder(false);
            window.history.replaceState({ ...state, orderCompleted: false }, document.title);
        }

        if (state?.openCameraVideo) {
            setFaceVerificationMode('video');
            setShowFaceVerification(true);
            window.history.replaceState({ ...state, openCameraVideo: false }, document.title);
        }

        if (state?.videoSubmitted) {
            setFallbackStatus('complete');
            setIsFallbackOpen(true);
            window.history.replaceState({ ...state, videoSubmitted: false }, document.title);
        }
    }, [location.state]);

    const handleOpenInMaps = () => {
        if (!activeOrder?.delivery_location?.coordinates) {
            // Fallback to text address if coordinates missing
            const address = activeOrder?.delivery_address || activeOrder?.delivery_location || "Delivery Location";
            const encodedAddress = encodeURIComponent(address as string);
            window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
            return;
        }

        const [lng, lat] = activeOrder.delivery_location.coordinates;
        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        const appleMapsUrl = `maps://maps.apple.com/?daddr=${lat},${lng}`;

        // Attempt to open Google Maps, fallback handled by browser/OS
        window.open(googleMapsUrl, '_blank');
    };

    const handleAcceptOrder = async (orderId: string) => {
        if (!riderUuid || !fullName) return;
        
        try {
            // Using Edge Function instead of RPC for better logging and security
            const { data, error } = await supabase.functions.invoke('accept-order', {
                body: { riderId: fullName, orderId: orderId }
            });

            if (error) {
                console.error('Failed to accept order:', error);
                return;
            }

            console.log('Order accepted successfully:', data);
            setHasActiveOrder(true);
            setShowOrderModal(false);
            
            // Refetch to sync state
            handleManualRefresh();
        } catch (err) {
            console.error('Accept order error:', err);
        }
    };

    const handlePickupOrder = async (selfieUrl?: string) => {
        if (!activeOrder || !fullName) return;

        try {
            // selfieUrl is passed from PickUpVerificationModal (base64)
            const { data, error } = await supabase.functions.invoke('pickup-order', {
                body: { 
                    riderId: fullName, 
                    orderId: activeOrder.id,
                    selfieBase64: selfieUrl
                }
            });

            if (error) throw error;

            console.log('Order marked as picked up:', data);
            setShowPickUpModal(false);
            setOrderStatus('picked_up');
            
            // Sync with local state
            setActiveOrder((prev: any) => ({ ...prev, status: 'picked_up', pickup_selfie_url: data.selfieUrl }));
        } catch (err) {
            console.error('Pickup error:', err);
        }
    };

    const handleManualRefresh = async () => {
        if (!isOnline || isRefreshing) return;
        
        setIsRefreshing(true);
        
        try {
            // Fetch available orders FILTERED BY ZONE ID (Zone-Based Architecture)
            let query = supabase.from('available_orders').select('*', { count: 'exact' });
            
            if (selectedZoneId) {
                query = query.eq('zone_id', selectedZoneId);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Refresh failed:', error);
                return;
            }

            const orderCount = data?.length || 0;
            console.log(`[Dashboard Sync] ${orderCount} available orders found in zone ${selectedZoneId}.`);

            if (data && data.length > 0 && !showOrderModal && !hasActiveOrder) {
                const enriched = await enrichOrderData(data[0]);
                if (enriched) {
                    setPendingOrder(enriched);
                    setShowOrderModal(true);
                }
            }
        } catch (err) {
            console.error('Refresh error:', err);
        } finally {
            setTimeout(() => setIsRefreshing(false), 600);
        }
    };

    // Auto-Refresh Available Orders every 10 seconds
    useEffect(() => {
        if (!isOnline || hasActiveOrder) return;

        const interval = setInterval(() => {
            handleManualRefresh();
        }, 10000); // 10 seconds

        return () => clearInterval(interval);
    }, [isOnline, hasActiveOrder, isRefreshing]);

    const handleVerifyOTP = async (otpValue: string) => {
        if (!activeOrder || !riderUuid) return;

        try {
            // Call the atomic complete_order RPC
            const { data, error } = await supabase.rpc('complete_order', { 
                p_order_id: activeOrder.id,
                p_rider_uuid: riderUuid,
                p_otp: otpValue,
                p_delivery_selfie_url: activeOrder.delivery_selfie_url || ""
            });

            if (error || !data.success) {
                console.error('Delivery completion failed:', error || data?.error);
                // The modal handles showing the error if we return false or trigger an alert
                alert(data?.error || "Invalid OTP. Please try again.");
                return;
            }

            console.log('Order Successfully Delivered!', data);
            setShowOTPModal(false);
            
            // Navigate to success screen with real earnings data
            navigate("/order-delivered", { 
                state: { 
                    earnings: data.earnings,
                    tip: data.tip,
                    totalEarned: data.totalEarned
                }
            });
            
            // Refresh parent state
            setHasActiveOrder(false);
            setActiveOrder(null);
            refreshProfile();
        } catch (err) {
            console.error('OTP Verification error:', err);
        }
    };

    const riderName = fullName || "";

    const navItems = [
        { id: "home", label: "Home", icon: homeIcon },
        { id: "earnings", label: "Earnings", icon: earningsIcon },
        { id: "notifications", label: "Notifications", icon: notificationsIcon },
    ];

    const handleToggleOnline = async () => {
        if (kycStatus !== "verified" || !riderUuid) return;
        
        const nextOnline = !isOnline;
        
        try {
            // Update Supabase immediately
            const { error } = await supabase
                .from('riders')
                .update({ is_online: nextOnline })
                .eq('id', riderUuid);

            if (error) throw error;

            // Update local state
            setIsOnline(nextOnline);
            localStorage.setItem("rider_is_online", nextOnline.toString());
            
            if (nextOnline && !hasBeenOnline) {
                setHasBeenOnline(true);
                localStorage.setItem("rider_has_been_online", "true");
            }
            
            console.log(`Presence updated to ${nextOnline ? 'online' : 'offline'}`);
        } catch (err) {
            console.error('Failed to update presence in Supabase:', err);
            // Optional: Show error toast here
        }
    };

    return (
        <div className="relative h-[100dvh] w-full bg-white font-satoshi overflow-hidden flex flex-col items-center">
            {/* Standardized Glowing Orb: Dynamic Color */}
            <div
                className="absolute top-[-20px] left-1/2 -translate-x-1/2 w-[166px] h-[40px] rounded-full pointer-events-none z-0 transition-colors duration-500"
                style={{
                    backgroundColor: kycStatus === "verified" ? "#5260FE" : "#FACC15",
                    filter: "blur(60px)",
                    opacity: 0.8,
                }}
            />

            {/* Header Container */}
            <div className={`flex-none flex items-center justify-between w-[362px] px-0 pt-12 pb-2 relative z-10`}>
                <h1 className="text-black text-[24px] font-bold leading-none">
                    Welcome, {riderName}!
                </h1>
                <div className="flex gap-2">
                    <button 
                        className="w-[34px] h-[34px] rounded-full bg-[#F5F5F5] flex items-center justify-center transition-transform active:scale-95"
                        onClick={() => setShowSafetyToolkit(true)}
                    >
                        <img src={safetyToolkitIcon} alt="Safety Toolkit" className="w-full h-full" />
                    </button>
                    <button 
                        className="w-[34px] h-[34px] rounded-full bg-[#F5F5F5] flex items-center justify-center transition-transform active:scale-95"
                        onClick={() => navigate('/account-settings')}
                    >
                        <img src={menuIcon} alt="Menu" className="w-full h-full" />
                    </button>
                </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 w-full overflow-y-auto no-scrollbar flex flex-col items-center pb-[120px]">
                {hasActiveOrder ? (
                    /* Active Order View */
                    <div className="w-[362px] rounded-[12px] border border-[#EDEDED] bg-white z-10 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.04)] mt-[10px] shrink-0 relative flex flex-col items-center">
                        {/* Status Header */}
                        <div className="flex items-center justify-between mt-[15px] px-[17px] w-full">
                            <span className="font-satoshi font-bold text-[16px] text-black">Active Order</span>
                            <div 
                                className={`w-[128px] h-[28px] rounded-full flex items-center justify-center ${orderStatus === 'picked_up' ? 'bg-[#34C759]' : 'bg-[#FFCC00]'}`}
                            >
                                <span className="font-satoshi font-medium text-[14px] text-black">
                                    {orderStatus === 'picked_up' ? 'Picked Up' : 'Pickup Pending'}
                                </span>
                            </div>
                        </div>

                        {/* Order Container */}
                        <div className="w-[333px] h-auto border border-[#E6E8EB] rounded-[14px] mt-[10px] mx-auto flex flex-col px-4 pt-4 pb-[14px] shrink-0">
                            <h3 className="font-satoshi font-bold text-[12px] text-black/50">
                                {orderStatus === 'picked_up' ? 'DELIVER TO' : 'PICKUP FROM'}
                            </h3>
                            <p className="mt-2 text-black font-satoshi font-medium text-[14px] leading-tight">
                                {orderStatus === 'picked_up' 
                                    ? activeOrder?.delivery_address || activeOrder?.delivery_location || "Delivery Location pending"
                                    : activeOrder?.pickup_name || activeOrder?.pickup_location || "Pickup Location pending"
                                }
                            </p>
                            {orderStatus !== 'picked_up' && activeOrder?.pickup_address && (
                                <p className="mt-1 text-black/60 font-satoshi font-medium text-[12px] leading-tight">
                                    {activeOrder.pickup_address}
                                </p>
                            )}
                            
                            <button 
                                onClick={handleOpenInMaps}
                                className="mt-4 w-full h-[42px] bg-black rounded-full flex items-center justify-center transition-transform active:scale-95"
                            >
                                <span className="text-white font-satoshi font-bold text-[14px]">Open in Maps</span>
                            </button>

                            <p className="mt-4 text-center font-satoshi font-medium text-[12px] text-black">
                                {orderStatus === 'picked_up' ? 'Arriving in 15 minutes' : 'Arriving in 3 minutes'}
                            </p>
                        </div>

                        {/* Order Details Section */}
                        <div className="w-full px-[17px] mt-[24px] flex flex-col">
                            <span className="text-black/50 text-[12px] font-bold font-satoshi tracking-wider">ORDER DETAILS</span>
                            
                            <div className="mt-4 flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-black/60 text-[14px] font-medium font-satoshi">Your Earning:</span>
                                    <span className="text-black text-[14px] font-bold font-satoshi">₹{activeOrder?.rider_earnings || 0}</span>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="mt-6 w-full h-[1px] bg-[#E6E8EB]" />
                        </div>

                        {/* Customer Details Section */}
                        <div className="w-full px-[17px] mt-6 flex flex-col">
                            <span className="text-black/50 text-[12px] font-bold font-satoshi tracking-wider">CUSTOMER DETAILS</span>
                            
                            <div className="mt-4 flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-black/60 text-[14px] font-medium font-satoshi">Customer Name:</span>
                                    <span className="text-black text-[14px] font-bold font-satoshi">{customerInfo?.name || "Loading..."}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-black/60 text-[14px] font-medium font-satoshi">Contact Number:</span>
                                    {customerInfo?.phone ? (
                                        <div className="flex gap-2 items-center">
                                            <span className="text-black text-[14px] font-bold font-satoshi">
                                                XXXXXX{customerInfo.phone.slice(-4)}
                                            </span>
                                            <a 
                                                href={`tel:${customerInfo.phone}`}
                                                className="text-[#5260FE] text-[12px] font-bold font-satoshi underline"
                                            >
                                                Call Now
                                            </a>
                                        </div>
                                    ) : (
                                        <span className="text-black text-[14px] font-bold font-satoshi">Not available</span>
                                    )}
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="mt-6 w-full h-[1px] bg-[#E6E8EB]" />
                        </div>

                        {/* CTAs */}
                        <div className="mt-8 px-[17px] w-full flex flex-col gap-2 mb-[25px]">
                            {orderStatus === 'picked_up' ? (
                                <>
                                    <button 
                                        className={`w-full h-[48px] rounded-full text-white font-satoshi font-medium text-[16px] transition-all
                                            ${isAtCustomer ? 'bg-[#5260FE] active:scale-95' : 'bg-[#5260FE]/50 cursor-not-allowed'}`}
                                        disabled={!isAtCustomer}
                                        onClick={() => {
                                            if (isAtCustomer) {
                                                setVerificationType('delivery');
                                                setIsVerified(false);
                                                setShowPickUpModal(true);
                                            }
                                        }}
                                    >
                                        Confirm Delivery
                                    </button>
                                    <button 
                                        className="w-full h-[48px] rounded-full bg-white border border-[#5260FE] text-[#5260FE] font-satoshi font-medium text-[16px] transition-transform active:scale-95"
                                        onClick={() => {
                                            if (customerInfo?.phone) {
                                                window.location.href = `tel:+91${customerInfo.phone}`;
                                            }
                                        }}
                                    >
                                        Call Customer
                                    </button>
                                </>
                            ) : (
                                <button 
                                    className={`w-full h-[48px] rounded-full text-white font-satoshi font-medium text-[16px] transition-all
                                        ${isAtHub ? 'bg-[#5260FE] active:scale-95 cursor-pointer' : 'bg-[#5260FE]/50 cursor-not-allowed'}`}
                                    onClick={() => setShowPickUpModal(true)}
                                    disabled={!isAtHub}
                                >
                                    Pick Up
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Status Container: Dynamic Content */}
                        <div 
                            className={`w-[362px] ${hasBeenOnline ? "min-h-[198px]" : "min-h-[140px]"} rounded-[12px] border border-[#EDEDED] bg-white p-4 z-10 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.04)] mt-[10px] shrink-0 transition-all duration-300 relative`}
                        >
                            {/* Top Row: Toggle + Earnings (if hasBeenOnline) */}
                            <div className="flex items-center justify-between">
                                {/* Toggle Switch */}
                                <div 
                                    className={`w-[84px] h-[28px] rounded-full flex items-center px-0.5 relative transition-all duration-300 ${
                                        kycStatus === "verified" ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                                    }`}
                                    style={{ backgroundColor: isOnline ? "#0C7E4B" : "rgba(120, 120, 120, 0.2)" }}
                                    onClick={handleToggleOnline}
                                >
                                    <div 
                                        className="w-[24px] h-[24px] rounded-full bg-white shadow-sm transition-transform duration-300" 
                                        style={{ transform: isOnline ? "translateX(56px)" : "translateX(0)" }}
                                    />
                                    <span 
                                        className="text-[14px] font-medium absolute transition-all duration-300"
                                        style={{ 
                                            color: isOnline ? "white" : "#000000",
                                            left: isOnline ? "12px" : "32px"
                                        }}
                                    >
                                        {isOnline ? "online" : "offline"}
                                    </span>
                                </div>

                                {hasBeenOnline && (
                                    <span className="text-black text-[18px] font-bold mr-[1px]">
                                        Today's earnings: ₹{earnings}
                                    </span>
                                )}
                            </div>

                            {!hasBeenOnline ? (
                                <>
                                    {/* Verification State Text */}
                                    <div className="mt-[13px]">
                                        <h2 className="text-[20px] font-bold text-black leading-[1.4]">
                                            {kycStatus === "verified" ? (
                                                <>Verification is completed! <br /> You can now go online, and start accepting orders.</>
                                            ) : kycStatus === "in_review" ? (
                                                <>Verification is in progress. <br /> You’ll be notified once your KYC is approved.</>
                                            ) : (
                                                <>KYC Verification Required. <br /> Please complete your KYC to start earning.</>
                                            )}
                                        </h2>
                                    </div>

                                    {kycStatus === "pending" && (
                                        <p 
                                            className="text-[14px] font-medium text-black mt-[7px]"
                                            style={{ lineHeight: "22px", letterSpacing: "-0.43px" }}
                                        >
                                            (Usually within 30 minutes)
                                        </p>
                                    )}
                                </>
                            ) : (
                                <div className="flex flex-col items-center">
                                    {/* Active Session Status Message: 82px from top */}
                                    <p className="absolute top-[82px] text-black text-[14px] font-medium opacity-50 text-center w-[300px]">
                                        {isOnline 
                                            ? "You’re online. New orders will appear here shortly."
                                            : "You’re offline, go online now to receive new orders."
                                        }
                                    </p>

                                    {/* Refresh CTA: 40px below message */}
                                    <button 
                                        disabled={!isOnline || isRefreshing}
                                        onClick={handleManualRefresh}
                                        className={`mt-[96px] w-[193px] h-[42px] rounded-full flex items-center justify-center transition-all duration-300 ${
                                            isOnline && !isRefreshing ? "bg-black cursor-pointer active:scale-95" : "bg-[#BDBDBD] cursor-not-allowed"
                                        }`}
                                    >
                                        <span className="text-white text-[14px] font-medium mr-[6px]">
                                            {isRefreshing ? "Refreshing..." : "Refresh"}
                                        </span>
                                        <img 
                                            src={refreshIcon} 
                                            alt="Refresh" 
                                            className={`w-[11px] h-[11px] ${isRefreshing ? "animate-spin" : ""}`} 
                                        />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Simulation Button: Receive Tip */}
                        <div className="w-[362px] mt-4 flex justify-end px-1">
                            <button 
                                onClick={() => {
                                    transactionService.addTransaction({
                                        type: 'Earnings',
                                        title: 'Delivery Tip Received',
                                        description: `Delivery for ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`,
                                        amount: '50',
                                        fee: 0,
                                        tds: 0,
                                        final_amount: 50,
                                        status: 'success',
                                        created_at: new Date().toISOString(),
                                        reference_id: `TIP-${Date.now()}`,
                                        rider_id: riderUuid || 'GRIDPE-RIDER'
                                    });
                                }}
                                className="text-[12px] font-medium text-[#5260FE] opacity-40 hover:opacity-100 transition-opacity"
                            >
                                [Simulate Receive Tip]
                            </button>
                        </div>

                        {/* Referral Banner: 20px below container */}
                        <div className="w-[362px] h-[104px] rounded-[16px] bg-black mt-5 shrink-0 overflow-hidden flex relative">
                            {/* Left Content */}
                            <div className="flex-1 pt-3.5 pl-3.5 flex flex-col">
                                <img src={giftIcon} alt="Gift" className="w-6 h-6 mb-1" />
                                <h3 className="text-white text-[16px] font-bold leading-tight mb-1">
                                    Refer & Earn!
                                </h3>
                                <p className="text-white text-[12px] font-normal leading-tight">
                                    Earn ₹500 on each referral
                                </p>
                            </div>
                            {/* Right Image */}
                            <div className="w-[188px] h-[104px] shrink-0">
                                <img src={referralImg} alt="Referral" className="w-full h-full object-cover" />
                            </div>
                        </div>

                        {/* Shifts Header: 32px below banner */}
                        <div className="w-[362px] mt-8 mb-3 shrink-0 px-1">
                            <h3 className="text-[15px] font-medium text-black">
                                My Shifts
                            </h3>
                        </div>

                        {/* Shifts Container: 12px below header */}
                        {hasBeenOnline ? (
                            <div className="w-[362px] rounded-[14px] border border-[#EDEDED] flex flex-col pt-[14px] pl-[14px] pr-[14px] pb-[16px] shrink-0 mb-8 z-10 bg-white">
                                <h4 className="text-[14px] font-bold text-black leading-none">
                                    Current Shift
                                </h4>
                                <p className="mt-[11px] text-[14px] font-medium text-black leading-none" style={{ letterSpacing: "-0.43px" }}>
                                    {(() => {
                                        const now = new Date();
                                        const hour = now.getHours();
                                        const startHour = hour;
                                        const endHour = (hour + 1) % 24;
                                        
                                        const formatHour = (h: number) => {
                                            const ampm = h >= 12 ? 'PM' : 'AM';
                                            const h12 = h % 12 || 12;
                                            return `${h12}:00 ${ampm}`;
                                        };
                                        
                                        return `${formatHour(startHour)} - ${formatHour(endHour)} (${selectedHubName || selectedZoneName || 'Primary'} Hub)`;
                                    })()}
                                </p>
                                
                                <div className="mt-[13px] w-full h-[1px] bg-[#E9E9E9]" />
                                
                                <p className="mt-[9px] text-[14px] font-medium italic text-black/50 leading-none" style={{ letterSpacing: "-0.43px" }}>
                                    Complete 3 consecutive days in this slot to unlock ₹200 streak bonus.
                                </p>
                                
                                <button 
                                    className="mt-[11px] text-[14px] font-medium text-[#5260FE] underline leading-none text-left" 
                                    style={{ letterSpacing: "-0.43px" }}
                                    onClick={() => navigate('/shifts')}
                                >
                                    View Shift Details
                                </button>
                                
                                <p className="mt-[18px] text-[12px] font-medium italic text-black/50 leading-[1.4]" style={{ letterSpacing: "-0.43px" }}>
                                    Grid.pe learns your shift patterns based on when you start working and when you go offline.
                                </p>
                            </div>
                        ) : (
                            <div className="w-[362px] h-[113px] rounded-[14px] border border-[#EDEDED] flex items-center justify-center p-6 shrink-0 mb-8 transition-all duration-300 bg-white">
                                <p className="text-black text-[14px] font-medium text-center opacity-50 px-2">
                                    {kycStatus === "verified"
                                        ? "Shifts will be visible once you start accepting orders."
                                        : "Your shifts will appear here once your account is verified and active."
                                    }
                                </p>
                            </div>
                        )}

                        {/* New Rider Bonus Banner: Only visible if verified and NEVER gone online */}
                        {kycStatus === "verified" && !hasBeenOnline && (
                            <div className="w-[362px] h-[110px] rounded-[16px] bg-black shrink-0 relative flex flex-col items-center mb-8">
                                {/* Badge: Half in, half out */}
                                <div className="absolute top-[-16px] left-1/2 -translate-x-1/2 w-[160px] h-[32px] rounded-full bg-[#5260FE] flex items-center justify-center z-10 shadow-sm">
                                    <span className="text-white text-[12px] font-bold">First Login Offer!</span>
                                </div>

                                {/* Banner Content */}
                                <h3 className="text-white text-[16px] font-bold mt-[31px] mb-1">
                                    New Rider!
                                </h3>
                                <p className="text-white text-[12px] font-normal text-center w-[266px] leading-[1.4]">
                                    Complete 5 deliveries today and earn a ₹1500 bonus in your wallet.
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Bottom Navigation Container: Glassmorphism effect */}
            <div 
                className="fixed bottom-0 w-full h-[105px] z-20 flex flex-col items-center"
                style={{
                    backgroundColor: "rgba(255, 255, 255, 0.7)",
                    backdropFilter: "blur(15px)",
                    WebkitBackdropFilter: "blur(15px)"
                }}
            >
                {/* Inner Nav Bar: 12px from the top */}
                <div className="mt-[12px] w-[279px] h-[62px] rounded-full bg-[#F2F2F2] flex items-center px-[4px] relative">
                    {/* Active Tab Background Pill: 96x54px */}
                    <div 
                        className="absolute h-[54px] w-[96px] rounded-full transition-all duration-300 ease-[cubic-bezier(0.25, 0.1, 0.25, 1)] z-0"
                        style={{ 
                            backgroundColor: "rgba(146, 146, 146, 0.26)",
                            left: activeTab === "home" ? "4px" : activeTab === "earnings" ? "91.5px" : "179px"
                        }}
                    />

                    {navItems.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                            <div 
                                key={item.id}
                                onClick={() => {
                                    if (item.id === "earnings") {
                                        navigate("/earnings");
                                    } else if (item.id === "notifications") {
                                        const hasSeenPrompt = localStorage.getItem("has_seen_notification_prompt") === "true";
                                        if (!hasSeenPrompt) {
                                            setShowNotificationSheet(true);
                                        } else {
                                            navigate("/notifications");
                                        }
                                    } else {
                                        setActiveTab(item.id);
                                    }
                                }}
                                className="relative flex flex-col items-center justify-center h-full cursor-pointer z-10 transition-colors duration-300"
                                style={{ width: "93px" }}
                            >
                                <img 
                                    src={item.icon} 
                                    alt={item.label} 
                                    className="w-6 h-6 transition-all duration-300"
                                    style={{ 
                                        filter: isActive ? "brightness(0)" : "none",
                                        opacity: isActive ? 1 : 1,
                                    }}
                                />
                                <span 
                                    className={`text-[10px] mt-[4px] transition-all duration-300 ${
                                        isActive ? "font-bold text-black" : "font-medium text-[#676767]"
                                    }`}
                                >
                                    {item.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Order Request Modal */}
            {showOrderModal && (
                <OrderModal 
                    order={pendingOrder}
                    onAccept={handleAcceptOrder}
                    onReject={() => {
                        setShowOrderModal(false);
                        setPendingOrder(null);
                    }}
                    onClose={() => {
                        setShowOrderModal(false);
                        setPendingOrder(null);
                    }}
                />
            )}
            {/* Pick Up/Delivery Verification Modal */}
            {showPickUpModal && (
                <PickUpVerificationModal 
                    isVerified={isVerified}
                    riderName={riderName}
                    verifiedCTA={verificationType === 'delivery' ? 'Enter Verification Code' : 'Pick Up'}
                    onStart={() => {
                        if (isVerified) {
                            if (verificationType === 'pickup') {
                                handlePickupOrder();
                            } else {
                                // For Testing: Sometimes trigger failure for delivery
                                const shouldFail = false; // Normal healthy flow
                                
                                if (shouldFail && verificationType === 'delivery') {
                                    if (retryCount >= 1) {
                                        setFallbackStatus('failure');
                                    } else {
                                        setFallbackStatus('mismatch');
                                    }
                                    setIsFallbackOpen(true);
                                    console.log(`Simulating delivery verification failure (Try ${retryCount + 1})`);
                                } else {
                                    setShowPickUpModal(false);
                                    setShowOTPModal(true);
                                    console.log("Delivery Verification: Face matched, opening OTP modal");
                                }
                            }
                        } else {
                            setShowPickUpModal(false);
                            setShowFaceVerification(true);
                        }
                    }}
                    onClose={() => setShowPickUpModal(false)}
                />
            )}
            {/* Delivery OTP Modal */}
            {showOTPModal && (
                <DeliveryOTPModal 
                    onClose={() => setShowOTPModal(false)}
                    onVerify={handleVerifyOTP}
                />
            )}

            {/* Face Verification Screen */}
            {showFaceVerification && (
                <FaceVerification 
                    mode={faceVerificationMode}
                    onCapture={async (image) => {
                        if (!activeOrder) return;
                        
                        setIsVerifying(true);
                        console.log("Processing face scan...");
                        
                        try {
                            // 1. Upload to Supabase Storage
                            const path = `${activeOrder.id}_${verificationType}_${Date.now()}.jpg`;
                            const selfieUrl = await storageService.uploadBase64Image(image, 'rider-selfies', path);
                            console.log("Selfie uploaded:", selfieUrl);

                            // 2. Perform Safety Check (Simulated Match)
                            // In a real app, this would be an RPC call to AWS Rekognition or similar
                            const isMatch = Math.random() > 0.05; // 95% success simulation
                            
                            if (!isMatch) {
                                setSecurityAlert({
                                    show: true,
                                    message: "Face scan does not match your original KYC profile. Access denied."
                                });
                                setIsVerifying(false);
                                return;
                            }

                            // 3. Handle successful verification
                            if (verificationType === 'pickup') {
                                await handlePickupOrder(selfieUrl);
                                setShowFaceVerification(false);
                            } else {
                                // Delivery: Update local state and show OTP
                                setActiveOrder((prev: any) => ({ ...prev, delivery_selfie_url: selfieUrl }));
                                setIsVerified(true);
                                setShowFaceVerification(false);
                                setShowOTPModal(true);
                                console.log("Face matched for delivery, opening OTP modal");
                            }
                        } catch (err) {
                            console.error("Security flow failed:", err);
                        } finally {
                            setIsVerifying(false);
                            setFaceVerificationMode('photo');
                        }
                    }}
                    onVideoCapture={(videoUrl) => {
                        console.log("Captured video:", videoUrl);
                        setShowFaceVerification(false);
                        setFaceVerificationMode('photo');
                        navigate('/video-verification', { state: { videoUrl } });
                    }}
                    onClose={() => {
                        setShowFaceVerification(false);
                        setFaceVerificationMode('photo');
                    }}
                />
            )}

            {/* Notification Bottom Sheet */}
            {showNotificationSheet && (
                <NotificationBottomSheet 
                    onClose={() => setShowNotificationSheet(false)}
                    onEnable={() => {
                        localStorage.setItem("has_seen_notification_prompt", "true");
                        localStorage.setItem("push_notifications_enabled", "true");
                        setShowNotificationSheet(false);
                        navigate("/notifications");
                        console.log("Push notifications enabled!");
                    }}
                    onDecline={() => {
                        localStorage.setItem("has_seen_notification_prompt", "true");
                        localStorage.setItem("push_notifications_enabled", "false");
                        setShowNotificationSheet(false);
                        navigate("/notifications");
                        console.log("Push notifications declined.");
                    }}
                />
            )}

            {/* Delivery Tip Bottom Sheet (Auto-show) */}
            <TransactionDetailBottomSheet 
                isOpen={showTipBottomSheet}
                onClose={() => setShowTipBottomSheet(false)}
                transaction={newTipTransaction}
            />

            {/* Security Alert Modal */}
            {securityAlert.show && (
                <SecurityAlert 
                    message={securityAlert.message}
                    onClose={() => setSecurityAlert({ show: false, message: "" })}
                />
            )}

            {/* Verifying Overlay */}
            {isVerifying && (
                <div className="fixed inset-0 z-[250] bg-black/80 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 border-4 border-[#5260FE] border-t-transparent rounded-full animate-spin mb-6" />
                    <p className="text-white font-satoshi font-bold text-[20px]">Verifying Face...</p>
                    <p className="text-white/60 font-satoshi text-[14px] mt-2">Checking match with KYC profile</p>
                </div>
            )}

            {/* Safety Toolkit Bottom Sheet */}
            <SafetyToolkitBottomSheet 
                isOpen={showSafetyToolkit}
                onClose={() => setShowSafetyToolkit(false)}
                onEmergencyClick={() => setShowEmergencyAssistance(true)}
                onShareTripClick={() => setShowShareTrip(true)}
                onHotlineClick={() => setShowHotline(true)}
                locationName={locationName}
            />

            {/* Emergency Assistance Bottom Sheet */}
            <EmergencyAssistanceBottomSheet 
                isOpen={showEmergencyAssistance}
                onBack={() => {
                    setShowEmergencyAssistance(false);
                    setShowSafetyToolkit(true);
                }}
                onClose={() => setShowEmergencyAssistance(false)}
                locationName={locationName}
            />

            {/* Share My Trip Bottom Sheet */}
            <ShareTripBottomSheet
                isOpen={showShareTrip}
                onBack={() => {
                    setShowShareTrip(false);
                    setShowSafetyToolkit(true);
                }}
                onClose={() => setShowShareTrip(false)}
            />

            {/* Safety Hotline Bottom Sheet */}
            <HotlineBottomSheet
                isOpen={showHotline}
                onBack={() => {
                    setShowHotline(false);
                    setShowSafetyToolkit(true);
                }}
                onClose={() => setShowHotline(false)}
            />
            {/* Delivery Fallback Popups */}
            <DeliveryFallbackPopups 
                isOpen={isFallbackOpen}
                onClose={() => setIsFallbackOpen(false)}
                status={fallbackStatus}
                onNotifyCustomer={async () => {
                    setFallbackStatus('waiting');
                    console.log("Notifying customer of identity mismatch...");
                    // Next step: Implement real Supabase update here
                }}
                onRetry={() => {
                    setIsFallbackOpen(false);
                    setRetryCount(prev => prev + 1);
                    setShowFaceVerification(true);
                }}
                onContactSupport={() => {
                    console.log("Redirecting to support via call...");
                    window.location.href = 'tel:+919876543210'; // Mock support number
                }}
                onOverrideRequest={() => {
                    setFallbackStatus('request_approval');
                }}
                onRequestApproval={async () => {
                    setFallbackStatus('waiting');
                    console.log("Requesting customer approval (Simulated)...");
                }}
                onRecordVideo={() => {
                    setIsFallbackOpen(false);
                    setFaceVerificationMode('video');
                    setShowFaceVerification(true);
                    console.log("Starting selfie video recording...");
                }}
                onEnterVerificationCode={() => {
                    setIsFallbackOpen(false);
                    setShowOTPModal(true);
                    console.log("Opening OTP modal for final delivery confirmation...");
                }}
            />
        </div>
    );
};

export default Home;
