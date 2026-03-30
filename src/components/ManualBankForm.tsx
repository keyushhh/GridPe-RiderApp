import React, { useState, useEffect, useMemo } from 'react';
import { getBankLogo, BANK_SLUG_MAP } from '../utils/BankLogoMap';
import simCardIcon from '../assets/simcard.svg';
import searchIcon from '../assets/search.svg';
import chevronForward from '../assets/chevron-forward.svg';

interface ManualBankFormProps {
  phoneNumber: string;
  riderName: string;
  isSubmitting?: boolean;
  onProceed: (bankData: any) => void;
}

const ManualBankForm: React.FC<ManualBankFormProps> = ({ phoneNumber, riderName, isSubmitting = false, onProceed }) => {
  const [accountHolderName, setAccountHolderName] = useState(riderName || '');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [branchDetails, setBranchDetails] = useState<{ branch: string; city: string } | null>(null);
  const [isSearchingBank, setIsSearchingBank] = useState(false);
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [isFindingBranch, setIsFindingBranch] = useState(false);

  // Filter banks for autocomplete
  const filteredBanks = useMemo(() => {
    if (!bankName.trim() || !showBankDropdown) return [];
    const query = bankName.toLowerCase();
    return Object.keys(BANK_SLUG_MAP).filter(name => 
      name.toLowerCase().includes(query)
    ).slice(0, 5); // Limit to top 5 hits
  }, [bankName, showBankDropdown]);

  const handleIfscLookup = async (code: string) => {
    if (code.length < 11) {
      setBranchDetails(null);
      return;
    }
    setIsFindingBranch(true);
    try {
      const resp = await fetch(`https://ifsc.razorpay.com/${code}`);
      if (resp.ok) {
        const data = await resp.json();
        setBranchDetails({ branch: data.BRANCH, city: data.CITY });
      } else {
        setBranchDetails(null);
      }
    } catch (err) {
      console.error('IFSC Lookup failed:', err);
      setBranchDetails(null);
    } finally {
      setIsFindingBranch(false);
    }
  };

  // Auto-trigger IFSC lookup when 11 characters are entered
  useEffect(() => {
    if (ifscCode.length === 11) {
      handleIfscLookup(ifscCode);
    } else if (ifscCode.length < 11) {
      setBranchDetails(null);
    }
  }, [ifscCode]);

  const isFormValid = accountHolderName && bankName && accountNumber && confirmAccountNumber === accountNumber && ifscCode.length === 11;

  return (
    <div className="flex flex-col w-full text-left bg-[#F5F5F5] min-h-full pb-8">
      {/* Section Title */}
      <h2 className="mt-[19px] text-black font-bold text-[22px] leading-tight shrink-0">
        Bank Accounts
      </h2>

      {/* Verified Header */}
      <div className="flex items-start gap-[8px] mt-[20px]">
        <img src={simCardIcon} className="w-[24px] h-[24px] shrink-0" alt="SIM" />
        <div className="flex flex-col">
          <h3 className="text-black font-bold text-[16px] leading-[1.3]">
            SIM Verified <span className="text-black">{phoneNumber}</span>.
          </h3>
          <p className="font-medium text-[13px] text-black mt-[2px]">
            Please ensure that the bank account is linked to this phone number.
          </p>
        </div>
      </div>

      <div className="mt-[24px] flex flex-col gap-[18px] w-[362px]">
        {/* Account Holder Name */}
        <div className="flex flex-col gap-[6px]">
          <span className="text-black font-medium text-[14px]">Account Holder Name</span>
          <input 
            type="text"
            placeholder="e.g. John Doe"
            className="w-full h-[48px] border border-[#E9EAEB] rounded-full px-[16px] outline-none text-[15px] text-black bg-white"
            value={accountHolderName}
            onChange={(e) => setAccountHolderName(e.target.value)}
          />
        </div>

        {/* Bank Name with Autocomplete */}
        <div className="flex flex-col gap-[6px] relative">
          <span className="text-black font-medium text-[14px]">Bank Name</span>
          <div className="relative h-[48px] border border-[#E9EAEB] rounded-full bg-white flex items-center px-[16px]">
            {bankName && getBankLogo(bankName) && (
              <img src={getBankLogo(bankName)!} className="w-[24px] h-[24px] mr-2 object-contain" alt="" />
            )}
            <input 
              type="text"
              placeholder="e.g. HDFC Bank"
              className="flex-1 h-full outline-none text-[15px] text-black placeholder:text-[#999] bg-transparent"
              value={bankName}
              onChange={(e) => {
                setBankName(e.target.value);
                setShowBankDropdown(true);
              }}
              onFocus={() => setShowBankDropdown(true)}
            />
          </div>
          {showBankDropdown && filteredBanks.length > 0 && (
            <div className="absolute top-[78px] left-0 w-full bg-white border border-[#E9EAEB] rounded-[16px] z-50 shadow-lg overflow-hidden">
                {filteredBanks.map(name => (
                    <div 
                        key={name}
                        onClick={() => {
                            setBankName(name);
                            setShowBankDropdown(false);
                        }}
                        className="h-[48px] px-[16px] flex items-center gap-[12px] hover:bg-gray-50 cursor-pointer border-b border-[#F5F5F5] last:border-0"
                    >
                        <img src={getBankLogo(name)!} className="w-[24px] h-[24px] object-contain" alt="" />
                        <span className="text-[14px] font-medium text-black">{name}</span>
                    </div>
                ))}
            </div>
          )}
        </div>

        {/* Account Number */}
        <div className="flex flex-col gap-[6px]">
          <span className="text-black font-medium text-[14px]">Account Number</span>
          <input 
            type="password"
            placeholder="Enter account number"
            className="w-full h-[48px] border border-[#E9EAEB] rounded-full px-[16px] outline-none text-[15px] text-black bg-white"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
          />
        </div>

        {/* Confirm Account Number */}
        <div className="flex flex-col gap-[6px]">
          <span className="text-black font-medium text-[14px]">Confirm Account Number</span>
          <input 
            type="text"
            placeholder="Re-enter account number"
            className="w-full h-[48px] border border-[#E9EAEB] rounded-full px-[16px] outline-none text-[15px] text-black bg-white"
            value={confirmAccountNumber}
            onChange={(e) => setConfirmAccountNumber(e.target.value)}
          />
          {confirmAccountNumber && confirmAccountNumber !== accountNumber && (
            <span className="text-[#FF3B30] text-[12px] font-medium mt-1 ml-4">Account numbers do not match</span>
          )}
        </div>

        {/* IFSC Code */}
        <div className="flex flex-col gap-[6px]">
          <span className="text-black font-medium text-[14px]">IFSC Code</span>
          <div className="relative">
            <input 
                type="text"
                placeholder="IFSC0001234"
                maxLength={11}
                className="w-full h-[48px] border border-[#E9EAEB] rounded-full px-[16px] outline-none text-[15px] text-black bg-white uppercase"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
            />
            {isFindingBranch && (
              <div className="absolute right-[16px] top-[15px]">
                <div className="w-[18px] h-[18px] border-2 border-black/10 border-t-black rounded-full animate-spin" />
              </div>
            )}
          </div>
          {branchDetails && (
            <div className="mt-1 flex flex-col items-start gap-1 ml-4 transition-all animate-in fade-in slide-in-from-top-1">
                <span className="text-[#27AE60] text-[12px] font-bold">{branchDetails.branch}</span>
                <span className="text-[#A0A0A0] text-[11px] font-medium">{branchDetails.city}</span>
            </div>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-auto pt-[40px] mb-8 flex items-center justify-center">
        <button 
          onClick={() => isFormValid && !isSubmitting && onProceed({ accountHolderName, bankName, accountNumber, ifscCode })}
          disabled={!isFormValid || isSubmitting}
          className={`w-[362px] h-[48px] rounded-full font-medium text-[16px] flex items-center justify-center transition-colors ${
            isFormValid && !isSubmitting
              ? 'bg-black text-white active:scale-[0.98]' 
              : 'bg-[#DFDFDF] text-white cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-[20px] h-[20px] border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Verifying...</span>
            </div>
          ) : (
            'Verify & Link Account (₹1)'
          )}
        </button>
      </div>
    </div>
  );
};

export default ManualBankForm;
