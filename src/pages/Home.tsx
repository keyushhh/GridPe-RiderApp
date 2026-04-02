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
import OrderCancelledModal from "../components/OrderCancelledModal";
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
import GlowingOrb from "../components/GlowingOrb";
import { Order } from "../types/database";

const Home = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState("home");
    const { 
        kycStatus, fullName, riderUuid, riderId, totalEarnings, 
        isOnline, setIsOnline, refreshProfile, selectedZoneId, 
        selectedHubName, selectedZoneName, workCity, selectedCity,
        isOnboarded, setIsOnboarded
    } = useAuth();
    const [hasBeenOnline, setHasBeenOnline] = useState(
        localStorage.getItem("rider_has_been_online") === "true"
    );
    
    // Fallback if totalEarnings is not yet synced
    const earnings = totalEarnings || Number(localStorage.getItem("rider_earnings")) || 0;

    const [showOrderModal, setShowOrderModal] = useState(false);
    const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
    const [activeOrder, setActiveOrder] = useState<Order | null>(null);
    const [customerName, setCustomerName] = useState<string>("");
    const [customerPhone, setCustomerPhone] = useState<string>("");
    const [hasActiveOrder, setHasActiveOrder] = useState(false);
    const [showCancelledModal, setShowCancelledModal] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [activeShiftId, setActiveShiftId] = useState<string | null>(null);
    const [isToggling, setIsToggling] = useState(false);
    const [securityAlert, setSecurityAlert] = useState<{show: boolean, message: string}>({show: false, message: ""});
    const [verifiedUuid, setVerifiedUuid] = useState<string | null>(riderUuid);
    const [verifiedHubId, setVerifiedHubId] = useState<string | null>(null);
    const onboardUpdateAttempted = useRef(false);
    const [verifiedZoneId, setVerifiedZoneId] = useState<string | null>(selectedZoneId);
    const [riderCity, setRiderCity] = useState<string | null>(workCity || selectedCity);
    const [deliveryAddress, setDeliveryAddress] = useState<string>("Fetching address...");
    const [mapsUrl, setMapsUrl] = useState<string>("");

    const [showPickUpModal, setShowPickUpModal] = useState(false);
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [showFaceVerification, setShowFaceVerification] = useState(false);
    const [faceVerificationMode, setFaceVerificationMode] = useState<'photo' | 'video'>('photo');
    const [isVerified, setIsVerified] = useState(false);
    const [orderStatus, setOrderStatus] = useState<'pickup_pending' | 'picked_up'>('pickup_pending');
    const [verificationType, setVerificationType] = useState<'pickup' | 'delivery'>('pickup');
    
    // UI Feedback and Bottom Sheets
    const [showNotificationSheet, setShowNotificationSheet] = useState(false);
    const [showSafetyToolkit, setShowSafetyToolkit] = useState(false);
    const [showEmergencyAssistance, setShowEmergencyAssistance] = useState(false);
    const [showShareTrip, setShowShareTrip] = useState(false);
    const [showHotline, setShowHotline] = useState(false);
    const [locationName, setLocationName] = useState("Detecting location...");
    const [showTipBottomSheet, setShowTipBottomSheet] = useState(false);
    const [newTipTransaction, setNewTipTransaction] = useState<Transaction | null>(null);
    const [isFallbackOpen, setIsFallbackOpen] = useState(false);
    const [fallbackStatus, setFallbackStatus] = useState<'none' | 'mismatch' | 'waiting' | 'in_progress' | 'failure' | 'request_approval' | 'approved' | 'complete'>('none');
    const [retryCount, setRetryCount] = useState(0);

    const [isAtHub, setIsAtHub] = useState(false);
    const [isAtCustomer, setIsAtCustomer] = useState(false);

    // Tracking references
    const lastLocationRef = useRef<{lat: number, lng: number} | null>(null);
    const lastUpdateTimeRef = useRef<number>(0);
    const watchIdRef = useRef<number | null>(null);

    // Removed redundant rider profile verification useEffect as it's handled by useAuth

    // Shift Sync: Check for active shifts on app start
    useEffect(() => {
        const syncActiveShift = async () => {
            if (!riderUuid) return;
            
            try {
                console.log('Syncing active shift for rider:', riderUuid);
                const { data, error } = await supabase
                    .from('rider_shifts')
                    .select('id, is_active')
                    .eq('rider_id', riderUuid)
                    .eq('is_active', true)
                    .maybeSingle();
                
                if (data) {
                    console.log('Found active shift in DB:', data.id);
                    setActiveShiftId(data.id);
                    // Ensure local state matches DB
                    if (!isOnline) {
                        setIsOnline(true);
                        localStorage.setItem('rider_is_online', 'true');
                    }
                } else {
                    console.log('No active shift found in DB.');
                    // If no active shift in DB but local is online, sync to offline
                    if (isOnline) {
                        setIsOnline(false);
                        localStorage.setItem('rider_is_online', 'false');
                    }
                }
            } catch (err) {
                console.error('Error syncing active shift:', err);
            }
        };
        
        syncActiveShift();
    }, [riderUuid]);

    // Track KYC Status via Realtime & On Mount
    useEffect(() => {
        if (!verifiedUuid) return;

        // 1. Always fetch on load to ensure we have the latest status
        refreshProfile();

        // 2. Listen to real-time changes
        const channel = supabase.channel(`kyc_watch_${verifiedUuid}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'riders',
                    filter: `id=eq.${verifiedUuid}`
                },
                (payload) => {
                    console.log('[Home] KYC Status updated in DB:', payload.new.kyc_status);
                    if (payload.new.kyc_status === 'verified') {
                        // Immediately refresh local context to update the UI
                        refreshProfile();
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [verifiedUuid]);

    // Track First-Time Dashboard Access
    useEffect(() => {
        if (!verifiedUuid) return;
        
        if (isOnboarded === false && !onboardUpdateAttempted.current) {
            onboardUpdateAttempted.current = true; // Set immediately to prevent re-entry
            console.log('[Home] First time reaching dashboard, attempting to update is_onboarded to true.');
            
            supabase.from('riders').update({ is_onboarded: true }).eq('id', verifiedUuid).then(({ error }) => {
                if (error) {
                    // Log gracefully without crashing. PGRST204 means no data returned or column sync issue.
                    console.warn('[Home] Note: is_onboarded update failed (likely syncing). Rider session will proceed unblocked.', error);
                    // Force the local state to true so they don't get trapped in a redirect loop on this session
                    setIsOnboarded(true);
                } else {
                    console.log('[Home] is_onboarded successfully updated.');
                    setIsOnboarded(true);
                }
            });
        }
    }, [verifiedUuid, isOnboarded, setIsOnboarded]);

    // Handle Order Cancelled by Customer
    const handleOrderCancelled = () => {
        console.log('ALERT: Order has been cancelled by the customer!');
        
        // 1. Close all active modal flows
        setShowPickUpModal(false);
        setShowOTPModal(false);
        setShowFaceVerification(false);
        setIsFallbackOpen(false);
        
        // 2. Show cancellation modal
        setShowCancelledModal(true);
        
        // 3. Auto-dismiss after 4 seconds and reset home
        setTimeout(() => {
            setShowCancelledModal(false);
            setActiveOrder(null);
            setHasActiveOrder(false);
            setOrderStatus('pickup_pending');
            localStorage.removeItem('activeOrderId'); // Clear on cancel
            refreshProfile(); // Sync earnings/status
            console.log('Modal dismissed, returning home.');
        }, 4000);
    };

    // Debug Log: Monitor Active Order State Changes
    useEffect(() => {
        console.log('[ACTIVE ORDER CHANGED]', activeOrder?.id, activeOrder?.status);
        if (activeOrder?.id) {
            localStorage.setItem('activeOrderId', activeOrder.id);
        }
    }, [activeOrder]);

    // 1. General Order Management (New Orders & Status Transitions)
    useEffect(() => {
        if (!verifiedUuid || !riderCity) {
            console.log('Real-time: Missing verified data, waiting...');
            return;
        }
        if (!isOnline) {
            console.log('Real-time: Rider is Offline, skipping subscription');
            return;
        }

        const channel = supabase.channel('rider-general-updates');

        // New pending orders in the CITY (not just hub)
        channel.on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'orders',
                filter: `city=eq.${riderCity}`
            },
            (payload) => {
                console.log('[Real-time] New order in city:', payload.new.id);
                if (payload.new.status === 'pending' && !hasActiveOrder) {
                    enrichOrderData(payload.new).then(enriched => {
                        if (enriched) {
                            setPendingOrder(enriched);
                            setShowOrderModal(true);
                        }
                    });
                }
            }
        );

        // Status updates for orders assigned to this rider
        channel.on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'orders',
                filter: `rider_id=eq.${verifiedUuid}`
            },
            async (payload) => {
                const newStatus = payload.new.status;
                if (newStatus === 'picked_up') {
                    setOrderStatus('picked_up');
                } else if (newStatus === 'delivered') {
                    setHasActiveOrder(false);
                    setActiveOrder(null);
                    localStorage.removeItem('activeOrderId');
                    navigate("/order-delivered");
                }
            }
        ).subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [verifiedUuid, verifiedHubId, isOnline, hasActiveOrder]);

    // 2. Dedicated Order Cancellation Listener
    useEffect(() => {
        const orderId = activeOrder?.id || localStorage.getItem('activeOrderId');
        
        console.log('[CANCEL EFFECT RUNNING] orderId:', orderId);
        
        if (!orderId) {
            console.log('[CANCEL EFFECT] No active order ID, skipping subscription');
            return;
        }

        const channelName = `cancel-watch-${orderId}-${Date.now()}`;
        const channel = supabase.channel(channelName);

        channel.on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'orders',
                filter: `id=eq.${orderId}`
            },
            (payload) => {
                console.log('[REALTIME] Received status update:', payload.new.status);
                if (payload.new.status === 'cancelled') {
                    handleOrderCancelled();
                }
            }
        ).subscribe((status) => {
            console.log(`[REALTIME] Subscription status for ${orderId}:`, status);
            if (status === 'SUBSCRIBED') {
                const checkStatus = async () => {
                    const { data } = await supabase.from('orders').select('status').eq('id', orderId).maybeSingle();
                    if (data?.status === 'cancelled') handleOrderCancelled();
                };
                checkStatus();
            }
        });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [activeOrder?.id]);

    // Debug trigger for testing the cancellation modal
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('test_cancel') === 'true') {
            const isPersistent = params.get('persist') === 'true';
            console.log(`DEBUG: Triggering cancellation modal (Persistent: ${isPersistent})...`);
            setShowCancelledModal(true);
            
            if (!isPersistent) {
                setTimeout(() => {
                    const newUrl = window.location.pathname;
                    window.history.replaceState({}, '', newUrl);
                    setShowCancelledModal(false);
                }, 4000);
            }
        }
    }, []);

    // Finalizing order data enrichment logic...
    
    // Helper to enrich order data (Hub Details + Delivery Details + Financials)
    const enrichOrderData = async (order: any) => {
        if (!order) return null;
        
        let enriched = { ...order };
        
        // 0. Financials & Distance (Priority mapping)
        // Ensure rider_earnings is prioritized and read from the correct field as a number
        const baseEarnings = Number(order.rider_earnings || order.rider_commission || order.amount || 0);
        enriched.rider_earnings = baseEarnings;
        enriched.delivery_tip = Number(order.delivery_tip || 0);
        enriched.total_potential = enriched.rider_earnings + enriched.delivery_tip;
        enriched.distance = Number(order.distance_km || order.distance || 2.1);
        
        // 1. Pickup Details (Multi-level Hub Fallback)
        if (!order.pickup_location) {
            let hubId = order.hub_id;
            
            // If order.hub_id is missing, fallback to rider's own hub_id
            if (!hubId && riderId) {
                try {
                    const { data: rider } = await supabase
                        .from('riders')
                        .select('hub_id')
                        .eq('rider_id', riderId)
                        .single();
                    if (rider) hubId = rider.hub_id;
                } catch (err) {
                    console.error('Error fetching rider hub fallback:', err);
                }
            }

            if (hubId) {
                try {
                    const { data: hub } = await supabase
                        .from('hubs')
                        .select('location_name, city')
                        .eq('id', hubId)
                        .single();
                    
                    if (hub) {
                        enriched.pickup_location = `${hub.location_name}, ${hub.city}`;
                    } else {
                        enriched.pickup_location = 'Contact support for pickup location';
                    }
                } catch (err) {
                    console.error('Error fetching hub for pickup fallback:', err);
                    enriched.pickup_location = 'Contact support for pickup location';
                }
            } else {
                enriched.pickup_location = 'Contact support for pickup location';
            }
        }
        
        // Ensure pickup_name is updated for display logic
        enriched.pickup_name = enriched.pickup_location || "Pick Up Hub";

        // 2. Customer Info (Join not used here, handled via status-based useEffect)
        
        // 3. Delivery Details
        enriched.delivery_address = order.delivery_address_text || order.meta_data?.delivery_address || "Address not available";
        
        return enriched;
    };

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
            const textId = localStorage.getItem('rider_id') || riderId;
            if (!textId) return;
            
            try {
                // If it's already a real UUID (non-zero), we can use it directly
                let resolvedUuid = (riderUuid && !riderUuid.startsWith('00000000')) ? riderUuid : null;

                if (!resolvedUuid && textId.includes('GRIDPE-RDR')) {
                    console.log(`Resolving UUID for text rider_id: ${textId}...`);
                    const { data: riderData } = await supabase
                        .from('riders')
                        .select('id')
                        .eq('rider_id', textId)
                        .maybeSingle();
                    resolvedUuid = riderData?.id || null;
                }

                if (resolvedUuid) {
                    const { data, error } = await supabase
                        .from('orders')
                        .select(`
                            id, user_id, address_id, status, rider_earnings, delivery_tip,
                            delivery_fee, pickup_location, delivery_address_text,
                            customer_phone_number, otp_code, delivery_location,
                            created_at, accepted_at, picked_up_at, city, zone_id,
                            hub_id, meta_data
                        `)
                        .eq('rider_id', resolvedUuid)
                        .in('status', ['accepted', 'assigned', 'picked_up', 'on_the_way'])
                        .maybeSingle();
                    
                    if (data) {
                        console.log('Found existing active order on load:', data);
                        const enriched = await enrichOrderData(data);
                        if (enriched) {
                            setActiveOrder(enriched);
                            localStorage.setItem('activeOrderId', enriched.id);
                            setHasActiveOrder(true);
                            setOrderStatus(enriched.status === 'picked_up' || enriched.status === 'on_the_way' ? 'picked_up' : 'pickup_pending');
                        }
                    } else {
                        const { data: lastOrder } = await supabase
                            .from('orders')
                            .select('id, status, created_at')
                            .eq('rider_id', resolvedUuid)
                            .order('created_at', { ascending: false })
                            .limit(1)
                            .maybeSingle();
                        
                        console.log('No active order found. Last order status:', lastOrder?.status || 'None found', 'Order ID:', lastOrder?.id || 'N/A');
                    }
                }
            } catch (err) {
                console.error('Initial active order fetch error:', err);
            }
        };

        fetchInitialActiveOrder();
    }, [riderId, riderUuid]);

    // Unified Fetch for Customer Details and Delivery Address when 'picked_up'
    useEffect(() => {
        if (!activeOrder?.user_id || activeOrder.status !== 'picked_up') {
            setCustomerName("");
            setCustomerPhone("");
            setDeliveryAddress("Fetching address...");
            setMapsUrl("");
            return;
        }

        const fetchDetails = async () => {
            try {
                // 1. Fetch customer name and phone
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('name, phone')
                    .eq('id', activeOrder.user_id)
                    .single();
                
                if (profile) {
                    setCustomerName(profile.name || 'Customer');
                    setCustomerPhone(activeOrder.customer_phone_number || profile.phone || 'Not available');
                }
                
                // 2. Fetch delivery address (with guard)
                let resolvedAddress = 'Address not available';

                if (!activeOrder?.address_id) {
                    console.log('No address_id in order, using fallback');
                    resolvedAddress = activeOrder?.delivery_address_text 
                        || activeOrder?.meta_data?.delivery_address 
                        || 'Address not available';
                } else {
                    const { data: address } = await supabase
                        .from('user_addresses')
                        .select('address_name, address_line_1, full_address')
                        .eq('id', activeOrder.address_id)
                        .single();
                    
                    resolvedAddress = address?.full_address
                        || address?.address_line_1
                        || activeOrder?.delivery_address_text
                        || activeOrder?.meta_data?.delivery_address
                        || 'Address not available';
                }
                
                setDeliveryAddress(resolvedAddress);
                
                // 3. Update Open in Maps query
                setMapsUrl(
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(resolvedAddress)}`
                );
                
                console.log('[Details Fetch] Customer and Address resolved:', {
                    customer: profile?.name,
                    address: resolvedAddress
                });
            } catch (err) {
                console.error('Error fetching details:', err);
                setCustomerName("Customer");
                setCustomerPhone(activeOrder?.customer_phone_number || "Not available");
                setDeliveryAddress(activeOrder?.delivery_address_text || "Address not available");
            }
        };

        fetchDetails();
    }, [activeOrder?.user_id, activeOrder?.status, activeOrder?.address_id]);

    // Location Heartbeat & Watcher
    useEffect(() => {
        if (isOnline && riderUuid) {
            
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
        if (orderStatus !== 'picked_up') {
            // Pickup phase: Use pickup_location text directly
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeOrder?.pickup_location || "Pick Up Hub")}`;
            window.open(mapsUrl, '_blank');
            return;
        }

        // Delivery phase: Use accurately resolved deliveryAddress state
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(deliveryAddress)}`;
        window.open(mapsUrl, '_blank');
    };

    const handleAcceptOrder = async (orderId: string) => {
        if (!riderUuid || !fullName) return;
        
        try {
            // Using Edge Function instead of RPC for better logging and security
            const { data, error } = await supabase.functions.invoke('accept-order', {
                body: { riderId: riderId, orderId: orderId }
            });

            if (error) {
                console.error('Failed to accept order:', error);
                return;
            }

            console.log('Order accepted successfully:', data);
            
            // CRITICAL: Update activeOrder state with full details immediately (Bug 1 Fix)
            if (data.order) {
                const enriched = await enrichOrderData(data.order);
                if (enriched) {
                    setActiveOrder(enriched);
                    localStorage.setItem('activeOrderId', enriched.id);
                    setHasActiveOrder(true);
                    setOrderStatus('pickup_pending');
                    console.log('FULL ACTIVE ORDER DATA SET:', JSON.stringify(enriched, null, 2));
                }
            } else {
                // Fallback if order object is somehow missing
                setHasActiveOrder(true);
                handleManualRefresh();
            }

            setShowOrderModal(false);
        } catch (err) {
            console.error('Accept order error:', err);
        }
    };

    const handlePickupOrder = async (selfieUrl?: string) => {
        if (!activeOrder || !riderId) return;

        try {
            console.log('PICKUP ORDER REQUEST:', {
                riderId: riderId,
                orderId: activeOrder?.id,
                selfieUrl: selfieUrl ? 'base64_data_present' : 'missing'
            });

            // selfieUrl is passed from PickUpVerificationModal (base64)
            const { data, error } = await supabase.functions.invoke('pickup-order', {
                body: { 
                    riderId: riderId, 
                    orderId: activeOrder.id,
                    selfieUrl: selfieUrl
                }
            });

            if (error) throw error;

            console.log('Order marked as picked up:', data);
            setShowPickUpModal(false);
            setOrderStatus('picked_up');
            
            // Sync with local state
            setActiveOrder((prev) => prev ? ({ ...prev, status: 'picked_up' as any, pickup_selfie_url: data.selfieUrl }) : null);
        } catch (err) {
            console.error('Pickup error:', err);
        }
    };

    const handleManualRefresh = async () => {
        if (!isOnline || isRefreshing) return;
        
        setIsRefreshing(true);
        
        try {
            // Fetch available orders FILTERED BY CITY
            if (!riderCity) {
                console.log('Refresh: No riderCity, skipping fetch');
                return;
            }

            let query = supabase.from('available_orders').select('*', { count: 'exact' });
            
            query = query.eq('city', riderCity);

            query = query.is('rider_id', null).eq('status', 'pending');

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
            localStorage.removeItem('activeOrderId');
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
        if (kycStatus !== "verified" || !riderUuid || isToggling) return;
        
        const nextOnline = !isOnline;
        setIsToggling(true);
        
        try {
            if (nextOnline) {
                // 1. Shift Start: Insert new row into rider_shifts
                const { data: newShift, error: shiftError } = await supabase
                    .from('rider_shifts')
                    .insert({
                        rider_id: riderUuid,
                        is_active: true,
                        hub_name: selectedHubName || selectedZoneName || 'Primary'
                    })
                    .select('id')
                    .single();

                if (shiftError) throw shiftError;
                
                setActiveShiftId(newShift.id);
                console.log('New shift started:', newShift.id);

                // 2. Log Interaction for Learning Layer
                const currentHour = new Date().getHours();
                const hubName = selectedHubName || selectedZoneName || 'Primary';
                
                await supabase.from('rider_interactions').insert({
                    rider_id: riderUuid,
                    interaction_type: 'completed',
                    time_slot_start: currentHour,
                    hub_name: hubName
                });

                // 3. Update riders table presence
                const { error: riderUpdateError } = await supabase
                    .from('riders')
                    .update({ is_online: true })
                    .eq('id', riderUuid);
                
                if (riderUpdateError) throw riderUpdateError;

            } else {
                // 1. Shift End: Update existing shift row
                if (activeShiftId) {
                    // Fetch shift details for duration calculation
                    const { data: shiftData, error: fetchError } = await supabase
                        .from('rider_shifts')
                        .select('started_at')
                        .eq('id', activeShiftId)
                        .single();
                        
                    if (fetchError) throw fetchError;
                    
                    const startedAt = new Date(shiftData.started_at);
                    const endedAt = new Date();
                    const durationInMinutes = Math.round((endedAt.getTime() - startedAt.getTime()) / (1000 * 60));

                    console.log(`Ending shift ${activeShiftId}. Duration: ${durationInMinutes} mins.`);

                    const { error: updateShiftError } = await supabase
                        .from('rider_shifts')
                        .update({
                            ended_at: endedAt.toISOString(),
                            is_active: false,
                            duration_minutes: durationInMinutes
                        })
                        .eq('id', activeShiftId);

                    if (updateShiftError) throw updateShiftError;
                    
                    setActiveShiftId(null);
                }
                
                // 2. Update riders table presence
                const { error: riderUpdateError } = await supabase
                    .from('riders')
                    .update({ is_online: false })
                    .eq('id', riderUuid);
                
                if (riderUpdateError) throw riderUpdateError;
            }

            // Update local state and persistence
            setIsOnline(nextOnline);
            localStorage.setItem("rider_is_online", nextOnline.toString());
            
            if (nextOnline && !hasBeenOnline) {
                setHasBeenOnline(true);
                localStorage.setItem("rider_has_been_online", "true");
            }
            
            console.log(`Presence and Shift updated to ${nextOnline ? 'online' : 'offline'}`);
        } catch (err) {
            console.error('Failed to toggle shift status:', err);
            alert("Connection error: Failed to update status. Please try again.");
        } finally {
            setIsToggling(false);
        }
    };

    return (
        <div className="relative h-[100dvh] w-full bg-white font-satoshi overflow-hidden flex flex-col items-center">
            <GlowingOrb color={(kycStatus === "in_review" || kycStatus === "pending") ? "#FFC107" : "#5260FE"} />

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
                                    ? deliveryAddress
                                    : activeOrder?.pickup_location || activeOrder?.pickup_name || "Fetching location..."
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

                        <div className="w-full px-[17px] mt-[24px] flex flex-col">
                            <span className="text-black/50 text-[12px] font-bold font-satoshi tracking-wider">ORDER DETAILS</span>
                            
                            <div className="mt-4 flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-black/60 text-[14px] font-medium font-satoshi">Your Earning:</span>
                                    <span className="text-black text-[14px] font-bold font-satoshi">₹{Number(activeOrder?.rider_earnings) || 0}</span>
                                </div>
                                {activeOrder?.delivery_tip && activeOrder.delivery_tip > 0 && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-black/60 text-[14px] font-medium font-satoshi">Delivery Tip:</span>
                                        <span className="text-black text-[14px] font-bold font-satoshi">₹{activeOrder.delivery_tip}</span>
                                    </div>
                                )}
                            </div>

                            {/* Divider */}
                            <div className="mt-6 w-full h-[1px] bg-[#E6E8EB]" />
                        </div>

                        <div className="w-full px-[17px] mt-6 flex flex-col">
                            <span className="text-black/50 text-[12px] font-bold font-satoshi tracking-wider">CUSTOMER DETAILS</span>
                            
                            <div className="mt-4 flex flex-col gap-2">
                                {orderStatus === 'picked_up' ? (
                                    <>
                                        <div className="flex justify-between items-center">
                                            <span className="text-black/60 text-[14px] font-medium font-satoshi">Customer Name:</span>
                                            <span className="text-black text-[14px] font-bold font-satoshi">{customerName || "Loading..."}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-black/60 text-[14px] font-medium font-satoshi">Contact Number:</span>
                                            {customerPhone ? (
                                                <div className="flex gap-2 items-center">
                                                    <span className="text-black text-[14px] font-bold font-satoshi">
                                                        XXXXXX{customerPhone.slice(-4)}
                                                    </span>
                                                    <a 
                                                        href={`tel:${customerPhone}`}
                                                        className="text-[#5260FE] text-[12px] font-bold font-satoshi underline"
                                                    >
                                                        Call Now
                                                    </a>
                                                </div>
                                            ) : (
                                                <span className="text-black text-[14px] font-bold font-satoshi">Not available</span>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-black/40 text-[14px] font-medium font-satoshi">
                                        Customer details available after pickup
                                    </p>
                                )}
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
                                            if (customerPhone) {
                                                window.location.href = `tel:${customerPhone}`;
                                            }
                                        }}
                                    >
                                        Call Customer
                                    </button>
                                </>
                            ) : (
                                <button 
                                    className={`w-full h-[48px] rounded-full text-white font-satoshi font-medium text-[16px] transition-all
                                        ${activeOrder?.id ? 'bg-[#5260FE] active:scale-95 cursor-pointer' : 'bg-[#5260FE]/50 cursor-not-allowed'}`}
                                    onClick={() => setShowPickUpModal(true)}
                                    disabled={!activeOrder?.id}
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
                                    onClick={kycStatus === "verified" ? handleToggleOnline : undefined}
                                >
                                    <div 
                                        className="w-[24px] h-[24px] rounded-full bg-white shadow-sm transition-transform duration-300 flex items-center justify-center overflow-hidden" 
                                        style={{ transform: isOnline ? "translateX(56px)" : "translateX(0)" }}
                                    >
                                        {isToggling && (
                                            <div className="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                        )}
                                    </div>
                                    <span 
                                        className="text-[14px] font-medium absolute transition-all duration-300"
                                        style={{ 
                                            color: isOnline ? "white" : "#000000",
                                            left: isOnline ? "12px" : "32px",
                                            opacity: isToggling ? 0.3 : 1
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
                                            ) : kycStatus === "in_review" || kycStatus === "pending" ? (
                                                <>Verification is in progress. <br /> You’ll be notified once your KYC is approved.</>
                                            ) : (
                                                <>KYC Verification Required. <br /> Please complete your KYC to start earning.</>
                                            )}
                                        </h2>
                                    </div>

                                    {(kycStatus === "in_review" || kycStatus === "pending") && (
                                        <p 
                                            className="text-[14px] font-medium text-[#616161] mt-[7px]"
                                            style={{ lineHeight: "22px" }}
                                        >
                                            This usually completes within a few minutes.
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
                                        
                                        const name = selectedHubName || selectedZoneName || 'Primary';
                                        const displayName = name.toLowerCase().endsWith('hub') ? name : `${name} Hub`;
                                        return `${formatHour(startHour)} - ${formatHour(endHour)} (${displayName})`;
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
                                } else {
                                    setShowPickUpModal(false);
                                    setShowOTPModal(true);
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
                        
                        try {
                            // 1. Upload to Supabase Storage
                            const path = `${activeOrder.id}_${verificationType}_${Date.now()}.jpg`;
                            const selfieUrl = await storageService.uploadBase64Image(image, 'rider-selfies', path);

                            // 2. Perform Safety Check (Skip matching for testing phase - just verify upload)
                            const isMatch = !!selfieUrl; // Any successful upload is a match for now
                            
                            if (!isMatch) {
                                setSecurityAlert({
                                    show: true,
                                    message: "Selfie upload failed. Please try again."
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
                            }
                        } catch (err) {
                            console.error("Security flow failed:", err);
                        } finally {
                            setIsVerifying(false);
                            setFaceVerificationMode('photo');
                        }
                    }}
                    onVideoCapture={(videoUrl) => {
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

            {/* Order Cancelled Feedback Modal */}
            {showCancelledModal && (
                <OrderCancelledModal 
                    onDismiss={() => {
                        setShowCancelledModal(false);
                        setActiveOrder(null);
                        setHasActiveOrder(false);
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
