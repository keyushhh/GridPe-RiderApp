export interface RiderProfile {
    id: string; // database UUID
    rider_id: string; // string-based public ID (e.g., RID001)
    full_name: string;
    phone: string;
    email: string | null;
    kyc_status: 'pending' | 'in_review' | 'verified' | 'rejected' | null;
    profile_url: string | null;
    total_earnings: number;
    is_online: boolean;
    work_city: string | null;
    selected_city: string | null;
    hub_id: string | null;
    zone_id: string | null;
    service_zones?: {
        id: string;
        name: string;
    };
    hubs?: {
        id: string;
        location_name: string;
    };
}

export interface Order {
    id: string;
    user_id: string;
    address_id: string | null;
    rider_id: string | null;
    status: 'pending' | 'accepted' | 'assigned' | 'picked_up' | 'on_the_way' | 'delivered' | 'cancelled';
    delivery_selfie_url?: string;
    pickup_address?: string;
    delivery_tip?: number;
    rider_earnings: number;
    delivery_fee: number;
    pickup_location: string;
    delivery_address_text: string | null;
    customer_phone_number: string | null;
    otp_code: string | null;
    created_at: string;
    accepted_at: string | null;
    picked_up_at: string | null;
    city: string | null;
    zone_id: string | null;
    hub_id: string | null;
    meta_data?: any;
    distance?: number;
    pickup_name?: string;
    total_potential?: number;
    pickup_selfie_url?: string;
}

export interface Shift {
    id: string;
    rider_id: string;
    started_at: string;
    ended_at: string | null;
    is_active: boolean;
    duration_minutes: number | null;
    earnings: number | null;
    hub_name: string | null;
}

export interface Notification {
    id: string | number;
    title: string;
    message: string;
    created_at: string;
    type: string;
    is_read: boolean;
}

export interface SupportTicket {
    id: string;
    rider_id: string;
    title: string;
    category: string;
    status: 'In Progress' | 'Resolved' | 'Closed';
    description?: string;
    amount?: string;
    created_at?: string;
    steps?: any[];
    footerNote?: string;
}

export interface BankAccount {
    id: string;
    rider_id: string;
    bank_name: string;
    account_number: string;
    ifsc_code: string;
    account_holder_name: string;
    is_primary: boolean;
    created_at: string;
}

export interface EarningOverview {
    totalEarnings: number;
    orderEarnings: number;
    totalTips: number;
    deliveryCount: number;
    avgPerHour: number;
    walletBalance: number;
    weekStart: string;
    weekEnd: string;
}

export interface DailyEarning {
    date: string;
    subtext: string;
    amount: number;
    rawDate: string;
    orderEarnings: number;
    tips: number;
    deliveryCount: number;
}

export interface WeeklyEarning {
    date: string;
    subtext: string;
    amount: number;
    weekStart: string;
    weekEnd: string;
    deliveryCount: number;
}
