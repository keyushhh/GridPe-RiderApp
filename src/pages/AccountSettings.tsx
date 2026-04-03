import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import authenticatorIcon from "../assets/authenticator.svg";
import avatarImg from "../assets/avatar.png";
import bankIcon from "../assets/bank.svg";
import callFillIcon from "../assets/call-fill.svg";
import chatIcon from "../assets/chat.svg";
import chevronForward from "../assets/chevron_forward.svg";
import copyIcon from "../assets/copy.svg";
import deleteIcon from "../assets/delete.svg";
import errorIcon from "../assets/error.svg";
import faceIdIcon from "../assets/face-id.svg";
import faqIcon from "../assets/faq.svg";
import fingerprintIcon from "../assets/fingerprint.svg";
import generalIssuesIcon from "../assets/general-issues.svg";
import helpCircleIcon from "../assets/help-circle.svg";
import kycLockIcon from "../assets/kyc-lock.svg";
import logoutIcon from "../assets/log-out.svg";
import passcodeIcon from "../assets/passcode.svg";
import personalInfoIcon from "../assets/personal-info.svg";
import phoneIcon from "../assets/phone.svg";
import privacyDataIcon from "../assets/privacy_data.svg";
import radioNotSelected from "../assets/radio-not-selected.svg";
import radioSelected from "../assets/radio-selected.svg";
import safetyIcon from "../assets/safety.svg";
import searchIcon from "../assets/search.svg";
import securityIcon from "../assets/security.svg";
import shareIcon from "../assets/share.svg";
import shieldIcon from "../assets/shield.svg";
import airtelLogo from "../assets/sim-carriers/airtel.png";
import jioLogo from "../assets/sim-carriers/jio.png";
import simCardIcon from "../assets/simcard.svg";
import smsIcon from "../assets/sms.svg";
import successCheckIcon from "../assets/success-check.svg";
import qrCodeImg from "../assets/trial-qr.png";
import QRCode from 'qrcode';
import verifiedBadge from "../assets/verified-badge.svg";
import walletIcon from "../assets/wallet.svg";
import GlowingOrb from "../components/GlowingOrb";
import PageHeader from "../components/PageHeader";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Button from "../components/ui/Button";
import AccountSelectionList from "../components/AccountSelectionList";
import ManualBankForm from "../components/ManualBankForm";
import SupportStatusBottomSheet, { SupportStatusStep } from "../components/SupportStatusBottomSheet";
import { BankAccount, SupportTicket } from "../types/database";
import { FAQItem } from "../data/helpData";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import { getBankLogo } from "../utils/BankLogoMap";
import { supabase } from "../lib/supabase";
import * as helpData from "../data/helpData";
import corbado from '@corbado/web-js';
import { CorbadoConnectAppend } from '@corbado/connect-react';

const CORBADO_PROJECT_ID = import.meta.env.VITE_CORBADO_PROJECT_ID || "pro-5247868208405285450";
import NetInfo from '@react-native-community/netinfo';
import { getCarrierMetadata } from "../utils/CarrierMapping";
// @ts-ignore - Only available in native environment
import SimCardsManager from 'react-native-sim-cards-manager';
// @ts-ignore - Only available in native environment
import { Linking, Platform } from 'react-native';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

