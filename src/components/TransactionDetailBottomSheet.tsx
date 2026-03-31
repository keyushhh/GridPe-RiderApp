import React, { useEffect, useState, useCallback } from 'react';
import downloadIcon from "../assets/download.svg";
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import jsPDF from 'jspdf';
import { format, parse } from 'date-fns';

export interface Transaction {
  id: string | number;
  type: string;
  title?: string;
  description?: string;
  amount: number | string;
  fee: number;
  tds: number;
  final_amount: number;
  status: 'completed' | 'pending' | 'processing' | 'failed' | 'success';
  created_at: string;
  reference_id: string;
  rider_id: string;
  wallet_balance_snapshot?: number;
  metadata?: any;
}

interface TransactionDetailBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

const TransactionDetailBottomSheet: React.FC<TransactionDetailBottomSheetProps> = ({
  isOpen,
  onClose,
  transaction
}) => {
  const { riderId } = useAuth();
  const [isAnimating, setIsAnimating] = useState(false);
  const [dragY, setDragY] = useState(0);
  const startY = React.useRef(0);
  const [totalInstantWithdrawals, setTotalInstantWithdrawals] = useState(0);
  const [bankInfo, setBankInfo] = useState<any>(null);

  const fetchDeductions = useCallback(async (start: string, end: string) => {
    if (!riderId || !transaction) return;
    try {
      const { data, error } = await supabase
        .from('rider_transactions')
        .select('amount')
        .eq('rider_id', riderId)
        .eq('type', 'instant_withdrawal')
        .eq('status', 'completed')
        .gte('created_at', start)
        .lte('created_at', end);
      
      if (error) throw error;
      const total = data?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      setTotalInstantWithdrawals(total);
    } catch (err) {
      console.error("Error fetching deductions:", err);
    }
  }, [riderId, transaction]);

  const fetchBankInfo = useCallback(async () => {
    if (!riderId) return;
    try {
      // Get primary bank for the rider
      const { data: riderData } = await supabase.from('riders').select('id').eq('rider_id', riderId).single();
      if (!riderData) return;

      const { data: bankData } = await supabase
        .from('rider_bank_accounts')
        .select('bank_name, account_number_masked')
        .eq('rider_id', riderData.id)
        .eq('is_primary', true)
        .maybeSingle();
      
      if (bankData) setBankInfo(bankData);
    } catch (err) {
      console.error("Error fetching bank info:", err);
    }
  }, [riderId]);

  useEffect(() => {
    if (isOpen && transaction) {
      setIsAnimating(true);
      setDragY(0);
      fetchBankInfo();

      if (transaction.type === 'auto_payout') {
        // Try to parse period from description "Auto payout for DD MMM - DD MMM"
        const desc = transaction.description || "";
        const match = desc.match(/for (\d{2} \w{3}) - (\d{2} \w{3})/);
        if (match) {
          const currentYear = new Date().getFullYear();
          try {
            const startDate = parse(`${match[1]} ${currentYear}`, 'dd MMM yyyy', new Date());
            const endDate = parse(`${match[2]} ${currentYear}`, 'dd MMM yyyy', new Date());
            // Adjust end date to end of day
            endDate.setHours(23, 59, 59, 999);
            fetchDeductions(startDate.toISOString(), endDate.toISOString());
          } catch (e) { console.error("Date parse error", e); }
        }
      }
    } else {
      setTimeout(() => setIsAnimating(false), 300);
      setTotalInstantWithdrawals(0);
    }
  }, [isOpen, transaction, fetchDeductions, fetchBankInfo]);

  const generateInvoice = (tx: Transaction) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Grid.pe', 20, 20);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Payout Invoice', 20, 28);
    doc.text(`Reference: ${tx.reference_id}`, 20, 34);
    doc.text(`Date: ${format(new Date(tx.created_at), 'dd MMM yyyy')}`, 20, 40);
    
    // Divider
    doc.line(20, 45, pageWidth - 20, 45);
    
    // Rider details
    doc.setFont('helvetica', 'bold');
    doc.text('Rider Details', 20, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(`Rider ID: ${tx.rider_id}`, 20, 63);
    
    // Amount breakdown
    doc.setFont('helvetica', 'bold');
    doc.text('Amount Breakdown', 20, 80);
    doc.setFont('helvetica', 'normal');
    doc.text('Transfer Amount:', 20, 90);
    doc.text(`+INR ${Number(tx.amount).toFixed(2)}`, pageWidth - 20, 90, { align: 'right' });
    doc.text('Platform Fee:', 20, 98);
    doc.text(`-INR ${Number(tx.fee || 0).toFixed(2)}`, pageWidth - 20, 98, { align: 'right' });
    doc.text('TDS/Tax:', 20, 106);
    doc.text(`INR ${Number(tx.tds || 0).toFixed(2)}`, pageWidth - 20, 106, { align: 'right' });
    
    // Divider
    doc.line(20, 112, pageWidth - 20, 112);
    
    // Final amount
    doc.setFont('helvetica', 'bold');
    doc.text('Final Amount to Bank:', 20, 120);
    doc.text(`INR ${Number(tx.final_amount).toFixed(2)}`, pageWidth - 20, 120, { align: 'right' });
    
    // Footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('This is a system-generated invoice. For queries contact support@grid.pe', 
      pageWidth / 2, 270, { align: 'center' });
    
    // Download
    doc.save(`GridPe-Invoice-${tx.reference_id}.pdf`);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaY = e.touches[0].clientY - startY.current;
    if (deltaY > 0) {
      setDragY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (dragY > 100) {
      onClose();
    }
    setDragY(0);
  };

  if (!isOpen && !isAnimating) return null;
  if (!transaction) return null;

  const renderContent = () => {
    const { type, amount, final_amount, status, description, created_at, wallet_balance_snapshot } = transaction;
    const formattedAmount = Number(amount).toLocaleString();
    const formattedFinalAmount = Number(final_amount).toLocaleString();
    const txDate = format(new Date(created_at), 'dd MMM yyyy');
    const bankName = bankInfo?.bank_name || "Primary Bank";
    const last4 = bankInfo?.account_number_masked?.slice(-4) || "****";

    // VARIANT: Auto Payout
    if (type === 'auto_payout') {
      return (
        <div className="flex flex-col">
          <div className="flex flex-col items-center">
            <h2 className="font-bold text-[24px] text-black text-center leading-tight">Auto Payout Received</h2>
            <p className="mt-[8px] font-medium text-[14px] text-center text-[#616161] leading-tight px-4">{description}</p>
          </div>

          <div className="mt-[24px] flex flex-col">
            <h3 className="text-[16px] font-bold text-black mb-[12px]">Amount breakdown</h3>
            <div className="flex justify-between items-center mb-[8px]">
              <span className="text-[14px] font-medium text-[#616161]">Total Earnings</span>
              <span className="text-[14px] font-medium text-black">+₹{formattedAmount}</span>
            </div>
            {totalInstantWithdrawals > 0 && (
              <div className="flex justify-between items-center mb-[8px]">
                <span className="text-[14px] font-medium text-[#616161]">Deductions (Instant Payout taken):</span>
                <span className="text-[14px] font-medium text-[#FF3B30]">-₹{totalInstantWithdrawals.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-[#F5F5F5] mb-[8px]">
              <span className="text-[16px] font-bold text-[#34C759]">Final Amount to Bank:</span>
              <span className="text-[16px] font-bold text-[#34C759]">₹{formattedFinalAmount}</span>
            </div>
            <div className="flex justify-between items-center mb-[8px]">
              <span className="text-[14px] font-medium text-[#616161]">Bank:</span>
              <span className="text-[14px] font-medium text-black">{bankName} (XXXX {last4})</span>
            </div>
          </div>

          <p className="mt-[32px] text-[14px] font-medium text-[#616161] text-center leading-tight px-6 underline decoration-black/10">An invoice was generated and sent to your registered email id.</p>

          <button
            onClick={() => generateInvoice(transaction)}
            className="mt-[24px] w-full h-[48px] rounded-full bg-[#5260FE] flex items-center justify-center gap-2 text-[16px] font-medium text-white shadow-[0px_4px_12px_rgba(82,96,254,0.2)] transition-all active:scale-[0.98]"
          >
            Download Invoice
            <img src={downloadIcon} alt="Download" className="w-[18px] h-[18px]" />
          </button>
        </div>
      );
    }

    // VARIANT: Instant Withdrawal
    if (type === 'instant_withdrawal') {
      const isPending = status === 'pending' || status === 'processing';
      const balanceSnapshot = Number(wallet_balance_snapshot || 0);
      const adjustment = balanceSnapshot - Number(amount);

      return (
        <div className="flex flex-col">
          <div className="flex flex-col items-center">
            <h2 className="font-bold text-[24px] text-black text-center leading-tight">Instant Payout</h2>
            <p className="mt-[8px] font-medium text-[14px] text-center text-[#616161] leading-tight px-4">
              {isPending ? "An Instant Payout request was received and currently under review." : "Transferred to bank successfully."}
            </p>
          </div>

          <div className="mt-[24px] flex flex-col">
            <h3 className="text-[16px] font-bold text-black mb-[12px]">Amount breakdown</h3>
            <div className="flex justify-between items-center mb-[8px]">
              <span className="text-[14px] font-medium text-[#616161]">Total Earnings</span>
              <span className="text-[14px] font-medium text-black">+₹{balanceSnapshot.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center mb-[8px]">
              <span className="text-[14px] font-medium text-[#616161]">Instant Payout:</span>
              <span className="text-[14px] font-medium text-[#FF3B30]">-₹{Number(amount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center mb-[8px]">
              <span className="text-[14px] font-medium text-[#616161]">Balance Adjustment:</span>
              <span className="text-[14px] font-medium text-black">₹{adjustment.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-[#F5F5F5] mb-[8px]">
              <span className="text-[16px] font-bold text-[#34C759]">Final Amount to Bank:</span>
              <span className="text-[16px] font-bold text-[#34C759]">₹{formattedFinalAmount}</span>
            </div>
            <div className="flex justify-between items-center mb-[8px]">
              <span className="text-[14px] font-medium text-[#616161]">Bank:</span>
              <span className="text-[14px] font-medium text-black">{bankName}</span>
            </div>
          </div>

          <p className="mt-[32px] text-[14px] font-medium text-[#616161] text-center leading-tight px-6 underline decoration-black/10">
            {isPending ? "An invoice will be generated once processed." : "An invoice has been sent to your email."}
          </p>

          <button onClick={onClose} className="mt-[24px] w-full h-[48px] rounded-full bg-[#5260FE] text-white font-medium text-[16px] shadow-[0px_4px_12px_rgba(82,96,254,0.2)]">Close</button>
        </div>
      );
    }

    // VARIANT: Celebration Types (Tips, Bonus, Referral)
    let titleText = "Success!";
    let emoji = "";
    let desc = "";
    let disclaimer = "";

    if (type === 'delivery_tip') {
      titleText = "You've got a Tip!";
      emoji = "🤩";
      desc = `Amazing job! You just received a tip of ₹${formattedAmount} for your delivery on ${txDate}. Your hard work is clearly paying off!`;
      disclaimer = "Disclaimer: This tip goes 100% to you. Grid.pe doesn't charge any fees on tips, and it has been sent directly to your linked bank account.";
    } else if (type === 'bonus') {
      titleText = "Milestone Reached!";
      emoji = "🚀";
      desc = `You've earned a bonus of ₹${formattedAmount} for your hard work on ${txDate}. You're absolutely crushing it!`;
      disclaimer = "Disclaimer: This bonus has been added to your Grid.pe Wallet. It will be included in your next scheduled auto-payout.";
    } else if (type === 'referral_reward') {
      titleText = "Your Squad is Growing!";
      emoji = "🏆";
      const referredId = description?.match(/for (GRDPE-\w+)/)?.[1] || "a new rider";
      desc = `You just received a ₹${formattedAmount} referral reward for bringing ${referredId} on board. Thanks for helping us grow the Grid.pe family!`;
      disclaimer = "Disclaimer: This reward is now sitting in your Grid.pe Wallet. It will be settled along with your next auto-payout.";
    }

    return (
      <div className="flex flex-col items-center">
        <h2 className="font-bold text-[24px] text-black text-center leading-tight">{titleText} {emoji}</h2>
        <p className="mt-[16px] font-medium text-[16px] text-[#616161] text-center leading-[1.4] px-2">{desc}</p>

        <div className="mt-[32px] w-[64px] h-[64px] rounded-full bg-[#1CB95610] flex items-center justify-center">
          <div className="w-[44px] h-[44px] rounded-full bg-[#1CB956] flex items-center justify-center shadow-lg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M5 13L9 17L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <p className="mt-[32px] text-[14px] font-medium text-black text-center leading-tight px-4 opacity-70 italic">{disclaimer}</p>

        <button onClick={onClose} className="mt-[32px] w-full h-[48px] rounded-full bg-[#5260FE] text-white font-medium text-[16px] shadow-[0px_4px_12px_rgba(82,96,254,0.2)]">Close</button>
      </div>
    );
  };

  return (
    <div className={`fixed inset-0 z-[100] flex items-end justify-center transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className={`relative bg-white w-[362px] rounded-[24px] mb-[21px] flex flex-col pt-[12px] px-[14px] pb-[14px] z-10 transition-transform duration-300`}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ transform: `translateY(${isOpen ? `${dragY}px` : '100%'})` }}
      >
        <div className="w-[40px] h-[4px] bg-[#E0E0E0] rounded-full mx-auto mb-6" />
        {renderContent()}
      </div>
    </div>
  );
};

export default TransactionDetailBottomSheet;