// Helper component for swipe-to-delete
const SwipeableBankCard = ({ acc, index, onDelete, getBankLogo, userName }: { 
    acc: BankAccount, 
    index: number, 
    onDelete: (id: string) => void, 
    getBankLogo: (name: string) => string | null, 
    userName: string 
}) => {
    const [swipeX, setSwipeX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const startX = useRef(0);
    const maxSwipe = -80;

    const onDragStart = (clientX: number) => {
        startX.current = clientX;
        setIsDragging(true);
    };

    const onDragMove = (clientX: number) => {
        if (!isDragging) return;
        const deltaX = clientX - startX.current;

        // Reveal delete button on the right by swiping left
        if (deltaX < 0) {
            setSwipeX(Math.max(deltaX, maxSwipe));
        } else {
            setSwipeX(0);
        }
    };

    const onDragEnd = () => {
        if (!isDragging) return;
        setIsDragging(false);
        if (swipeX < -40) {
            setSwipeX(maxSwipe);
        } else {
            setSwipeX(0);
        }
    };

    const onTouchStart = (e: React.TouchEvent) => onDragStart(e.touches[0].clientX);
    const onTouchMove = (e: React.TouchEvent) => onDragMove(e.touches[0].clientX);
    const onTouchEnd = () => onDragEnd();

    const onMouseDown = (e: React.MouseEvent) => onDragStart(e.clientX);
    const onMouseMove = (e: React.MouseEvent) => onDragMove(e.clientX);
    const onMouseUp = () => onDragEnd();
    const onMouseLeave = () => onDragEnd();

    const logoUrl = getBankLogo(acc.bank_name);

    return (
        <div className={`relative w-[362px] h-auto overflow-hidden rounded-[16px] border border-[#E9EAEB] bg-white`}>
            {/* Delete Background - Only on the right and only when swiped */}
            {swipeX < 0 && (
                <div
                    className="absolute inset-y-0 right-0 w-[80px] bg-[#FF3B30] flex items-center justify-center cursor-pointer z-0"
                    onClick={() => onDelete(acc.id)}
                >
                    <div className="flex flex-col items-center gap-1">
                        <img src={deleteIcon} alt="Delete" className="w-[20px] h-[20px] brightness-0 invert" />
                        <span className="text-white text-[12px] font-bold">Delete</span>
                    </div>
                </div>
            )}

            {/* Foreground Card Content */}
            <div
                className={`w-full h-auto p-[16px] bg-white flex flex-col relative transition-transform duration-200 ease-out z-10 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                style={{ transform: `translateX(${swipeX}px)` }}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseLeave}
            >
                <div className="flex items-center gap-[12px]">
                    <div className="w-[36px] h-[36px] flex items-center justify-center">
                        {logoUrl ? (
                            <img src={logoUrl} alt="" className="w-full h-full object-contain" />
                        ) : (
                            <div className="w-full h-full rounded-full bg-[#5260FE] flex items-center justify-center text-white font-bold text-[16px]">
                                {acc.bank_name.charAt(0)}
                            </div>
                        )}
                    </div>
                    <h3 className="text-black font-bold text-[18px] flex-1">{acc.bank_name}</h3>
                    {index === 0 && (
                        <div className="h-[24px] px-[12px] rounded-full bg-[#1CB956] flex items-center justify-center">
                            <span className="text-white text-[12px] font-bold">Primary</span>
                        </div>
                    )}
                </div>

                <div className="mt-[8px] flex flex-col items-start">
                    <span className="text-black font-medium text-[14px]">Savings account</span>
                    <span className="mt-[4px] text-black font-medium text-[14px]">{acc.account_number}</span>
                    <span className="mt-[4px] text-black font-bold text-[14px]">{userName}</span>
                </div>
            </div>
        </div>
    );
};

const AccountSettings = () => {
    const isDevelopment = process.env.NODE_ENV === 'development' && Platform.OS === 'web';
    const navigate = useNavigate();
    const location = useLocation();
    const { riderId, phoneNumber, logout, kycStatus, fullName, email, pendingEmail, avatar, updateAvatar, riderUuid, refreshProfile } = useAuth();
    const { showToast } = useToast();
    const [connectToken, setConnectToken] = useState<string | null>(null);
    const [passkeyCreated, setPasskeyCreated] = useState(false);
    const [activeTab, setActiveTab] = useState(location.state?.activeTab || "Home");
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<{ categoryId: string; faq: FAQItem }[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [loginDevices, setLoginDevices] = useState<{ id: string, device_name: string, location: string, last_login_at: string, is_current: boolean }[]>([]);
    const [isLoadingSessions, setIsLoadingSessions] = useState(false);
    const [kycDoc, setKycDoc] = useState({ type: 'aadhar', label: 'Aadhar Card', number: 'XXXX 4242' });
    const [bankingStep, setBankingStep] = useState<'list' | 'add_wifi' | 'validate_sim' | 'verifying_sim' | 'linked_accounts' | 'add_form' | 'verifying_bank' | 'success'>('list');
    const [isManualSubmitting, setIsManualSubmitting] = useState(false);
    const [checkingBankAccountId, setCheckingBankAccountId] = useState<string | null>(null);
    const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
    const [addedAccounts, setAddedAccounts] = useState<BankAccount[]>([]);
    const [successfullyLinkedBank, setSuccessfullyLinkedBank] = useState<string | null>(null);
    const [securityStep, setSecurityStep] = useState<'list' | 'passkeys' | 'authenticator' | 'authenticator_otp' | 'two_step_intro' | 'two_step_email' | 'two_step_otp' | 'two_step_method' | 'two_step_phone' | 'two_step_phone_otp' | 'two_step_backup_codes' | 'two_step_dashboard'>('list');
    const [isAuthenticatorActive, setIsAuthenticatorActive] = useState(false);
    const [authenticatorOtp, setAuthenticatorOtp] = useState(['', '', '', '', '', '']);
    const otpInputs = useRef<(HTMLInputElement | null)[]>([]);
    const [totpSecret, setTotpSecret] = useState<string | null>(null);
    const [totpOtpauthUrl, setTotpOtpauthUrl] = useState<string | null>(null);
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
    const [isTotpLoading, setIsTotpLoading] = useState(false);
    const [isTotpVerifying, setIsTotpVerifying] = useState(false);
    const [tempEmail, setTempEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [twoStepOtp, setTwoStepOtp] = useState(['', '', '', '', '', '']);
    const twoStepOtpInputs = useRef<(HTMLInputElement | null)[]>([]);
    const [tempPhone, setTempPhone] = useState("");
    const [phoneOtp, setPhoneOtp] = useState(['', '', '', '', '', '']);
    const phoneOtpInputs = useRef<(HTMLInputElement | null)[]>([]);
    const [isTwoStepEnabled, setIsTwoStepEnabled] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<'sms' | 'auth'>('sms');
    const [backupCodes, setBackupCodes] = useState<{ code: string; used: boolean }[]>([]);
    const [isBackupCodesChecked, setIsBackupCodesChecked] = useState(false);
    const [fromDashboard, setFromDashboard] = useState(false);
    const [isSettingUpSms, setIsSettingUpSms] = useState(false);
    const [isRegeneratingCodes, setIsRegeneratingCodes] = useState(false);
    const [privacyStep, setPrivacyStep] = useState<'list' | 'policy' | 'terms'>('list');
    const [legalCache, setLegalCache] = useState<Record<string, { body: string, updatedAt: string }>>({});
    const [legalContent, setLegalContent] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<string>("02 August, 2025"); // Fallback
    const [isLegalLoading, setIsLegalLoading] = useState(false);
    const [ongoingHelp, setOngoingHelp] = useState<SupportTicket | null>(null);
    const [isLoadingSupport, setIsLoadingSupport] = useState(false);

    // Fetch Ongoing Help (Most Recent In Progress Ticket)
    const fetchOngoingHelp = useCallback(async () => {
        if (!riderUuid) return;
        setIsLoadingSupport(true);
        try {
            const { data: ticket, error: ticketError } = await supabase
                .from('support_tickets')
                .select('*')
                .eq('rider_id', riderUuid)
                .eq('status', 'In Progress')
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (ticketError) throw ticketError;

            if (ticket) {
                // Fetch the latest step
                const { data: steps, error: stepError } = await supabase
                    .from('support_ticket_steps')
                    .select('*')
                    .eq('ticket_id', ticket.id)
                    .order('created_at', { ascending: false });

                if (stepError) throw stepError;

                setOngoingHelp({
                    ...ticket,
                    steps: steps || []
                });
            } else {
                setOngoingHelp(null);
            }
        } catch (err) {
            // Error handled silently
        } finally {
            setIsLoadingSupport(false);
        }
    }, [riderUuid]);

    // Listen for Realtime KYC updates
    useEffect(() => {
        if (!riderUuid) return;

        const channel = supabase.channel(`kyc_account_settings_watch_${riderUuid}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'riders',
                    filter: `id=eq.${riderUuid}`
                },
                (payload) => {
                    console.log('[AccountSettings] KYC Status updated in DB:', payload.new.kyc_status);
                    if (payload.new.kyc_status === 'verified') {
                        refreshProfile();
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [riderUuid, refreshProfile]);

    useEffect(() => {
        if (activeTab === "Help & Support") {
            fetchOngoingHelp();
        }
    }, [activeTab, fetchOngoingHelp]);

    // Handle Search
    useEffect(() => {
        if (!searchTerm.trim()) {
            setSearchResults([]);
            return;
        }

        const lowerTerm = searchTerm.toLowerCase();
        const results: { categoryId: string; faq: FAQItem }[] = [];

        Object.values(helpData.helpCategories).forEach(category => {
            category.faqs.forEach(faq => {
                if (faq.question.toLowerCase().includes(lowerTerm) || faq.answer.toLowerCase().includes(lowerTerm)) {
                    results.push({ categoryId: category.id, faq });
                }
            });
        });

        setSearchResults(results.slice(0, 5)); // Limit to top 5 results
    }, [searchTerm]);

    const handleRaiseTicket = async () => {
        if (!riderUuid) return;
        setIsLoadingSupport(true);
        try {
            const ticketId = `GRDPE-RDR-${Math.floor(1000 + Math.random() * 9000)}`;
            const { data: ticket, error: ticketError } = await supabase
                .from('support_tickets')
                .insert({
                    id: ticketId,
                    rider_id: riderUuid,
                    title: "General Support Request",
                    category: "General",
                    status: "In Progress"
                })
                .select()
                .single();

            if (ticketError) throw ticketError;

            // Initial Step
            const { error: stepError } = await supabase
                .from('support_ticket_steps')
                .insert({
                    ticket_id: ticketId,
                    label: "Ticket Created",
                    status: "completed",
                    description: "Your support request has been registered and is being assigned to an agent.",
                    created_at: new Date().toISOString()
                });

            if (stepError) throw stepError;

            showToast("New support ticket raised successfully!", "success");
            fetchOngoingHelp(); // Refresh the card
        } catch (err) {
            showToast("Failed to raise ticket. Please try again.", "error");
        } finally {
            setIsLoadingSupport(false);
        }
    };

    useEffect(() => {
        if (activeTab === "Personal Info" || activeTab === "Security" || activeTab === "Home") {
            refreshProfile();
        }
    }, [activeTab]);

    const fetchLegalContent = useCallback(async (type: string) => {
        const contentType = type === 'policy' ? 'privacy_policy' : 'terms_conditions';
        
        // 1. Check Cache
        if (legalCache[contentType]) {
            setLegalContent(legalCache[contentType].body);
            setLastUpdated(legalCache[contentType].updatedAt);
            return;
        }

        // 2. Fetch from Supabase
        setIsLegalLoading(true);
        try {
            const { data, error } = await supabase
                .from('rider_legal_content')
                .select('*')
                .eq('content_type', contentType)
                .eq('is_active', true)
                .order('updated_at', { ascending: false })
                .maybeSingle();

            if (error) {
                throw error;
            }

            if (data) {
                const formattedDate = new Date(data.updated_at).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                });
                setLegalContent(data.content_body);
                setLastUpdated(formattedDate);
                
                // Update Cache
                setLegalCache(prev => ({
                    ...prev,
                    [contentType]: { body: data.content_body, updatedAt: formattedDate }
                }));
            } else {
                setLegalContent(null);
            }
        } catch (err) {
            console.error(`Failed to fetch ${contentType}:`, err);
            setLegalContent(null);
        } finally {
            setIsLegalLoading(false);
        }
    }, [legalCache]);

    useEffect(() => {
        if (activeTab === "Privacy & Data" && (privacyStep === "policy" || privacyStep === "terms")) {
            fetchLegalContent(privacyStep);
        }
    }, [activeTab, privacyStep, fetchLegalContent]);

    // Fetch TOTP secret when entering authenticator setup step
    useEffect(() => {
        if (securityStep === 'authenticator' && !totpSecret) {
            (async () => {
                setIsTotpLoading(true);
                try {
                    const { data, error } = await supabase.functions.invoke('setup-totp', {
                        body: { riderId: dynamicRiderId },
                        headers: { Authorization: '' }
                    });
                    if (error) throw error;
                    if (data?.secret && data?.otpauthUrl) {
                        setTotpSecret(data.secret);
                        setTotpOtpauthUrl(data.otpauthUrl);
                        const qrUrl = await QRCode.toDataURL(data.otpauthUrl, {
                            width: 200,
                            margin: 2,
                            color: { dark: '#000000', light: '#ffffff' }
                        });
                        setQrDataUrl(qrUrl);
                    }
                } catch (err: any) {
                    console.error('Failed to setup TOTP:', err);
                    showToast('Failed to generate authenticator secret.', 'error');
                } finally {
                    setIsTotpLoading(false);
                }
            })();
        }
    }, [securityStep]);

    const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
    const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState(false);
    const [accountToDelete, setAccountToDelete] = useState<BankAccount | null>(null);
    const [dynamicRiderId, setDynamicRiderId] = useState<string>("Loading...");
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [selectedSimPhoneNumber, setSelectedSimPhoneNumber] = useState<string>("");
    const [hasPasskeys, setHasPasskeys] = useState(false);
    const [isSdkReady, setIsSdkReady] = useState(false);
    const [savedPasskeys, setSavedPasskeys] = useState<{ id: string; name: string; createdAt: Date }[]>([]);

    // Initialize Corbado
    useEffect(() => {
        const initCorbado = async () => {
            try {
                // corbado is the default export (instance)
                // Use any casting for config if types are misaligned to resolve white screen immediately
                const config: any = {
                    projectId: CORBADO_PROJECT_ID,
                    darkMode: false
                };
                await (corbado as any).load(config);
                setIsSdkReady(true);
            } catch (err) {
                console.error('Failed to initialize Corbado:', err);
            }
        };
        initCorbado();
    }, []);



    const generateNewCodes = async () => {
        if (!dynamicRiderId || dynamicRiderId === "Loading...") return;
        setIsRegeneratingCodes(true);
        try {
            const { data, error } = await supabase.functions.invoke('regenerate-backup-codes', {
                body: { riderId: dynamicRiderId }
            });
            if (error) throw error;
            if (data?.backupCodes) {
                setBackupCodes(data.backupCodes);
            }
        } catch (err) {
            console.error('Failed to regenerate codes:', err);
            showToast('Failed to regenerate backup codes.', 'error');
        } finally {
            setIsRegeneratingCodes(false);
        }
    };

    const fetchBankAccounts = async () => {
        if (!riderUuid) return;
        try {
            const { data, error } = await supabase
                .from('rider_bank_accounts')
                .select('*')
                .eq('rider_id', riderUuid)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            if (data) {
                const mapped: BankAccount[] = data.map(acc => ({
                    id: acc.id,
                    rider_id: acc.rider_id,
                    bank_name: acc.bank_name,
                    account_number: acc.account_number,
                    ifsc_code: acc.ifsc_code,
                    account_holder_name: acc.account_holder_name,
                    is_primary: acc.is_primary,
                    created_at: acc.created_at
                }));
                
                setAddedAccounts(mapped);
            }
        } catch (err) {
            console.error('Error fetching bank accounts:', err);
        }
    };

    const [verificationState, setVerificationState] = useState<'loading' | 'error' | 'success'>('loading');
    const [selectedSim, setSelectedSim] = useState(1);
    // For testing: change simCards count to 1 or 2 as needed
    const [simCards, setSimCards] = useState([
        { id: 1, label: 'SIM 1', carrier: 'Airtel', logo: airtelLogo, phoneNumber: "+91 9876543210" },
        { id: 2, label: 'SIM 2 (eSIM)', carrier: 'Jio', logo: jioLogo, phoneNumber: "+91 8787311620" }
    ]);
    const [isSupportStatusOpen, setIsSupportStatusOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<{ id: string, title: string, amount?: string } | null>(null);
    const [supportStatusSteps, setSupportStatusSteps] = useState<SupportStatusStep[]>([
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
    ]);
    const [ongoingSupport, setOngoingSupport] = useState<{ id: string; title: string; amount: string; status: string } | null>({
        id: "GRDPE-RDR-123",
        title: "Auto Payout Failed",
        amount: "₹24,000",
        status: "In Progress"
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isWifiEnabled, setIsWifiEnabled] = useState(false);

    // Polling for Bank Verification Status
    useEffect(() => {
        let pollTimer: NodeJS.Timeout;
        
        const pollStatus = async () => {
            if (bankingStep !== 'verifying_bank' || !riderUuid) return;
            
            try {
                const { data, error } = await supabase
                    .from('bank_verification_status')
                    .select('status, bank_name')
                    .eq('rider_id', riderUuid)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();
                
                if (error) {
                    console.error('Polling error:', error);
                } else if (data?.status === 'verified') {
                    setSuccessfullyLinkedBank(data.bank_name);
                    // Refresh the list immediately
                    await fetchBankAccounts();
                    setBankingStep('success');
                    
                    // Automatically transition to list after 2 seconds
                    setTimeout(() => {
                        setBankingStep('list');
                    }, 2000);
                    return;
                }
            } catch (err) {
                console.error('Unexpected error during polling:', err);
            }
            
            pollTimer = setTimeout(pollStatus, 3000);
        };
        
        if (bankingStep === 'verifying_bank') {
            pollStatus();
        }
        
        return () => {
            if (pollTimer) clearTimeout(pollTimer);
        };
    }, [bankingStep, riderUuid]);

    // Initial Fetch for Bank Accounts
    useEffect(() => {
        if (activeTab === "Banking") {
            fetchBankAccounts();
        }
    }, [activeTab, riderUuid]);

    // Network & SIM Real-time Monitoring
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            const wifi = state.type === 'wifi';
            setIsWifiEnabled(wifi);
            
            // Real-time auto-progression: WiFi toggled off while on "add_wifi" step
            if (activeTab === "Banking" && bankingStep === "add_wifi" && !wifi && state.isConnected) {
                setBankingStep("validate_sim");
            }
        });
        return () => unsubscribe();
    }, [activeTab, bankingStep]);

    // Native SIM Fetching
    useEffect(() => {
        if (activeTab === "Banking" && bankingStep === "validate_sim") {
            const fetchSims = async () => {
                try {
                    if (isDevelopment) {
                        const mockSims = [
                            { carrierName: 'Airtel', mcc: '404', mnc: '45', slot: 1, phoneNumber: "+91 9876543210" },
                            { carrierName: 'Jio', mcc: '405', mnc: '840', slot: 2, isEsim: true, phoneNumber: "+91 8787311620" }
                        ];
                        const mappedSims = mockSims.map((sim, index) => {
                            const metadata = getCarrierMetadata(sim.mcc, sim.mnc, sim.carrierName);
                            return {
                                id: index + 1,
                                label: `SIM ${index + 1}${sim.isEsim ? ' (eSIM)' : ''}`,
                                carrier: metadata.displayName,
                                logo: metadata.logo,
                                phoneNumber: sim.phoneNumber
                            };
                        });
                        setSimCards(mappedSims);
                        setSelectedSim(mappedSims[0].id);
                        setSelectedSimPhoneNumber(mappedSims[0].phoneNumber);
                        return;
                    }

                    // Check if we're in a native environment
                    const isNative = typeof window !== 'undefined' && ((window as any).ReactNative || (window as any).NativeModules);
                    if (!isNative) return; // Fallback to mock

                    const sims = await SimCardsManager.getSimCards();
                    if (sims && sims.length > 0) {
                        const mappedSims = sims.map((sim: any, index: number) => {
                            const metadata = getCarrierMetadata(sim.mcc, sim.mnc, sim.carrierName);
                            return {
                                id: index + 1,
                                label: `SIM ${index + 1}${sim.isEsim ? ' (eSIM)' : ''}`,
                                carrier: metadata.displayName,
                                logo: metadata.logo,
                                phoneNumber: sim.phoneNumber || ""
                            };
                        });
                        setSimCards(mappedSims);
                        setSelectedSim(mappedSims[0].id);
                        setSelectedSimPhoneNumber(mappedSims[0].phoneNumber || "");
                    }
                } catch (err) {
                    console.error('SIM fetch failed:', err);
                }
            };
            fetchSims();
        }
    }, [activeTab, bankingStep, isDevelopment]);

    const handleTurnOffWifi = async () => {
        try {
            // Check for native environment
            if (typeof window !== 'undefined' && (window as any).ReactNative || (window as any).NativeModules) {
                if (Platform.OS === 'android') {
                    await Linking.sendIntent('android.settings.WIRELESS_SETTINGS');
                } else if (Platform.OS === 'ios') {
                    await Linking.openURL('App-Prefs:root=WIFI');
                }
            } else {
                setBankingStep("validate_sim");
            }
        } catch (err) {
            setBankingStep("validate_sim");
        }
    };

    useEffect(() => {
        const fetchRiderData = async () => {
            if (!riderUuid) return;
            try {
                const { data, error } = await supabase
                    .from('riders')
                    .select('rider_id, has_passkeys, two_fa_enabled, two_fa_method, backup_codes')
                    .eq('id', riderUuid)
                    .maybeSingle();
                
                if (data) {
                    if (data.rider_id) setDynamicRiderId(data.rider_id);
                    if (data.has_passkeys !== undefined) setHasPasskeys(data.has_passkeys);
                    if (data.two_fa_enabled !== undefined) setIsTwoStepEnabled(!!data.two_fa_enabled);
                    if (data.two_fa_method) setSelectedMethod(data.two_fa_method as 'sms' | 'auth');
                    if (data.backup_codes) setBackupCodes(data.backup_codes);
                } else if (!error) {
                    setDynamicRiderId("GRIDPE-RDR1023");
                }
            } catch (err) {
            }
        };

        fetchRiderData();
    }, [riderUuid, activeTab]);

    useEffect(() => {
        if (activeTab === 'Security' && riderId && loginDevices.length === 0) {
            (async () => {
                setIsLoadingSessions(true);
                try {
                    const { data, error } = await supabase.functions.invoke('get-rider-sessions', {
                        body: { riderId }
                    });
                    if (error) throw error;
                    if (data?.sessions) {
                        setLoginDevices(data.sessions);
                    }
                } catch (err) {
                } finally {
                    setIsLoadingSessions(false);
                }
            })();
        }
    }, [activeTab, riderId]);

    const menuItems = ["Home", "Personal Info", "Security", "Banking", "Privacy & Data", "Help & Support"];

    const riderName = fullName || "";
    const riderMobile = phoneNumber ? `+91 ${phoneNumber}` : "";
    const riderIdValue = dynamicRiderId;

    const handleCopyId = () => {
        navigator.clipboard.writeText(riderIdValue);
        showToast("Rider ID copied to clipboard", "success");
    };

    const handleUploadButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleUploadComplete = () => {
        setSupportStatusSteps(prev => {
            const next = [...prev];
            const uploadStep = next.find(s => s.label === "Upload Required Documents");
            if (uploadStep) {
                uploadStep.status = 'completed';
                uploadStep.description = undefined;
                uploadStep.buttonText = undefined;
                uploadStep.timestamp = "20 Mar, 2026 | 11:40 AM";
            }
            const supportStep = next.find(s => s.label === "Support Provided");
            if (supportStep) {
                supportStep.status = 'in_progress';
                supportStep.description = 'In progress';
            }
            return next;
        });

        setTimeout(() => {
            setSupportStatusSteps(prev => {
                const next = [...prev];
                const supportStep = next.find(s => s.label === "Support Provided");
                if (supportStep) {
                    supportStep.status = 'completed';
                    supportStep.description = undefined;
                    supportStep.timestamp = "20 Mar, 2026 | 11:45 AM";
                }
                if (!next.some(s => s.label === "Ticket Resolved")) {
                    next.push({
                        label: "Ticket Resolved",
                        timestamp: "20 Mar, 2026 | 11:45 AM",
                        status: "completed"
                    });
                }
                return next;
            });
            setOngoingSupport(prev => prev ? { ...prev, status: "Resolved" } : null);
        }, 3000);
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
            if (allowedTypes.includes(file.type)) {
                setIsUploadingAvatar(true);
                try {
                    await updateAvatar(file);
                    showToast("Profile photo updated successfully!", "success");
                } catch (err) {
                    showToast("Failed to upload profile photo. Please try again.", "error");
                } finally {
                    setIsUploadingAvatar(false);
                }
            } else {
                alert("Only JPG, JPEG, and PNG formats are allowed.");
            }
        }
    };

    const currentAvatar = avatar || avatarImg;

    const quickLinks = [
        { label: "Personal Info", icon: personalInfoIcon, tab: "Personal Info" },
        { label: "Security", icon: securityIcon, tab: "Security" },
        { label: "Bank & UPI", icon: bankIcon, tab: "Banking" },
    ];

    useEffect(() => {
        if (activeTab !== "Privacy & Data") return;

        const labels: Record<string, string> = {
            'aadhar': 'Aadhar Card',
            'pan': 'PAN Card',
            'voter': 'Voter ID',
            'dl': 'Driving License'
        };

        const docType = localStorage.getItem('rider_kyc_doc_type') || 'aadhar';
        const docNum = localStorage.getItem('rider_kyc_doc_number') || '4242';

        const last4 = docNum.replace(/\s/g, "").slice(-4);
        const masked = docType === 'aadhar' ? `XXXX ${last4}` : `XXX${last4}`;
        const label = labels[docType] || "Aadhar Card";

        setKycDoc({
            type: docType,
            label: label,
            number: `${label} ending with ${masked}`
        });
    }, [activeTab]);

    const handleDeleteAccount = (id: string) => {
        const account = addedAccounts.find(acc => acc.id === id);
        if (account) {
            setAccountToDelete(account);
            setIsDeletePopupOpen(true);
        }
    };

    const confirmDelete = async () => {
        if (accountToDelete) {
            const accountId = accountToDelete.id;
            const previousAccounts = [...addedAccounts];

            setAddedAccounts(prev => prev.filter(acc => acc.id !== accountId));
            setIsDeletePopupOpen(false);

            try {
                const { error } = await supabase
                    .from('rider_bank_accounts')
                    .delete()
                    .eq('id', accountId);
                
                if (error) throw error;
                showToast("Bank account has been successfully removed.", "delete");
            } catch (err) {
                setAddedAccounts(previousAccounts);
                showToast("Failed to delete the bank account. Please try again.", "error");
            }
        }
    };

    const handleEnrollPasskey = async () => {
        try {
            if (!isSdkReady) {
                throw new Error('Corbado SDK not initialized');
            }

            if (!email) {
                showToast("Please add an email to your account first to enable Passkeys.", "error");
                throw new Error('Email is required for passkey registration');
            }

            const { data: tokenData, error: tokenError } = await supabase.functions.invoke('get-corbado-connect-token', {
                body: {
                    email: email,
                    dynamicRiderId: dynamicRiderId
                },
                headers: {
                    Authorization: ''
                }
            });

            if (tokenError) throw tokenError;
            const connectToken = tokenData?.connectToken;

            if (!connectToken) {
                throw new Error('Failed to obtain Corbado Connect Token');
            }

            setConnectToken(connectToken);

        } catch (err: any) {
            showToast("Passkey setup cancelled or not supported on this device.", "error");
        }
    };

    const handleHybridEnrollment = () => {
        showToast("Hybrid enrollment (QR code) initiated", "success");
    };

    const isPrimaryAccount = addedAccounts[0]?.id === accountToDelete?.id;

    useEffect(() => {
        if (bankingStep === "verifying_sim") {
            setVerificationState("loading");
            const timer = setTimeout(() => {
                setVerificationState("success");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [bankingStep]);

    const handleConnectBank = () => {
        if (addedAccounts.length > 0) {
            setBankingStep("linked_accounts");
            return;
        }

        const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

        if (!connection || connection.type === 'wifi' || connection.type === undefined) {
            setBankingStep("add_wifi");
        } else {
            setBankingStep("validate_sim");
        }
    };

    const isScrollable = (activeTab !== "Security" && activeTab !== "Privacy & Data") || 
                        (activeTab === "Security" && loginDevices.length >= 2) ||
                        (activeTab === "Privacy & Data" && privacyStep === 'list');

    return (
        <div className="relative w-full h-[100dvh] bg-[#FDFDFD] font-satoshi flex flex-col items-center overflow-hidden">
            <PageHeader 
                title={
                    activeTab === "Privacy & Data" && privacyStep === "policy" ? "Privacy Policy" : 
                    activeTab === "Privacy & Data" && privacyStep === "terms" ? "Terms & Conditions" : 
                    "Account Settings"
                }
                onBack={() => {
                    if (activeTab === "Security" && (securityStep === "passkeys" || securityStep === "authenticator" || securityStep === "authenticator_otp" || securityStep === "two_step_intro" || securityStep === "two_step_email" || securityStep === "two_step_otp" || securityStep === "two_step_method" || securityStep === "two_step_phone" || securityStep === "two_step_phone_otp" || securityStep === "two_step_backup_codes" || securityStep === "two_step_dashboard")) {
                        if (securityStep === "two_step_backup_codes" && fromDashboard) {
                            setSecurityStep("two_step_dashboard");
                            setFromDashboard(false);
                        } else {
                            setSecurityStep("list");
                        }
                        return;
                    }
                    if (activeTab === "Privacy & Data" && (privacyStep === "policy" || privacyStep === "terms")) {
                        setPrivacyStep("list");
                        return;
                    }
                    if (activeTab === "Banking") {
                        if (bankingStep === "add_wifi") {
                            setBankingStep("list");
                        } else if (bankingStep === "validate_sim") {
                            setBankingStep("list");
                        } else if (bankingStep === "verifying_sim") {
                            setBankingStep("validate_sim");
                        } else if (bankingStep === "linked_accounts") {
                            if (addedAccounts.length > 0) {
                                setBankingStep("list");
                            } else {
                                setBankingStep("verifying_sim");
                            }
                        } else if (bankingStep === "success") {
                            setBankingStep("list");
                        } else if (bankingStep === "add_form") {
                            setBankingStep("linked_accounts");
                        } else {
                            navigate('/dashboard');
                        }
                    } else {
                        navigate('/dashboard');
                    }
                }}
            />

            <div className="mt-6 w-full overflow-x-auto no-scrollbar flex relative z-10 shrink-0">
                <div className="flex min-w-full px-4 relative">
                    <div className="absolute bottom-0 left-0 w-[630px] h-[5px] bg-[#DFDFDF] z-0" />

                    {menuItems.map((item) => (
                        <button
                            key={item}
                            onClick={() => setActiveTab(item)}
                            className={`px-4 py-3 text-[14px] font-bold whitespace-nowrap transition-all relative text-black
                                    ${activeTab === item ? 'bg-[#B4BAFF]/[0.21]' : ''}
                                `}
                        >
                            {item}
                            {activeTab === item && (
                                <div className="absolute bottom-0 left-0 w-full h-[5px] bg-[#5260FE] z-10" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="w-full max-w-[362px] flex flex-col items-center flex-1 overflow-y-auto no-scrollbar pb-10 mx-auto">
                {activeTab === "Home" && (
                    <>
                        <div className="mt-[18px] w-[83px] h-[83px] rounded-full border border-gray-100 overflow-hidden shrink-0">
                            <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover" />
                        </div>

                        <h2 className="mt-[12px] text-black font-bold text-[22px] leading-tight text-center">
                            {riderName}
                        </h2>

                        <div className="mt-[3px] flex items-center justify-center gap-2">
                            <span className="text-black font-medium text-[14px] leading-none">
                                {riderMobile}
                            </span>
                            <img src={verifiedBadge} alt="Verified" className="w-[16px] h-[16px]" />
                        </div>

                        <p className="mt-[18px] w-[340px] text-black/50 font-medium italic text-[12px] text-center leading-tight">
                            These details are verified from your KYC and cannot be edited.
                        </p>

                        <div className="mt-[18px] w-full flex items-center justify-between">
                            <span className="text-black font-medium text-[14px]">
                                Rider ID
                            </span>
                            <div className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform" onClick={handleCopyId}>
                                <span className="text-[#5260FE] font-medium text-[14px]">
                                    {riderIdValue}
                                </span>
                                <img src={copyIcon} alt="Copy" className="w-[16px] h-[16px]" />
                            </div>
                        </div>

                        <div className="mt-[27px] w-full flex flex-wrap gap-[13px] justify-center">
                            {quickLinks.map((link) => (
                                <button
                                    key={link.label}
                                    onClick={() => setActiveTab(link.tab)}
                                    className="w-[112px] h-[107px] rounded-[12px] border border-[#E9EAEB] bg-white flex flex-col items-center justify-center transition-transform active:scale-95"
                                >
                                    <img src={link.icon} alt={link.label} className="w-[24px] h-[24px]" />
                                    <span className="mt-[18px] text-black font-medium text-[14px] leading-none">
                                        {link.label}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <div
                            className={`mt-[18px] w-[362px] h-[82px] rounded-[13px] border flex items-center relative overflow-hidden shrink-0
                                    ${kycStatus === "verified" ? "border-[#1CB956]" : kycStatus === "in_review" ? "border-[#FFCC00]" : "border-[#FF3B30]"}
                                `}
                            style={{
                                backgroundColor: kycStatus === "verified" ? "rgba(28, 185, 86, 0.21)" : kycStatus === "in_review" ? "rgba(255, 204, 0, 0.21)" : "rgba(255, 59, 48, 0.21)"
                            }}
                        >
                            <div className="flex items-center ml-[19px]">
                                <div
                                    className="w-[39px] h-[39px] rounded-full border flex items-center justify-center"
                                    style={{
                                        borderColor: kycStatus === "verified" ? "#1CB956" : kycStatus === "in_review" ? "#FFCC00" : "#FF3B30",
                                        backgroundColor: kycStatus === "verified" ? "rgba(28, 185, 86, 0.22)" : kycStatus === "in_review" ? "rgba(255, 204, 0, 0.22)" : "rgba(255, 59, 48, 0.22)"
                                    }}
                                >
                                    <img src={kycLockIcon} alt="KYC" className="w-[14px] h-[14px]" />
                                </div>

                                <div className="ml-[20px] flex flex-col">
                                    <span className="text-black font-medium text-[14px] leading-tight">Security & KYC</span>
                                    <span
                                        className="mt-[3px] font-medium text-[14px] leading-tight"
                                        style={{ color: kycStatus === "verified" ? "#1CB956" : kycStatus === "in_review" ? "#FFCC00" : "#FF3B30" }}
                                    >
                                        {kycStatus === "verified" ? "Your account is fully verified" : (kycStatus === "rejected" || kycStatus === "expired") ? "Re-verification required." : kycStatus === "in_review" ? "KYC in progress" : "KYC pending"}
                                    </span>
                                </div>
                            </div>

                            <button 
                                onClick={async () => {
                                    if (kycStatus !== 'verified') {
                                        try {
                                            // 1. Double check actual DB persistence
                                            const { data: currentRider } = await supabase
                                                .from('riders')
                                                .select('kyc_status')
                                                .eq('id', riderUuid)
                                                .single();

                                            if (currentRider?.kyc_status === 'verified') {
                                                refreshProfile(); // Sync local state
                                                setActiveTab('Security');
                                                return;
                                            }

                                            const isNewSession = !currentRider?.kyc_status || ['pending', 'incomplete'].includes(currentRider.kyc_status);

                                            // 2. Wipe Local didit caching
                                            if (isNewSession) {
                                                Object.keys(localStorage).forEach(key => {
                                                    if (key.toLowerCase().includes('didit')) {
                                                        localStorage.removeItem(key);
                                                    }
                                                });
                                            }

                                            // 3. Prep UniLink
                                            const uniqueVendorData = isNewSession ? `${riderUuid}_${Date.now()}` : riderUuid;
                                            const clearCacheParam = isNewSession ? '&clear_cache=true' : '';
                                            const diditUrl = `https://verify.didit.me/u/2HbisVl2RnS8ftFtVUAt5g?vendor_data=${uniqueVendorData}${clearCacheParam}`;
                                            window.location.href = diditUrl;
                                        } catch (err) {
                                            console.error('Failed verification launch pre-flight', err);
                                        }
                                    } else {
                                        setActiveTab('Security');
                                    }
                                }}
                                className="absolute top-[21.5px] right-[18px] w-[118px] h-[39px] rounded-full bg-black text-white text-[12px] font-medium flex items-center justify-center transition-transform active:scale-95"
                            >
                                {kycStatus === "verified" ? "View Details" : "Check Security"}
                            </button>
                        </div>

                        <button
                            onClick={() => {
                                logout();
                                navigate("/login");
                            }}
                            className="mt-[42px] w-[362px] h-[48px] rounded-full bg-black text-white flex items-center justify-center transition-transform active:scale-95 shrink-0"
                        >
                            <span className="text-[16px] font-medium">Logout</span>
                            <img src={logoutIcon} alt="Logout" className="ml-2 w-[20px] h-[20px] brightness-0 invert" />
                        </button>

                        <div className="mt-auto w-full flex flex-col items-start pb-[32px]">
                            <h3 className="text-[40px] font-black text-black/30 leading-none">grid.pe</h3>
                            <p className="mt-3 text-[14px] font-medium text-black/30 leading-tight">
                                App Version v2.1.7 — 100% drama compatible.
                            </p>
                        </div>
                    </>
                )}

                {activeTab === "Personal Info" && (
                    <div className="w-full flex flex-col items-start px-0">
                        <div className="mt-[19px] flex items-center">
                            <img src={personalInfoIcon} alt="Personal Info" className="w-[24px] h-[24px]" />
                            <h2 className="ml-[12px] text-black font-bold text-[22px] leading-tight">
                                Personal Info
                            </h2>
                        </div>

                        <div className="mt-[25px] flex items-center justify-between w-full">
                            <div className="w-[83px] h-[83px] rounded-full border border-gray-100 overflow-hidden shrink-0">
                                <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover" />
                            </div>

                            <button
                                className="w-[109px] h-[32px] rounded-full bg-black text-white text-[12px] font-medium flex items-center justify-center transition-transform active:scale-95 disabled:bg-black/70"
                                onClick={handleUploadButtonClick}
                                disabled={isUploadingAvatar}
                            >
                                {isUploadingAvatar ? (
                                    <LoadingSpinner />
                                ) : (
                                    "Upload Photo"
                                )}
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".jpg,.jpeg,.png"
                                className="hidden"
                            />
                        </div>

                        <div className="mt-[29px] w-full flex flex-col items-start relative px-0">
                            <span className="text-black font-medium text-[14px] leading-none">Name</span>
                            <div className="mt-[4px] w-full flex items-center justify-between">
                                <span className="text-black font-medium text-[18px] leading-tight">
                                    {riderName}
                                </span>
                                <img src={verifiedBadge} alt="Verified" className="w-[16px] h-[16px] mr-[2px]" />
                            </div>
                        </div>

                        <div className="mt-[9px] w-full flex flex-col items-start relative px-0">
                            <span className="text-black font-medium text-[14px] leading-none">Mobile Number</span>
                            <div className="mt-[4px] w-full flex items-center justify-between">
                                <span className="text-black font-medium text-[18px] leading-tight">
                                    {riderMobile}
                                </span>
                                <img src={verifiedBadge} alt="Verified" className="w-[16px] h-[16px] mr-[2px]" />
                            </div>
                        </div>

                        <p className="mt-[16px] w-full text-black/50 font-medium italic text-[12px] leading-tight text-left">
                            These details are verified from your KYC and cannot be edited.
                        </p>

                        <div className="mt-[22px] w-[362px] h-[1px] bg-[#E9EAEB]" />

                        <div className="mt-[18px] w-full flex flex-col items-start relative px-0">
                            <span className="text-black font-medium text-[14px] leading-none">Email ID</span>
                            <div
                                className="mt-[4px] w-[362px] flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform"
                                onClick={() => navigate('/account-settings/email')}
                            >
                                <div className="flex flex-col items-start">
                                    <span className={`font-medium text-[18px] leading-tight ${email || pendingEmail ? 'text-black' : 'text-black/50 italic'}`}>
                                        {pendingEmail || email || "Add your email (optional)"}
                                    </span>
                                    {pendingEmail && (
                                        <span className="mt-[4px] px-[8px] py-[2px] bg-[#FFF3CD] text-[#856404] text-[10px] font-bold rounded-full border border-[#FFEEBA]">
                                            Pending Verification
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-[4px]">
                                    {email && !pendingEmail && (
                                        <img src={verifiedBadge} alt="Verified" className="w-[16px] h-[16px]" />
                                    )}
                                    <img src={chevronForward} alt="Go" className="w-[16px] h-[16px] mr-[2px]" />
                                </div>
                            </div>
                        </div>

                        <div className="mt-[12px] w-full flex flex-col items-start relative px-0">
                            <span className="text-black font-medium text-[14px] leading-none">Language</span>
                            <div className="mt-[4px] w-full flex items-center justify-between">
                                <span className="text-black font-medium text-[18px] leading-tight">
                                    English (EN)
                                </span>
                                <img src={shareIcon} alt="Share" className="w-[16px] h-[16px] mr-[2px]" />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "Security" && (
                    <div className="w-full flex flex-col items-start px-0">
                        {securityStep === "list" ? (
                            <>
                                <div className="mt-[19px] flex items-center">
                                    <img src={securityIcon} alt="Security" className="w-[24px] h-[24px]" />
                                    <h2 className="ml-[12px] text-black font-bold text-[22px] leading-tight">
                                        Security
                                    </h2>
                                </div>

                                <h2 className="mt-[18px] text-black font-bold text-[22px] leading-tight">
                                    Logging in to Grid.pe
                                </h2>

                                <div className="mt-[19px] w-full flex flex-col gap-[22px]">
                                    <div
                                        className="w-full flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform"
                                        onClick={() => setSecurityStep("passkeys")}
                                    >
                                        <div className="flex flex-col items-start text-left">
                                            <span className="text-black font-medium text-[14px] leading-tight">Passkeys</span>
                                            <span className="mt-[2px] text-black/50 font-medium text-[12px] leading-tight w-[267px]">
                                                {hasPasskeys ? "Biometric security is active" : "Passkeys are easier and more secure than passwords"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {hasPasskeys && (
                                                <div className="h-[24px] px-[12px] bg-[#E8F5E9] rounded-full flex items-center justify-center">
                                                    <span className="text-[#2E7D32] text-[12px] font-bold italic">Enabled</span>
                                                </div>
                                            )}
                                            <img src={chevronForward} alt="Go" className="w-[16px] h-[16px] mr-[2px]" />
                                        </div>
                                    </div>

                                    <div
                                        className="w-full flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform"
                                        onClick={() => {
                                            if (!isAuthenticatorActive) {
                                                setSecurityStep("authenticator");
                                            }
                                        }}
                                    >
                                        <div className="flex flex-col items-start text-left">
                                            <span className="text-black font-medium text-[14px] leading-tight">Authenticator App</span>
                                            {!isAuthenticatorActive && (
                                                <span className="mt-[2px] text-black/50 font-medium text-[12px] leading-tight w-[267px]">
                                                    Set up your authenticator app to add an extra layer of security
                                                </span>
                                            )}
                                        </div>
                                        {isAuthenticatorActive ? (
                                            <button
                                                className="h-[24px] px-[12px] bg-[#FFF0F0] rounded-full flex items-center justify-center transition-transform active:scale-95"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsAuthenticatorActive(false);
                                                }}
                                            >
                                                <span className="text-[#FF4D4D] text-[12px] font-bold">Remove</span>
                                            </button>
                                        ) : (
                                            <img src={chevronForward} alt="Go" className="w-[16px] h-[16px] mr-[2px]" />
                                        )}
                                    </div>

                                    <div
                                        className="w-full flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform"
                                        onClick={() => {
                                            if (isTwoStepEnabled) {
                                                setSecurityStep("two_step_dashboard");
                                            } else {
                                                setSecurityStep("two_step_intro");
                                            }
                                        }}
                                    >
                                        <div className="flex flex-col items-start text-left">
                                            <span className="text-black font-medium text-[14px] leading-tight">2-step verification</span>
                                            <span className="mt-[2px] text-black/50 font-medium text-[12px] leading-tight w-[267px]">
                                                {isTwoStepEnabled ? "2-step verification is active" : "Add additional security to your account with 2-step verification."}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isTwoStepEnabled && (
                                                <div className="h-[24px] px-[12px] bg-[#E8F5E9] rounded-full flex items-center justify-center">
                                                    <span className="text-[#2E7D32] text-[12px] font-bold italic">Enabled</span>
                                                </div>
                                            )}
                                            <img src={chevronForward} alt="Go" className="w-[16px] h-[16px] mr-[2px]" />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-[26px] w-[362px] h-[1px] bg-[#E9EAEB]" />

                                <div className="mt-[12px] w-full flex flex-col items-start px-0">
                                    <h2 className="text-black font-bold text-[22px] leading-tight">KYC</h2>
                                    <p className="mt-[6px] text-black font-medium text-[15px] leading-tight text-left">
                                        Your KYC seems to be completed at the time of onboarding. If there’s any error in your KYC verification process, it will show up in this section.
                                    </p>
                                </div>

                                <div className="mt-[24px] w-[362px] h-[1px] bg-[#E9EAEB]" />

                                <div className="mt-[12px] w-full flex flex-col items-start px-0">
                                    <h2 className="text-black font-bold text-[22px] leading-tight">Login Activity</h2>
                                    <p className="mt-[6px] text-black font-medium text-[15px] leading-tight text-left">
                                        You’re logged in or have logged in on these devices within the last 30 days. Multiple logins from the same device may appear.
                                    </p>
                                </div>

                                 {isLoadingSessions ? (
                                    <div className="mt-[16px] w-[362px] flex flex-col gap-[12px] mb-10 shrink-0">
                                        {[1, 2].map((i) => (
                                            <div key={i} className="w-[362px] h-[80px] p-[10px] rounded-[12px] border border-[#E9EAEB] flex items-start shrink-0 animate-pulse bg-gray-50/30">
                                                <div className="w-[24px] h-[24px] bg-gray-200 rounded-full shrink-0" />
                                                <div className="ml-[10px] flex flex-col gap-[8px] flex-1">
                                                    <div className="h-[15px] bg-gray-200 rounded w-[60%]" />
                                                    <div className="h-[12px] bg-gray-200 rounded w-[40%]" />
                                                    <div className="h-[12px] bg-gray-200 rounded w-[30%]" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                 ) : loginDevices.length >= 1 ? (
                                     <div className={`mt-[16px] w-[362px] flex flex-col gap-[12px] mb-10 shrink-0 ${loginDevices.length >= 2 ? 'overflow-y-auto max-h-[400px]' : ''}`}>
                                         {loginDevices.map((device) => (
                                             <div key={device.id} className="w-[362px] h-auto p-[10px] rounded-[12px] border border-[#E9EAEB] flex items-start shrink-0 bg-white">
                                                 <img 
                                                     src={device.device_name.toLowerCase().includes('pc') || device.device_name.toLowerCase().includes('mac') || device.device_name.toLowerCase().includes('windows') ? securityIcon : phoneIcon} 
                                                     alt="Device" 
                                                     className="w-[24px] h-[24px] shrink-0 opacity-60" 
                                                 />
                                                 <div className="ml-[10px] flex flex-col items-start px-0">
                                                     <span className="text-black font-medium text-[15px] leading-tight text-left">
                                                         {device.device_name}
                                                     </span>
                                                     <span
                                                         className={`mt-[6px] font-bold text-[12px] leading-tight text-left ${device.is_current ? "text-[#5260FE]" : "text-black/50"}`}
                                                     >
                                                         {device.is_current ? "Your current login" : `Last login: ${new Date(device.last_login_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}`}
                                                     </span>
                                                     <span className="mt-[6px] text-black font-bold text-[12px] leading-tight text-left opacity-90">
                                                         {device.location}
                                                     </span>
                                                     <span className="mt-[6px] text-black/40 font-medium text-[11px] leading-tight text-left uppercase tracking-wider">
                                                         Grid.Pe Rider App
                                                     </span>
                                                 </div>
                                             </div>
                                         ))}
                                     </div>
                                 ) : (
                                    <div className="mt-[16px] w-[362px] py-[30px] rounded-[12px] border border-[#E9EAEB] border-dashed flex flex-col items-center justify-center gap-2 mb-10">
                                        <img src={errorIcon} alt="Empty" className="w-[20px] h-[20px] opacity-20" />
                                        <span className="text-black/30 font-medium text-[13px]">No recent logins found</span>
                                    </div>
                                 )}
                            </>
                        ) : securityStep === "passkeys" ? (
                            <div className="w-full flex-1 flex flex-col">
                                <div className="mt-[29px] flex items-center gap-[12px]">
                                    <img src={shieldIcon} alt="Security" className="w-[24px] h-[24px]" />
                                    <h2 className="text-black font-bold text-[22px] leading-tight text-left">
                                        {savedPasskeys.length > 0 ? 'Passkeys' : 'Create a passkey'}
                                    </h2>
                                </div>

                                <div className="mt-[24px] flex flex-col gap-[4px]">
                                    <p className="text-black font-medium text-[15px] leading-tight text-left">
                                        Passkeys are easier and more secure.
                                    </p>
                                    <p className="text-black font-medium text-[15px] leading-tight text-left">
                                        With passkeys, you can log in to Grid.pe with:
                                    </p>
                                </div>

                                {savedPasskeys.length > 0 ? (
                                    <>
                                        <div className="mt-[24px] flex flex-col gap-[16px]">
                                            {savedPasskeys.map((pk) => (
                                                <div key={pk.id} className="w-full flex items-center justify-between">
                                                    <div className="flex flex-col items-start">
                                                        <span className="text-black font-medium text-[16px] leading-tight">
                                                            {pk.name}
                                                        </span>
                                                        <span className="mt-[4px] text-black/50 font-medium text-[14px] leading-tight">
                                                            Date created: {pk.createdAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                    <button
                                                        className="w-[36px] h-[36px] flex items-center justify-center cursor-pointer active:scale-[0.90] transition-transform"
                                                        onClick={() => {
                                                            setSavedPasskeys(prev => prev.filter(p => p.id !== pk.id));
                                                            if (savedPasskeys.length <= 1) {
                                                                setHasPasskeys(false);
                                                            }
                                                            showToast("Passkey deleted", "success");
                                                        }}
                                                    >
                                                        <img src={deleteIcon} alt="Delete" className="w-[20px] h-[20px] opacity-60" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-auto pb-[32px] flex flex-col gap-[12px] w-full">
                                            <button
                                                className="w-full h-[48px] rounded-full bg-black text-white font-medium text-[16px] transition-transform active:scale-[0.98]"
                                                onClick={() => {
                                                    setPasskeyCreated(false);
                                                    handleEnrollPasskey();
                                                }}
                                            >
                                                Create passkey
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="mt-[24px] flex flex-col gap-[18px]">
                                            <div className="flex items-center gap-[12px]">
                                                <img src={faceIdIcon} alt="Face ID" className="w-[24px] h-[24px]" />
                                                <span className="text-black font-medium text-[16px]">Face ID</span>
                                            </div>
                                            <div className="flex items-center gap-[12px]">
                                                <img src={fingerprintIcon} alt="Touch ID" className="w-[24px] h-[24px]" />
                                                <span className="text-black font-medium text-[16px]">Touch ID</span>
                                            </div>
                                            <div className="flex items-center gap-[12px]">
                                                <img src={passcodeIcon} alt="Passcode" className="w-[24px] h-[24px]" />
                                                <span className="text-black font-medium text-[16px]">Passcode</span>
                                            </div>
                                        </div>

                                        <div className="mt-auto pb-[32px] flex flex-col gap-[12px] w-full">
                                            <button
                                                className="w-full h-[48px] rounded-full bg-black text-white font-medium text-[16px] transition-transform active:scale-[0.98]"
                                                onClick={handleEnrollPasskey}
                                            >
                                                Create Passkey
                                            </button>
                                            <button
                                                className="w-full h-[48px] rounded-full border border-black bg-white text-black font-medium text-[16px] transition-transform active:scale-[0.98]"
                                                onClick={() => setSecurityStep("list")}
                                            >
                                                Not Now
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : securityStep === "authenticator" ? (
                            <div className="w-full flex-1 flex flex-col">
                                <div className="mt-[29px] flex items-center gap-[12px]">
                                    <img src={shieldIcon} alt="Security" className="w-[24px] h-[24px]" />
                                    <h2 className="text-black font-bold text-[22px] leading-tight text-left">
                                        Authentication Instructions
                                    </h2>
                                </div>

                                <div className="mt-[32px] flex flex-col items-center">
                                    {isTotpLoading ? (
                                        <div className="w-[150px] h-[150px] flex items-center justify-center">
                                            <LoadingSpinner />
                                        </div>
                                    ) : qrDataUrl ? (
                                        <img src={qrDataUrl} alt="TOTP QR Code" width={200} height={200} />
                                    ) : (
                                        <img src={qrCodeImg} alt="QR Code" width={200} height={200} />
                                    )}

                                    <span className="mt-[32px] text-black font-bold text-[18px] text-center max-w-[300px] leading-tight break-all">
                                        {totpSecret
                                            ? totpSecret.match(/.{1,4}/g)?.join('-')
                                            : '····-····-····-····-····-····-····-····'
                                        }
                                    </span>

                                    <button
                                        className="mt-[20px] h-[34px] px-[20px] bg-[#E9EAEB] rounded-full text-black font-medium text-[14px] flex items-center justify-center transition-transform active:scale-95"
                                        onClick={() => {
                                            if (totpSecret) {
                                                navigator.clipboard.writeText(totpSecret);
                                                showToast('Secret key copied to clipboard', 'success');
                                            }
                                        }}
                                    >
                                        Copy Key
                                    </button>
                                </div>

                                <div className="mt-[40px] flex flex-col gap-[12px] px-0">
                                    <div className="flex gap-[12px] items-start">
                                        <span className="text-black font-medium text-[15px] leading-tight">1.</span>
                                        <p className="text-black font-medium text-[15px] leading-tight text-left">
                                            Get an authenticator app on your phone or computer (e.g. Google Authenticator, Duo)
                                        </p>
                                    </div>
                                    <div className="flex gap-[12px] items-start">
                                        <span className="text-black font-medium text-[15px] leading-tight">2.</span>
                                        <p className="text-black font-medium text-[15px] leading-tight text-left">
                                            Scan the QR code or copy the key to your preferred authenticator app.
                                        </p>
                                    </div>
                                    <div className="flex gap-[12px] items-start">
                                        <span className="text-black font-medium text-[15px] leading-tight">3.</span>
                                        <p className="text-black font-medium text-[15px] leading-tight text-left">
                                            Enter the 6-digit code generated by your authenticator app on the next screen.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-auto pb-[32px] w-full">
                                    <button
                                        className={`w-full h-[48px] rounded-full bg-black text-white font-medium text-[16px] transition-transform active:scale-[0.98] ${!totpSecret ? 'opacity-50 pointer-events-none' : ''}`}
                                        onClick={() => setSecurityStep("authenticator_otp")}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        ) : securityStep === "authenticator_otp" ? (
                            <div className="w-full flex-1 flex flex-col">
                                <div className="mt-[29px] flex items-center gap-[12px]">
                                    <img src={shieldIcon} alt="Security" className="w-[24px] h-[24px]" />
                                    <h2 className="text-black font-bold text-[22px] leading-tight text-left">
                                        Authentication Instructions
                                    </h2>
                                </div>

                                <p className="mt-[25px] text-black font-medium text-[15px] leading-tight text-left">
                                    Enter the 6-digit code generated by your authenticator app
                                </p>

                                <div className="mt-[32px] flex gap-[8px] justify-start">
                                    {authenticatorOtp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => { otpInputs.current[index] = el; }}
                                            type="text"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (isNaN(Number(val))) return;
                                                const newOtp = [...authenticatorOtp];
                                                newOtp[index] = val;
                                                setAuthenticatorOtp(newOtp);
                                                if (val !== '' && index < 5) {
                                                    otpInputs.current[index + 1]?.focus();
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Backspace' && authenticatorOtp[index] === '' && index > 0) {
                                                    otpInputs.current[index - 1]?.focus();
                                                }
                                            }}
                                            className="w-[52px] h-[68px] bg-[#F7F8FA] border border-[#E6E8EB] rounded-[8px] text-center text-[24px] font-medium focus:border-[#5260FE] outline-none transition-colors"
                                        />
                                    ))}
                                </div>

                                <div className="mt-auto pb-[32px] w-full">
                                    <button
                                        className={`w-full h-[48px] rounded-full bg-black text-white font-medium text-[16px] transition-transform active:scale-[0.98] ${authenticatorOtp.join('').length === 6 && !isTotpVerifying ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}
                                        onClick={async () => {
                                            setIsTotpVerifying(true);
                                            try {
                                                const { data, error } = await supabase.functions.invoke('verify-totp', {
                                                    body: {
                                                        riderId: dynamicRiderId,
                                                        code: authenticatorOtp.join('')
                                                    },
                                                    headers: { Authorization: '' }
                                                });
                                                if (error) throw error;
                                                if (data?.success) {
                                                    setIsAuthenticatorActive(true);
                                                    setSelectedMethod("auth");
                                                    setSecurityStep("list");
                                                    setAuthenticatorOtp(['', '', '', '', '', '']);
                                                    showToast("Authenticator app verified successfully", "success");
                                                } else {
                                                    showToast(data?.error || "Invalid code. Please try again.", "error");
                                                }
                                            } catch (err: any) {
                                                showToast("Verification failed. Please try again.", "error");
                                            } finally {
                                                setIsTotpVerifying(false);
                                            }
                                        }}
                                    >
                                        {isTotpVerifying ? 'Verifying...' : 'Next'}
                                    </button>
                                </div>
                            </div>
                        ) : securityStep === "two_step_intro" ? (
                            <div className="w-full flex-1 flex flex-col">
                                <div className="mt-[29px] flex items-center gap-[12px]">
                                    <img src={shieldIcon} alt="Security" className="w-[24px] h-[24px]" />
                                    <h2 className="text-black font-bold text-[22px] leading-tight text-left">
                                        2-step verification
                                    </h2>
                                </div>

                                <div className="mt-[24px] flex flex-col gap-[20px]">
                                    <p className="text-black font-medium text-[15px] leading-tight text-left">
                                        Add extra security to your account with 2-step verification and prevent unauthorized access to your account.
                                    </p>
                                    <p className="text-black font-medium text-[15px] leading-tight text-left">
                                        2-step verification requires an additional authentication step when logging in to your account.
                                    </p>
                                </div>

                                <div className="mt-auto pb-[32px] flex flex-col gap-[12px] w-full">
                                    <button
                                        className="w-full h-[48px] rounded-full bg-black text-white font-medium text-[16px] transition-transform active:scale-[0.98]"
                                        onClick={() => {
                                            if (email) {
                                                setSecurityStep("two_step_method");
                                            } else {
                                                setSecurityStep("two_step_email");
                                            }
                                        }}
                                    >
                                        Get Started
                                    </button>
                                    <button
                                        className="w-full h-[48px] rounded-full border border-black bg-white text-black font-medium text-[16px] transition-transform active:scale-[0.98]"
                                        onClick={() => setSecurityStep("list")}
                                    >
                                        Not Now
                                    </button>
                                </div>
                            </div>
                        ) : securityStep === "two_step_email" ? (
                            <div className="w-full flex-1 flex flex-col">
                                <div className="mt-[26px]">
                                    <h2 className="text-black font-bold text-[22px] leading-tight text-left">
                                        Email ID
                                    </h2>
                                </div>

                                <p className="mt-[24px] text-black font-medium text-[15px] leading-tight text-left">
                                    You'll use this email to receive messages, sign in and recover your account.
                                </p>

                                <div className="mt-[24px] flex flex-col gap-[8px]">
                                    <div className="w-full h-[48px] px-[16px] bg-[#F7F8FA] border border-[#E6E8EB] rounded-full flex items-center">
                                        <input
                                            type="email"
                                            placeholder="Enter your email ID"
                                            value={tempEmail}
                                            onChange={(e) => {
                                                setTempEmail(e.target.value);
                                                if (emailError) setEmailError("");
                                            }}
                                            className="w-full bg-transparent text-black font-medium text-[16px] outline-none placeholder:text-black/50 placeholder:font-medium placeholder:text-[14px]"
                                        />
                                    </div>
                                    {emailError ? (
                                        <p className="text-[#FF4D4D] font-medium text-[12px] leading-tight text-left">
                                            {emailError}
                                        </p>
                                    ) : (
                                        <p className="text-black/50 font-medium text-[12px] leading-tight text-left">
                                            A verification code will be sent to this email
                                        </p>
                                    )}
                                </div>

                                <div className="mt-auto pb-[32px] w-full">
                                    <button
                                        className={`w-full h-[48px] rounded-full font-medium text-[16px] transition-transform active:scale-[0.98] ${tempEmail ? 'bg-[#5260FE] text-white opacity-100' : 'bg-[#E0E2FF] text-white opacity-100 cursor-not-allowed'}`}
                                        disabled={!tempEmail}
                                        onClick={() => {
                                            if (!tempEmail.includes("@") || !tempEmail.toLowerCase().includes(".com")) {
                                                setEmailError("Please enter a valid email id");
                                            } else {
                                                setEmailError("");
                                                setSecurityStep("two_step_otp");
                                            }
                                        }}
                                    >
                                        Update
                                    </button>
                                </div>
                            </div>
                        ) : securityStep === "two_step_otp" ? (
                            <div className="w-full flex-1 flex flex-col">
                                <div className="mt-[29px] flex items-center gap-[12px]">
                                    <img src={shieldIcon} alt="Security" className="w-[24px] h-[24px]" />
                                    <h2 className="text-black font-bold text-[22px] leading-tight text-left">
                                        2-step verification
                                    </h2>
                                </div>

                                <div className="mt-[24px]">
                                    <p className="text-black font-medium text-[14px] leading-[1.4] text-left">
                                        Enter the 6-digit code received in your registered email id <span className="font-bold">{tempEmail || "your email"}</span>
                                    </p>
                                </div>

                                <div className="mt-[16px] flex gap-[8px] justify-start">
                                    {twoStepOtp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => { twoStepOtpInputs.current[index] = el; }}
                                            type="text"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (isNaN(Number(val))) return;
                                                const newOtp = [...twoStepOtp];
                                                newOtp[index] = val;
                                                setTwoStepOtp(newOtp);
                                                if (val !== '' && index < 5) {
                                                    twoStepOtpInputs.current[index + 1]?.focus();
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Backspace' && twoStepOtp[index] === '' && index > 0) {
                                                    twoStepOtpInputs.current[index - 1]?.focus();
                                                }
                                            }}
                                            className="w-[52px] h-[68px] bg-[#F7F8FA] border border-[#E6E8EB] rounded-[8px] text-center text-[24px] font-medium focus:border-[#5260FE] outline-none transition-colors"
                                        />
                                    ))}
                                </div>

                                <div className="mt-[12px] flex justify-end w-full pr-[2px]">
                                    <span className="text-[#5260FE] font-medium text-[14px] cursor-pointer">
                                        Resend OTP in 20s
                                    </span>
                                </div>

                                <p className="mt-[16px] text-black/50 font-medium text-[14px] text-left">
                                    Tip: Make sure to check your spam folders.
                                </p>

                                <div className="mt-auto pb-[32px] w-full">
                                    <button
                                        className={`w-full h-[48px] rounded-full bg-black text-white font-medium text-[16px] transition-transform active:scale-[0.98] ${twoStepOtp.join('').length === 6 ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}
                                        onClick={() => {
                                            if (twoStepOtp.join('') === "123456") {
                                                setSecurityStep("two_step_method");
                                                setTwoStepOtp(['', '', '', '', '', '']);
                                            } else {
                                                alert("Invalid OTP. Try 123456");
                                            }
                                        }}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        ) : securityStep === "two_step_method" ? (
                            <div className="w-full flex-1 flex flex-col">
                                <div className="mt-[26px]">
                                    <h2 className="text-black font-bold text-[22px] leading-tight text-left">
                                        Choose a verification method
                                    </h2>
                                </div>

                                <p className="mt-[24px] text-black font-medium text-[16px] leading-tight text-left w-[362px]">
                                    Add extra security to your account with 2-step verification.
                                </p>

                                <div className="mt-[25px] flex flex-col gap-[16px]">
                                    <div
                                        className="flex items-center justify-between cursor-pointer active:bg-gray-50 transition-colors"
                                        onClick={() => {
                                            setSecurityStep("two_step_phone");
                                        }}
                                    >
                                        <div className="flex flex-col gap-[4px] pr-[20px]">
                                            <span className="text-black font-medium text-[14px] leading-tight">
                                                Text message (SMS)
                                            </span>
                                            <span className="text-black/50 font-medium text-[12px] leading-[1.3]">
                                                You'll receive verification codes via text messages when you log into your account
                                            </span>
                                        </div>
                                        <img src={chevronForward} alt="Arrow" className="w-[20px] h-[20px] flex-shrink-0" />
                                    </div>

                                    <div
                                        className="flex items-center justify-between cursor-pointer active:bg-gray-50 transition-colors"
                                        onClick={() => {
                                            setSecurityStep("authenticator");
                                        }}
                                    >
                                        <div className="flex flex-col gap-[4px] pr-[20px]">
                                            <span className="text-black font-medium text-[14px] leading-tight">
                                                Authenticator app
                                            </span>
                                            <span className="text-black/50 font-medium text-[12px] leading-[1.3]">
                                                You'll use a verification code generated by an authenticator app such as Google Authenticator or Duo Mobile when you log into your account
                                            </span>
                                        </div>
                                        <img src={chevronForward} alt="Arrow" className="w-[20px] h-[20px] flex-shrink-0" />
                                    </div>
                                </div>
                            </div>
                        ) : securityStep === "two_step_phone" ? (
                            <div className="w-full flex-1 flex flex-col">
                                <div className="mt-[26px]">
                                    <h2 className="text-black font-bold text-[22px] leading-tight text-left">
                                        Phone number
                                    </h2>
                                </div>

                                <p className="mt-[24px] text-black font-medium text-[15px] leading-tight text-left">
                                    You'll use this number to get notifications, sign in and recover your account.
                                </p>

                                <div className="mt-[24px] flex flex-col gap-[8px]">
                                    <div className="w-full h-[48px] px-[16px] bg-[#F7F8FA] border border-[#E6E8EB] rounded-full flex items-center">
                                        <div className="flex items-center gap-[12px] pr-[12px] border-r border-[#E6E8EB]">
                                            <span className="text-black/50 font-medium text-[16px]">+91</span>
                                        </div>
                                        <input
                                            type="tel"
                                            placeholder="9876543210"
                                            value={tempPhone}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                if (val.length <= 10) setTempPhone(val);
                                            }}
                                            className="ml-[12px] w-full bg-transparent text-black font-medium text-[16px] outline-none placeholder:text-black/50 placeholder:font-medium placeholder:text-[16px]"
                                        />
                                    </div>
                                    <p className="text-black/50 font-medium text-[12px] leading-tight text-left">
                                        A verification code will be sent to this number
                                    </p>
                                </div>

                                <div className="mt-auto pb-[32px] w-full">
                                    <button
                                        className={`w-full h-[48px] rounded-full font-medium text-[16px] transition-transform active:scale-[0.98] ${tempPhone.length === 10 ? 'bg-[#5260FE] text-white' : 'bg-[#E0E2FF] text-white cursor-not-allowed'}`}
                                        disabled={tempPhone.length !== 10}
                                        onClick={() => setSecurityStep("two_step_phone_otp")}
                                    >
                                        Continue
                                    </button>
                                </div>
                            </div>
                        ) : securityStep === "two_step_phone_otp" ? (
                            <div className="w-full flex-1 flex flex-col">
                                <div className="mt-[26px]">
                                    <h2 className="text-black font-bold text-[22px] leading-tight text-left">
                                        Phone number
                                    </h2>
                                </div>

                                <div className="mt-[24px]">
                                    <p className="text-black font-medium text-[14px] leading-[1.4] text-left">
                                        Enter the 6-digit code sent to you at <span className="font-bold">+91 {tempPhone}</span>
                                    </p>
                                </div>

                                <div className="mt-[32px] flex gap-[8px] justify-start">
                                    {phoneOtp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => { phoneOtpInputs.current[index] = el; }}
                                            type="text"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (isNaN(Number(val))) return;
                                                const newOtp = [...phoneOtp];
                                                newOtp[index] = val;
                                                setPhoneOtp(newOtp);
                                                if (val !== '' && index < 5) {
                                                    phoneOtpInputs.current[index + 1]?.focus();
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Backspace' && phoneOtp[index] === '' && index > 0) {
                                                    phoneOtpInputs.current[index - 1]?.focus();
                                                }
                                            }}
                                            className="w-[52px] h-[68px] bg-[#F7F8FA] border border-[#E6E8EB] rounded-[8px] text-center text-[24px] font-medium focus:border-[#5260FE] outline-none transition-colors"
                                        />
                                    ))}
                                </div>

                                <div className="mt-[12px] flex justify-end w-full pr-[2px]">
                                    <span className="text-[#5260FE] font-medium text-[14px] cursor-pointer">
                                        Resend OTP in 20s
                                    </span>
                                </div>

                                <div className="mt-auto pb-[32px] w-full">
                                    <button
                                        className={`w-full h-[48px] rounded-full bg-black text-white font-medium text-[16px] transition-transform active:scale-[0.98] ${(phoneOtp.join('').length === 6 && !isSettingUpSms) ? 'opacity-100' : 'opacity-50 pointer-events-none'} flex items-center justify-center`}
                                        disabled={phoneOtp.join('').length !== 6 || isSettingUpSms}
                                        onClick={async () => {
                                            if (phoneOtp.join('') === "123456") {
                                                setIsSettingUpSms(true);
                                                try {
                                                    const { data, error } = await supabase.functions.invoke('setup-sms-2fa', {
                                                        body: { 
                                                            riderId: dynamicRiderId,
                                                            phoneNumber: `+91${tempPhone}`
                                                        }
                                                    });
                                                    if (error) throw error;
                                                    if (data?.backupCodes) {
                                                        setBackupCodes(data.backupCodes);
                                                        setFromDashboard(false);
                                                        setIsBackupCodesChecked(false);
                                                        setSecurityStep("two_step_backup_codes");
                                                        setPhoneOtp(['', '', '', '', '', '']);
                                                    }
                                                } catch (err) {
                                                    showToast('Failed to enable 2-step verification.', 'error');
                                                } finally {
                                                    setIsSettingUpSms(false);
                                                }
                                            } else {
                                                showToast("Invalid OTP. Try 123456", "error");
                                            }
                                        }}
                                    >
                                        {isSettingUpSms ? (
                                            <LoadingSpinner />
                                        ) : "Next"}
                                    </button>
                                </div>
                            </div>
                        ) : securityStep === "two_step_backup_codes" ? (
                            <div className="w-full flex-1 flex flex-col">
                                <div className="mt-[26px]">
                                    <h2 className="text-black font-bold text-[22px] leading-tight text-left">
                                        Backup codes
                                    </h2>
                                </div>

                                <p className="mt-[24px] text-black font-medium text-[15px] leading-tight text-left">
                                    Screenshot these codes and store them in a safe place. If you have trouble receiving a verification code, you can use one of these codes instead. Each code can only be used once. <span className="font-bold underline cursor-pointer">Learn more</span>
                                </p>

                                 <div className="mt-[32px] grid grid-cols-2 gap-x-[20px] gap-y-[12px]">
                                     {backupCodes.map((item, i) => (
                                         <span 
                                            key={i} 
                                            className={`text-black font-bold text-[20px] leading-tight text-left ${item.used ? 'opacity-30 line-through' : 'opacity-100'}`}
                                         >
                                             {item.code}
                                         </span>
                                     ))}
                                 </div>

                                 {!fromDashboard && (
                                     <div 
                                        className="mt-[32px] flex items-center gap-[12px] cursor-pointer"
                                        onClick={() => setIsBackupCodesChecked(!isBackupCodesChecked)}
                                     >
                                         <div className={`w-[20px] h-[20px] rounded-[4px] border ${isBackupCodesChecked ? 'bg-[#5260FE] border-[#5260FE]' : 'border-[#E6E8EB]'} flex items-center justify-center transition-colors shrink-0`}>
                                             {isBackupCodesChecked && <div className="w-[10px] h-[5px] border-l-2 border-b-2 border-white -rotate-45 mb-[2px]" />}
                                         </div>
                                         <span className="text-black font-medium text-[14px] leading-tight">
                                             I have saved these backup codes in a safe place
                                         </span>
                                     </div>
                                 )}
 
                                 <div className="mt-auto pb-[32px] flex flex-col gap-[12px] w-full">
                                     {!fromDashboard && (
                                         <button
                                             className={`w-full h-[48px] rounded-full font-medium text-[16px] transition-transform active:scale-[0.98] ${isBackupCodesChecked ? 'bg-[#5260FE] text-white' : 'bg-[#E0E2FF] text-white cursor-not-allowed'}`}
                                             disabled={!isBackupCodesChecked}
                                             onClick={() => {
                                                setIsTwoStepEnabled(true);
                                                setSecurityStep("two_step_dashboard");
                                             }}
                                         >
                                             Save
                                         </button>
                                     )}
                                     <button
                                         className={`w-full h-[48px] rounded-full border border-[#5260FE] bg-white text-[#5260FE] font-medium text-[16px] transition-transform active:scale-[0.98] flex items-center justify-center ${fromDashboard ? 'mt-auto' : ''}`}
                                         onClick={generateNewCodes}
                                         disabled={isRegeneratingCodes}
                                     >
                                         {isRegeneratingCodes ? (
                                             <LoadingSpinner />
                                         ) : "Get new codes"}
                                     </button>
                                 </div>
                            </div>
                        ) : securityStep === "two_step_dashboard" ? (
                            <div className="w-full flex-1 flex flex-col">
                                <div className="mt-[26px] flex items-center">
                                    <img src={shieldIcon} alt="Shield" className="w-[24px] h-[24px]" />
                                    <h2 className="ml-[12px] text-black font-bold text-[22px] leading-tight text-left">
                                        2-step verification
                                    </h2>
                                </div>

                                <p className="mt-[24px] text-black font-medium text-[15px] leading-tight text-left">
                                    Add extra security to your account with 2-step verification and prevent unauthorized access to your account.
                                </p>

                                <div className="mt-[32px] w-[362px] h-[50px] px-[13px] bg-transparent border border-[#E6E8EB] rounded-full flex items-center justify-between">
                                    <span className="text-black font-bold text-[16px]">2-step verification</span>
                                    <div
                                        className={`w-[50px] h-[24px] rounded-full relative cursor-pointer transition-colors duration-200 ${isTwoStepEnabled ? 'bg-[#4CD964]' : 'bg-[#E9E9EB]'}`}
                                        onClick={async () => {
                                            const newState = !isTwoStepEnabled;
                                            try {
                                                if (!newState) {
                                                    const { error } = await supabase
                                                        .from('riders')
                                                        .update({ two_fa_enabled: false })
                                                        .eq('rider_id', dynamicRiderId);
                                                    if (error) throw error;
                                                }
                                                setIsTwoStepEnabled(newState);
                                            } catch (err) {
                                                showToast('Failed to update 2-step verification.', 'error');
                                            }
                                        }}
                                    >
                                        <div className={`absolute top-[2px] w-[20px] h-[20px] bg-white rounded-full shadow-md transition-transform duration-200 ${isTwoStepEnabled ? 'translate-x-[28px]' : 'translate-x-[2px]'}`} />
                                    </div>
                                </div>

                                <div className="mt-[25px] flex gap-[9px] w-[393px] -ml-[15.5px] pl-[35px] items-center">
                                    <div
                                        className={`w-[162px] h-[82px] p-[12px] bg-white border ${selectedMethod === 'sms' ? 'border-[#5260FE]' : 'border-[#E6E8EB]'} rounded-[12px] flex flex-col justify-between relative cursor-pointer`}
                                        onClick={() => {
                                            setSelectedMethod('sms');
                                        }}
                                    >
                                        <div className="flex justify-between items-start">
                                            <img src={smsIcon} alt="SMS" className="w-[26px] h-[26px]" />
                                            <div className={`w-[20px] h-[20px] rounded-full border ${selectedMethod === 'sms' ? 'border-[6px] border-[#5260FE]' : 'border-2 border-[#E6E8EB]'}`} />
                                        </div>
                                        <span className="text-black font-bold text-[14px]">Text message</span>
                                    </div>

                                    <div
                                        className={`w-[162px] h-[82px] p-[12px] bg-white border ${selectedMethod === 'auth' ? 'border-[#5260FE]' : 'border-[#E6E8EB]'} rounded-[12px] flex flex-col justify-between relative cursor-pointer`}
                                        onClick={() => {
                                            if (isAuthenticatorActive) {
                                                setSelectedMethod('auth');
                                            } else {
                                                setSecurityStep("authenticator");
                                            }
                                        }}
                                    >
                                        <div className="flex justify-between items-start">
                                            <img src={authenticatorIcon} alt="Auth" className="w-[26px] h-[26px]" />
                                            <div className={`w-[20px] h-[20px] rounded-full border ${selectedMethod === 'auth' ? 'border-[6px] border-[#5260FE]' : 'border-2 border-[#E6E8EB]'}`} />
                                        </div>
                                        <span className="text-black font-bold text-[14px]">Authenticator app</span>
                                    </div>
                                </div>

                                <div
                                    className="mt-[35px] flex items-center justify-between cursor-pointer active:bg-gray-50 transition-colors"
                                    onClick={async () => {
                                        setFromDashboard(true);
                                        try {
                                            const { data, error } = await supabase.functions.invoke('get-backup-codes', {
                                                body: { riderId: dynamicRiderId }
                                            });
                                            if (error) throw error;
                                            if (data?.backupCodes) {
                                                setBackupCodes(data.backupCodes);
                                                setSecurityStep("two_step_backup_codes");
                                            }
                                        } catch (err) {
                                            showToast('Failed to load backup codes.', 'error');
                                        }
                                    }}
                                >
                                    <div className="flex flex-col gap-[4px] pr-[20px]">
                                        <span className="text-black font-medium text-[14px] leading-tight">
                                            Backup codes
                                        </span>
                                        <span className="text-black/50 font-medium text-[12px] leading-[1.3] w-[267px]">
                                            Use a backup code to log in if you lose access to your phone or can't log in through your preferred security method
                                        </span>
                                    </div>
                                    <img src={chevronForward} alt="Arrow" className="w-[20px] h-[20px] flex-shrink-0" />
                                </div>
                            </div>
                        ) : null}
                    </div>
                )}

                {activeTab === "Privacy & Data" && (
                    <div className="w-full flex flex-col items-start px-0">
                        {privacyStep === "list" ? (
                            <>
                                <div className="mt-[19px] flex items-center shrink-0">
                                    <img src={privacyDataIcon} alt="Privacy" className="w-[24px] h-[24px]" />
                                    <h2 className="ml-[12px] text-black font-bold text-[22px] leading-tight text-left">
                                        Privacy & Data
                                    </h2>
                                </div>

                                <h2 className="mt-[18px] text-black font-bold text-[22px] leading-tight text-left shrink-0">
                                    Legal
                                </h2>

                                <div className="mt-[19px] w-full flex flex-col gap-[22px] shrink-0">
                                    <div 
                                        className="w-full flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform"
                                        onClick={() => setPrivacyStep("policy")}
                                    >
                                        <div className="flex flex-col items-start text-left">
                                            <span className="text-black font-medium text-[14px] leading-tight text-left">Privacy Centre</span>
                                            <span className="mt-[2px] text-black/50 font-medium text-[12px] leading-tight text-left">
                                                Take control of your privacy and learn how we protect it.
                                            </span>
                                        </div>
                                        <img src={chevronForward} alt="Go" className="w-[16px] h-[16px] mr-[2px]" />
                                    </div>

                                    <div 
                                        className="w-full flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform"
                                        onClick={() => setPrivacyStep("terms")}
                                    >
                                        <div className="flex flex-col items-start text-left">
                                            <span className="text-black font-medium text-[14px] leading-tight text-left">Terms & Conditions</span>
                                            <span className="mt-[2px] text-black/50 font-medium text-[12px] leading-tight text-left w-[267px]">
                                                View the legal agreement between you and Grid.pe regarding app usage and services.
                                            </span>
                                        </div>
                                        <img src={chevronForward} alt="Go" className="w-[16px] h-[16px] mr-[2px]" />
                                    </div>
                                </div>

                                <div className="mt-[26px] w-[362px] h-[1px] bg-[#E9EAEB] shrink-0" />

                                <div className="mt-[12px] w-full flex flex-col items-start px-0 shrink-0">
                                    <h2 className="text-black font-bold text-[22px] leading-tight text-left">Documents & Data uploaded</h2>
                                    <p className="mt-[6px] text-black font-medium text-[15px] leading-tight text-left">
                                        Documents uploaded by you for your KYC. You can update them once it expires or if you are needed to re-do the KYC procedure again.
                                    </p>
                                </div>
                                <div className="mt-[24px] w-[362px] h-auto p-[16px] rounded-[12px] border border-[#E6E8EB] flex flex-col gap-[16px] mb-8 shrink-0">
                                    {kycDoc && (
                                        <div className="w-full flex items-center justify-between">
                                            <div className="flex flex-col items-start text-left">
                                                <span className="text-black font-medium text-[14px] leading-tight text-left">
                                                    {kycDoc.label}
                                                </span>
                                                <div className="mt-[4px] flex items-center gap-[6px]">
                                                    <span className="text-[#5260FE] font-medium text-[14px] leading-tight text-left">
                                                        {kycDoc.number}
                                                    </span>
                                                    <img src={verifiedBadge} alt="Verified" className="w-[16px] h-[16px]" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="w-full flex flex-col items-start">
                                <p className="mt-[20px] text-black font-medium text-[14px] leading-tight font-satoshi">
                                    You’re all set — let’s make money moves.
                                </p>

                                <div className="mt-[20px] w-[362px] h-[600px] rounded-[22px] border border-[#E9EAEB] overflow-y-auto no-scrollbar flex flex-col items-start p-[16px]">
                                    {isLegalLoading ? (
                                        <div className="w-full flex flex-col items-center justify-center py-20 gap-4">
                                            <LoadingSpinner />
                                            <span className="text-black/50 text-[13px] font-medium">Fetching legal details...</span>
                                        </div>
                                    ) : (
                                        <>
                                            {legalContent ? (
                                                <div 
                                                    className="legal-prose w-full"
                                                    dangerouslySetInnerHTML={{ __html: legalContent }}
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-20 text-center gap-2">
                                                    <img src={errorIcon} alt="Error" className="w-[24px] h-[24px] opacity-20 mb-2" />
                                                    <span className="text-black font-bold text-[15px]">Content not found</span>
                                                    <span className="text-black/50 text-[13px] leading-tight max-w-[250px]">
                                                        Legal content is currently being updated. Please check back shortly.
                                                    </span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "Help & Support" && (
                    <div className="w-full flex flex-col items-start px-0">
                        {/* Header: Icon + Title */}
                        <div className="mt-[19px] flex items-center shrink-0">
                            <img src={helpCircleIcon} alt="Help" className="w-[24px] h-[24px]" />
                            <h2 className="ml-[12px] text-black font-bold text-[22px] leading-tight text-left font-satoshi">
                                Help & Support
                            </h2>
                        </div>

                        {/* Service Text */}
                        <div className="mt-[24px] flex flex-col items-start font-satoshi">
                            <h3 className="text-black font-bold text-[16px] leading-tight">How can we help?</h3>
                            <p className="mt-[4px] text-black font-normal text-[14px]">We are happy to help you anytime</p>
                        </div>

                        {/* Search Bar */}
                        <div className="mt-[18px] w-full relative z-[100]">
                            <div className="w-full h-[44px] px-[16px] rounded-full border border-[#E6E8EB] flex items-center gap-[12px] bg-white ring-offset-0 transition-colors">
                                <img src={searchIcon} alt="Search" className="w-[18px] h-[18px]" />
                                <input
                                    type="text"
                                    placeholder="Example: “Change primary bank”"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="flex-1 bg-transparent border-none outline-none text-black font-normal text-[14px] placeholder:text-black/70 font-satoshi"
                                />
                                {searchTerm && (
                                    <button onClick={() => setSearchTerm("")} className="text-black/40 text-[12px] font-bold">Clear</button>
                                )}
                            </div>

                            {/* Suggested FAQs Dropdown */}
                            {searchResults.length > 0 && (
                                <div className="absolute top-[50px] left-0 w-full bg-white border border-[#E9EAEB] rounded-[16px] shadow-xl overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="px-4 py-2 border-b border-[#F7F8FA]">
                                        <span className="text-[11px] font-bold text-black/40 uppercase tracking-wider">Suggested FAQs</span>
                                    </div>
                                    {searchResults.map((res, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                navigate(`/help/${res.categoryId}`, { state: { expandedId: res.faq.id } });
                                                setSearchTerm("");
                                            }}
                                            className="w-full px-4 py-3 text-left hover:bg-[#F7F8FA] flex flex-col gap-1 transition-colors border-b border-[#F7F8FA] last:border-none"
                                        >
                                            <span className="text-[14px] font-medium text-black line-clamp-1">{res.faq.question}</span>
                                            <span className="text-[12px] text-black/50 line-clamp-1">{res.faq.answer}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Ongoing Help & Support Requests */}
                        {(() => {
                            const ongoing = ongoingHelp;

                            return (
                                <div className="w-full flex flex-col items-start translate-y-[-2px]">
                                    {ongoing ? (
                                        <div className="mt-[18px] w-full flex flex-col items-start">
                                            <span className="text-black/60 font-medium text-[14px] uppercase font-satoshi">Ongoing Help</span>
                                            <div className="flex flex-col gap-[12px] w-full mt-[12px]">
                                                {/* Ongoing Ticket Card */}
                                                <div 
                                                    onClick={() => {
                                                        setSelectedTicket(ongoing);
                                                        setSupportStatusSteps(ongoing.steps || []);
                                                        setIsSupportStatusOpen(true);
                                                    }}
                                                    className="w-full h-auto p-[14px] rounded-[13px] border border-[#E9EAEB] bg-white flex items-start gap-[12px] relative shrink-0 cursor-pointer active:scale-[0.98] transition-transform"
                                                >
                                                    {/* Status Badge */}
                                                    <div className="absolute top-[14px] right-[14px] px-[8px] py-[4px] rounded-[4px] bg-[#EAEDFF] flex items-center justify-center">
                                                        <span className="text-[#5260FE] text-[12px] font-medium uppercase tracking-tight">In Progress</span>
                                                    </div>

                                                    <div className="w-[24px] h-[24px] flex items-center justify-center mt-[1px]">
                                                        <img src={helpCircleIcon} alt="Help" className="w-[24px] h-[24px]" />
                                                    </div>

                                                    <div className="flex flex-col pr-[60px]">
                                                        <h3 className="text-black font-medium text-[16px] font-satoshi leading-tight">
                                                            {ongoing.title} {ongoing.amount ? `(${ongoing.amount})` : ''}
                                                        </h3>
                                                        <span className="mt-[6px] text-black/40 font-medium text-[12px] font-satoshi">
                                                            {ongoing.steps?.[0]?.label || "Request Received"} • {ongoing.id}
                                                        </span>
                                                        <div className="mt-[8px] flex items-center gap-[4px]">
                                                            <span className="text-[#5260FE] font-bold text-[12px] font-satoshi">Track Status</span>
                                                            <img src={chevronForward} alt="Go" className="w-[14px] h-[14px] opacity-60" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-[18px] w-full p-[20px] rounded-[13px] border border-dashed border-[#E9EAEB] bg-[#F7F8FA]/50 flex flex-col items-center text-center">
                                            <img src={faqIcon} alt="No tickets" className="w-[32px] h-[32px] opacity-20 mb-3" />
                                            <span className="text-black font-bold text-[15px]">All resolved</span>
                                            <p className="text-black/50 text-[13px] mt-1">You have no active support requests.</p>
                                        </div>
                                    )}

                                    {/* Raise Ticket Button (Primary Action) */}
                                    <div className="w-full mt-[18px]">
                                        <button 
                                            onClick={handleRaiseTicket}
                                            disabled={isLoadingSupport}
                                            className="w-full h-[48px] rounded-full bg-black text-white font-medium text-[15px] flex items-center justify-center transition-transform active:scale-95 disabled:opacity-50"
                                        >
                                            {isLoadingSupport ? "Processing..." : "Raise a New Ticket"}
                                        </button>
                                    </div>

                                    {/* My Support Requests Link */}
                                    <div
                                        onClick={() => navigate('/account-settings/support-requests')}
                                        className="mt-[12px] w-full h-[44px] px-[20px] rounded-[12px] border border-[#E9EAEB] flex items-center justify-between bg-white cursor-pointer active:bg-[#F7F8FA] transition-all"
                                    >
                                        <span className="text-black font-medium text-[14px] font-satoshi">My Support Requests</span>
                                        <img src={chevronForward} alt="Go" className="w-[16px] h-[16px] opacity-70" />
                                    </div>
                                </div>
                            );
                        })()}

                        {/* BROWSE CATEGORIES */}
                        <div className="mt-[18px] w-full flex flex-col items-start">
                            <span className="text-black/60 font-medium text-[14px] uppercase font-satoshi">Browse Categories</span>
                            <div className="mt-[12px] w-[362px] flex flex-col rounded-[12px] border border-[#E9EAEB] bg-white overflow-hidden">
                                {[
                                    { label: "General Issues", icon: generalIssuesIcon, route: "/help/category/general-issues" },
                                    { label: "FAQs", icon: faqIcon, route: "/help/category/faqs" },
                                    { label: "Grid.Pe Wallet FAQs", icon: walletIcon, route: "/help/category/wallet-faqs" },
                                    { label: "Safety Toolkit", icon: safetyIcon, route: "/help/category/safety" }
                                ].map((item, index, array) => (
                                    <button
                                        key={item.label}
                                        onClick={() => navigate(item.route)}
                                        className={`w-full h-[44px] pl-3 pr-[14px] py-[10px] flex items-center justify-between cursor-pointer active:bg-[#F7F8FA] transition-colors ${index !== array.length - 1 ? 'border-b border-[#E9EAEB]' : ''}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <img src={item.icon} alt="" className="w-[18px] h-[18px]" />
                                            <span className="text-black font-medium text-[14px] font-satoshi">{item.label}</span>
                                        </div>
                                        <img src={chevronForward} alt="Go" className="w-[20px] h-[20px] [filter:invert(53%)_sepia(0%)_saturate(0%)_hue-rotate(174deg)_brightness(94%)_contrast(88%)]" style={{ filter: 'grayscale(100%) opacity(0.5)' }} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* CONTACT US */}
                        <div className="mt-[18px] w-full flex flex-col items-start px-0 pb-6">
                            <span className="text-black/60 font-medium text-[14px] uppercase font-satoshi mb-[12px]">Contact Us</span>

                            {/* Chat Button */}
                            <div
                                onClick={() => navigate('/help/chat')}
                                className="w-[362px] h-[72px] px-[14px] rounded-[13px] border border-[#E9EAEB] bg-white flex items-center cursor-pointer active:bg-[#F7F8FA] transition-all relative"
                            >
                                <img src={chatIcon} alt="Chat" className="w-[18px] h-[18px] absolute top-[12px] left-[12px]" />
                                <div className="flex flex-col items-start pl-[36px]">
                                    <span className="text-black font-medium text-[14px] font-satoshi">Chat with us</span>
                                    <p className="mt-[2px] text-[#7E7E7E] font-medium text-[12px] font-satoshi leading-snug">
                                        Zing is here to help! Chat with Zing to clear your doubts.
                                    </p>
                                </div>
                                <img src={chevronForward} alt="Go" className="w-[20px] h-[20px] absolute top-[12px] right-[14px] [filter:invert(53%)_sepia(0%)_saturate(0%)_hue-rotate(174deg)_brightness(94%)_contrast(88%)]" />
                            </div>

                            {/* Call Button - Black Fill */}
                            <div
                                onClick={() => window.location.href = 'tel:+9118001234567'}
                                className="mt-[12px] w-[362px] h-[72px] px-[14px] rounded-[13px] bg-black flex items-center cursor-pointer active:opacity-90 transition-all relative"
                            >
                                <img src={callFillIcon} alt="Call" className="w-[18px] h-[18px] absolute top-[12px] left-[12px] brightness-0 invert" />
                                <div className="flex flex-col items-start pl-[36px]">
                                    <span className="text-white font-medium text-[14px] font-satoshi">Call us</span>
                                    <p className="mt-[2px] text-white/70 font-medium text-[12px] font-satoshi leading-snug">
                                        Call us for URGENT delivery related issues.
                                    </p>
                                </div>
                                <img src={chevronForward} alt="Go" className="w-[20px] h-[20px] absolute top-[12px] right-[14px] brightness-0 invert" />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "Banking" && (
                    <div className="w-full flex flex-col items-start px-0">
                        {bankingStep === "list" ? (
                            <>
                                {/* Initial Banking View */}
                                {/* Header Row: 19px below slider menu */}
                                <div className="mt-[19px] flex items-center shrink-0">
                                    <img src={bankIcon} alt="Banking" className="w-[24px] h-[24px]" />
                                    <h2 className="ml-[12px] text-black font-bold text-[22px] leading-tight text-left">
                                        Banking
                                    </h2>
                                </div>

                                {/* Description: 18px below */}
                                <p className="mt-[18px] text-black font-medium text-[14px] leading-tight text-left shrink-0">
                                    {addedAccounts.length > 0
                                        ? "Manage your bank accounts here. Your primary account will be used for all payouts."
                                        : "You don't have any bank accounts added yet. Please add a bank account, this is the account where you will receive your payouts. So make sure all the details entered are correct."
                                    }
                                </p>

                                {/* Section Title: 24px below */}
                                <h2 className="mt-[24px] text-black font-bold text-[22px] leading-tight text-left shrink-0">
                                    Bank Accounts
                                </h2>

                                {addedAccounts.length === 0 ? (
                                    /* Empty State Card: 12px below heading */
                                    <div className="mt-[12px] w-[362px] h-[124px] rounded-[12px] border border-[#E9EAEB] flex items-center justify-center p-[20px] shrink-0">
                                        <p className="text-[#A0A0A0] font-medium text-[14px] leading-tight text-center w-[334px]">
                                            You don't have any bank accounts added yet. Please add a bank account to proceed.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Bank Account Cards List: 12px below heading */}
                                        <div className="mt-[12px] w-full flex flex-col gap-[12px] shrink-0">
                                            {addedAccounts.map((acc, index) => (
                                                <SwipeableBankCard
                                                    key={acc.id}
                                                    acc={acc}
                                                    index={index}
                                                    onDelete={handleDeleteAccount}
                                                    getBankLogo={getBankLogo}
                                                    userName={riderName}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}

                                {/* Spacer to push button to bottom */}
                                <div className="flex-1 min-h-[40px]" />

                                {/* Add Bank Account CTA */}
                                <button
                                    onClick={handleConnectBank}
                                    className="w-[362px] h-[48px] bg-black text-white rounded-full font-medium text-[16px] flex items-center justify-center cursor-pointer active:scale-[0.98] transition-transform mb-8 self-center"
                                >
                                    Add Another Bank
                                </button>
                            </>
                        ) : bankingStep === "add_wifi" ? (
                            <>
                                {/* WiFi Detection "Section" */}
                                <h2 className="mt-[19px] text-black font-bold text-[22px] leading-tight text-left shrink-0">
                                    Bank Accounts
                                </h2>
                                <div className="mt-[12px] w-[362px] h-auto min-h-[124px] rounded-[12px] border border-[#E9EAEB] flex flex-col items-center justify-center p-[20px] shrink-0">
                                    <div className="flex flex-col items-center gap-[12px]">
                                        <p className="text-[#333333] font-medium text-[14px] leading-tight text-center w-[300px]">
                                            We need to verify this device with your phone number. Please turn off your 'WiFi' and stay connected through mobile data.
                                        </p>
                                        <button
                                            onClick={handleTurnOffWifi}
                                            className="w-[322px] h-[48px] bg-black text-white rounded-full font-medium text-[16px] flex items-center justify-center cursor-pointer active:scale-[0.98] transition-transform"
                                        >
                                            Turn off WiFi
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1" />
                            </>
                        ) : bankingStep === "validate_sim" ? (
                            <>
                                {/* Validate SIM Card Section */}
                                <h2 className="mt-[19px] text-black font-bold text-[22px] leading-tight text-left shrink-0">
                                    Bank Accounts
                                </h2>
                                <div className="mt-[12px] w-[362px] h-auto rounded-[12px] border border-[#E9EAEB] flex flex-col items-start p-[20px] shrink-0">
                                    <div className="flex items-center gap-[10px]">
                                        <img src={simCardIcon} alt="SIM" className="w-[18px] h-[22px]" />
                                        <h3 className="text-black font-bold text-[18px]">Validate SIM card</h3>
                                    </div>
                                    <p className="mt-[6px] text-[#A0A0A0] font-medium text-[14px] leading-tight text-left">
                                        Select the linked SIM to verify your number. Please do not go back or close the app.
                                    </p>
                                    <div className="mt-[20px] flex gap-[9px] w-full">
                                        {simCards.map((sim) => (
                                            <button
                                                key={sim.id}
                                                onClick={() => {
                                                    setSelectedSim(sim.id);
                                                    setSelectedSimPhoneNumber(sim.phoneNumber);
                                                }}
                                                className={`flex-1 h-[104px] rounded-[16px] border flex flex-col p-[12px] relative transition-all text-left
                                                    ${selectedSim === sim.id ? 'border-[#5260FE] bg-white ring-1 ring-[#5260FE]' : 'border-[#E9EAEB] bg-white'}
                                                `}
                                            >
                                                <img src={sim.logo} alt={sim.carrier} className="h-[24px] w-fit object-contain mb-2" />
                                                <span className="font-bold text-[15px] text-black pt-1">{sim.label}</span>
                                                <span className="font-medium text-[14px] text-[#A0A0A0]">{sim.carrier}</span>
                                                <div className="absolute top-[12px] right-[12px]">
                                                    <img
                                                        src={selectedSim === sim.id ? radioSelected : radioNotSelected}
                                                        className="w-[20px] h-[20px]"
                                                    />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    <p className="mt-[20px] text-black font-bold text-[12px]">Please note: <span className="font-medium text-[#A0A0A0]">regular carrier charges may apply.</span></p>
                                    <p className="mt-[16px] text-black font-medium text-[14px] leading-tight text-left">
                                        The message will be auto composed for you, simply select your SIM and tap ‘Verify’. The SMS will appear in the following format:
                                    </p>
                                    <div className="mt-[16px] w-full p-[16px] bg-[#F9F9F9] rounded-[12px] border border-[#F0F0F0]">
                                        <pre className="text-black font-medium text-[14px] font-sans leading-normal">
                                            DPREG{"\n"}
                                            {riderUuid || "9ab12cde-34f5-4a1b-8c7d-92f4e8bb12ef"}{"\n"}
                                            {selectedSimPhoneNumber?.replace("+91 ", "") || "9898989898"}
                                        </pre>
                                    </div>
                                </div>
                                <div className="flex-1 min-h-[40px]" />
                                <button
                                    onClick={() => {
                                        setBankingStep("verifying_sim");
                                        if (Platform.OS === 'web') {
                                            setVerificationState("loading");
                                            setTimeout(() => {
                                                setVerificationState("success");
                                                showToast("Device verified successfully", "success");
                                            }, 3000);
                                        }
                                    }}
                                    className="w-[362px] h-[48px] bg-black text-white rounded-full font-medium text-[16px] flex items-center justify-center cursor-pointer active:scale-[0.98] transition-transform mb-8 self-center"
                                >
                                    Verify
                                </button>
                            </>
                        ) : bankingStep === "verifying_sim" ? (
                            <>
                                {/* Validating SIM (Status) Section */}
                                <h2 className="mt-[19px] text-black font-bold text-[22px] leading-tight text-left shrink-0">
                                    Bank Accounts
                                </h2>
                                <div className="mt-[12px] w-[362px] h-auto min-h-[174px] rounded-[12px] border border-[#E9EAEB] flex flex-col items-start p-[20px] shrink-0">
                                    <div className="flex items-center gap-[10px]">
                                        <img src={simCardIcon} alt="SIM" className="w-[18px] h-[22px]" />
                                        <h3 className="text-black font-bold text-[18px]">Validating SIM</h3>
                                    </div>
                                    <div className="mt-[24px] flex w-full relative pl-[28px]">
                                        <div className={`absolute left-[9px] top-[14px] w-[2px] h-[60px] z-0
                                            ${verificationState === 'success' ? 'bg-[#27AE60]' : 'bg-[#E9EAEB]'}
                                        `} />
                                        <div className="flex flex-col gap-[28px] w-full">
                                            <div className="flex items-start gap-[12px] relative">
                                                <div className="absolute left-[-28px] top-[4px] flex items-center justify-center z-10">
                                                    {verificationState === 'loading' ? (
                                                        <div className="w-[20px] h-[20px] rounded-full border-[2px] border-[#5260FE] flex items-center justify-center">
                                                            <div className="w-[10px] h-[10px] rounded-full bg-[#5260FE] animate-pulse" />
                                                        </div>
                                                    ) : verificationState === 'error' ? (
                                                        <div className="w-[20px] h-[20px] rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-[10px]">!</div>
                                                    ) : (
                                                        <img src={successCheckIcon} className="w-[20px] h-[20px]" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-black font-medium text-[14px]">Sending verification SMS</span>
                                                    {verificationState === 'error' && <span className="text-red-500 font-medium text-[12px]">Unable to send SMS</span>}
                                                    {verificationState === 'success' && <span className="text-[#27AE60] font-medium text-[12px]">SMS sent successfully</span>}
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-[12px] relative">
                                                <div className="absolute left-[-28px] top-[4px] flex items-center justify-center z-10">
                                                    {verificationState === 'success' ? (
                                                        <img src={successCheckIcon} className="w-[20px] h-[20px]" />
                                                    ) : (
                                                        <div className="w-[20px] h-[20px] rounded-full border-[2px] border-[#E9EAEB]" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-black font-medium text-[14px]">Verifying Mobile Number</span>
                                                    {verificationState === 'success' && <span className="text-[#27AE60] font-medium text-[12px]">Verified</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 min-h-[40px]" />
                                {verificationState === 'loading' ? (
                                    <button disabled className="w-[362px] h-[48px] bg-[#DFDFDF] text-white rounded-full font-medium text-[16px] flex items-center justify-center mb-8 self-center">
                                        Setting up please wait...
                                    </button>
                                ) : verificationState === 'error' ? (
                                    <button onClick={() => { setVerificationState("loading"); setTimeout(() => setVerificationState("success"), 3000); }} className="w-[362px] h-[48px] bg-black text-white rounded-full font-medium text-[16px] flex items-center justify-center cursor-pointer active:scale-[0.98] transition-transform mb-8 self-center">
                                        Retry
                                    </button>
                                ) : (
                                    <button onClick={() => setBankingStep("linked_accounts")} className="w-[362px] h-[48px] bg-black text-white rounded-full font-medium text-[16px] flex items-center justify-center cursor-pointer active:scale-[0.98] transition-transform mb-8 self-center">
                                        Device Verified
                                    </button>
                                )}
                            </>
                        ) : bankingStep === "linked_accounts" ? (
                            <ManualBankForm
                                phoneNumber={selectedSimPhoneNumber || phoneNumber || "+91 8787311620"}
                                riderName={fullName || "Rider"}
                                isSubmitting={isManualSubmitting}
                                onProceed={async (bankData: { accountHolderName: string; bankName: string; accountNumber: string; ifscCode: string }) => {
                                    setIsManualSubmitting(true);
                                    
                                    try {
                                        // 1. Trigger the create-verification-order Edge Function
                                        const { data: rpcData, error: rpcError } = await supabase.functions.invoke('create-verification-order', {
                                            body: {
                                                account_holder_name: bankData.accountHolderName,
                                                bank_name: bankData.bankName,
                                                account_number: bankData.accountNumber,
                                                ifsc_code: bankData.ifscCode,
                                                rider_id: riderUuid
                                            }
                                        });
                                        
                                        if (rpcError) throw new Error(rpcError.message);
                                        
                                        // 2. Load and Open Razorpay Checkout
                                        const scriptLoaded = await loadRazorpayScript();
                                        if (!scriptLoaded) throw new Error("Failed to load payment gateway");
                                        
                                        const options = {
                                            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                                            amount: rpcData.order.amount,
                                            currency: rpcData.order.currency,
                                            name: "GridPe Rider",
                                            description: "Bank Account Verification",
                                            order_id: rpcData.order.id,
                                            handler: (response: any) => {
                                                // Success: Start polling
                                                setCheckingBankAccountId(rpcData.accountId);
                                                setBankingStep("verifying_bank");
                                                setIsManualSubmitting(false);
                                            },
                                            modal: {
                                                ondismiss: () => {
                                                    setIsManualSubmitting(false);
                                                    showToast("Verification cancelled. Please complete the ₹1 payment to link your account.", "error");
                                                }
                                            },
                                            prefill: {
                                                name: fullName || "Rider",
                                                contact: selectedSimPhoneNumber || phoneNumber
                                            },
                                            theme: { color: "#000000" }
                                        };
                                        
                                        const rzp = new (window as any).Razorpay(options);
                                        rzp.open();
                                        
                                    } catch (err: any) {
                                        console.error('Penny Drop Error:', err);
                                        showToast(err.message || "Failed to initiate verification", "error");
                                        setIsManualSubmitting(false);
                                    }
                                }}
                            />
                        ) : bankingStep === "verifying_bank" ? (
                            <>
                                {/* Verifying with Bank Screen */}
                                <h2 className="mt-[19px] text-black font-bold text-[22px] leading-tight text-left shrink-0">
                                    Bank Accounts
                                </h2>
                                <div className="mt-20 flex flex-col items-center justify-center w-full">
                                    <div className="w-[48px] h-[48px] border-4 border-black/10 border-t-black rounded-full animate-spin mb-6" />
                                    <h3 className="text-black font-bold text-[18px]">Verifying with Bank...</h3>
                                    <p className="mt-2 text-black/60 text-[14px] text-center max-w-[280px]">
                                        We are confirming your details with the bank. This may take a moment.
                                    </p>
                                </div>
                            </>
                        ) : bankingStep === "success" ? (
                            <>
                                {/* Success View */}
                                <h2 className="mt-[19px] text-black font-bold text-[22px] leading-tight text-left shrink-0">
                                    Bank Accounts
                                </h2>

                                <div className="flex items-start gap-[12px] mt-[18px]">
                                    <img src={bankIcon} className="w-[24px] h-[24px]" alt="Bank" />
                                    <h3 className="text-black font-bold text-[18px] leading-[1.2]">
                                        {successfullyLinkedBank} has been successfully added!
                                    </h3>
                                </div>

                                {/* Newly Added Card */}
                                <div className="mt-[24px] w-[362px] h-auto p-[16px] rounded-[16px] border border-[#E9EAEB] bg-white flex flex-col relative">
                                    <div className="flex items-center gap-[12px]">
                                        <div className="w-[36px] h-[36px] flex items-center justify-center">
                                            {successfullyLinkedBank && getBankLogo(successfullyLinkedBank) ? (
                                                <img
                                                    src={getBankLogo(successfullyLinkedBank) || undefined}
                                                    alt=""
                                                    className="w-full h-full object-contain"
                                                />
                                            ) : (
                                                <div className="w-full h-full rounded-full bg-[#5260FE] flex items-center justify-center text-white font-bold text-[16px]">
                                                    {successfullyLinkedBank?.charAt(0) || "B"}
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="text-black font-bold text-[18px] flex-1">{successfullyLinkedBank}</h3>
                                        {addedAccounts.length === 1 && (
                                            <div className="h-[24px] px-[12px] rounded-full bg-[#1CB956] flex items-center justify-center">
                                                <span className="text-white text-[12px] font-bold">Primary</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-[8px] flex flex-col items-start">
                                        <span className="text-black font-medium text-[14px]">Savings account</span>
                                        <span className="mt-[4px] text-black font-medium text-[14px]">XXXX XXXX XXXX 0960</span>
                                        <span className="mt-[4px] text-black font-bold text-[14px]">{riderName}</span>
                                    </div>
                                </div>

                                <div className="flex-1" />

                                <div className="flex flex-col gap-[12px] w-full mb-8 items-center">
                                    <button
                                        onClick={() => setBankingStep("linked_accounts")}
                                        className="w-[362px] h-[48px] bg-black text-white rounded-full font-medium text-[16px] flex items-center justify-center cursor-pointer active:scale-[0.98] transition-transform"
                                    >
                                        Add another bank
                                    </button>
                                    <button
                                        onClick={() => setBankingStep("list")}
                                        className="w-[362px] h-[48px] border border-black text-black rounded-full font-medium text-[16px] flex items-center justify-center cursor-pointer active:scale-[0.98] transition-transform bg-white"
                                    >
                                        Save & Exit
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Bank Details Form Section */}
                                <h2 className="mt-[19px] text-black font-bold text-[22px] leading-tight text-left shrink-0">
                                    Add Bank Account
                                </h2>
                                <p className="mt-[18px] text-[#A0A0A0] font-medium text-[14px] leading-tight text-left">
                                    Please enter your bank account details below to receive payouts.
                                </p>
                                <div className="mt-[24px] w-[362px] p-4 bg-gray-50 rounded-lg text-center text-gray-400 italic">
                                    Bank details form section coming soon...
                                </div>
                                <div className="flex-1" />
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Corbado Passkey Handlers */}
            {!passkeyCreated && connectToken && (
                <div style={{ height: 0, overflow: 'hidden' }}>
                    <CorbadoConnectAppend
                        appendTokenProvider={async () => connectToken!}
                        onSkip={(status: any) => {
                            console.log('Passkey append skipped:', status)
                            setConnectToken(null)
                        }}
                        onComplete={(status: any, clientState: any) => {
                            console.log('Passkey created successfully:', status)
                            setPasskeyCreated(true)
                            setConnectToken(null)
                            setHasPasskeys(true)
                            // Add the passkey to the saved list
                            const platformName = navigator.userAgent.includes('Mac') || navigator.userAgent.includes('iPhone')
                                ? 'iCloud Keychain'
                                : navigator.userAgent.includes('Android')
                                    ? 'Google Password Manager'
                                    : 'Windows Hello';
                            setSavedPasskeys(prev => [...prev, {
                                id: crypto.randomUUID(),
                                name: platformName,
                                createdAt: new Date()
                            }]);
                            setSecurityStep('passkeys')
                            showToast("Passkey Added Successfully", "success")
                        }}
                    />
                </div>
            )}

            {/* Support Status Bottom Sheet */}
            <SupportStatusBottomSheet
                isOpen={isSupportStatusOpen}
                onClose={() => setIsSupportStatusOpen(false)}
                ticketId={selectedTicket?.id || ""}
                ticketTitle={selectedTicket?.title || ""}
                ticketAmount={selectedTicket?.amount}
                steps={supportStatusSteps}
                isResolved={ongoingSupport?.status === "Resolved"}
                onUploadComplete={handleUploadComplete}
            />

            {/* Deletion Confirmation Popup */}
            <AnimatePresence>
                {isDeletePopupOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                            onClick={() => setIsDeletePopupOpen(false)}
                        />
                        <motion.div
                            initial={{ y: 100, opacity: 0, x: "-50%" }}
                            animate={{ y: 0, opacity: 1, x: "-50%" }}
                            exit={{ y: 100, opacity: 0, x: "-50%" }}
                            className="fixed bottom-[20px] left-1/2 w-[362px] h-[257px] bg-white rounded-[24px] p-[16px] flex flex-col z-50 shadow-xl"
                        >
                            <div className="flex flex-col gap-[16px]">
                                <div className="flex items-center gap-[8px]">
                                    <img
                                        src={deleteIcon}
                                        alt="Delete"
                                        className="w-[20px] h-[20px]"
                                    />
                                    <h2 className="text-black font-bold text-[18px] leading-tight">Delete Bank Account?</h2>
                                </div>
                                <p className="text-black font-medium text-[16px] leading-[1.3]">
                                    {accountToDelete?.is_primary 
                                        ? "Are you sure you want to delete your Primary bank accoount? Your payouts will fail without a primary bank account."
                                        : `Are you sure you want to delete this bank account ending with ${accountToDelete?.account_number || "XXXX 0960"}?`
                                    }
                                </p>
                            </div>

                            <div className="mt-[40px] flex flex-col gap-[12px]">
                                <button
                                    onClick={() => setIsDeletePopupOpen(false)}
                                    className="w-[330px] h-[44px] bg-[#5260FE] text-white rounded-full font-medium text-[16px] transition-transform active:scale-[0.98] self-center"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="w-[330px] h-[44px] bg-white border border-[#FF3B30] text-[#FF3B30] rounded-full font-medium text-[16px] transition-transform active:scale-[0.98] self-center"
                                >
                                    Yes, Delete
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default AccountSettings;

