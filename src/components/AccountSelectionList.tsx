import React, { useState, useMemo } from 'react';
import { getBankLogo, BANK_SLUG_MAP as BANK_LOGO_MAP } from '../utils/BankLogoMap';
import searchIcon from '../assets/search.svg';
import bankBuildingIcon from '../assets/bank.svg';
import radioSelected from '../assets/radio-selected.svg';
import radioNotSelected from '../assets/radio-not-selected.svg';

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber?: string; // Optional for search results
  isPlaceholder?: boolean; // True if it's from search results
}

interface AccountSelectionListProps {
  phoneNumber: string;
  addedBankNames: string[];
  onSelect: (account: BankAccount) => void;
  onProceed: (account: BankAccount) => void;
}

const LetterAvatar = ({ name }: { name: string }) => {
  const firstLetter = name.charAt(0).toUpperCase();
  // Generate a consistent color based on the name
  const colors = ['#5260FE', '#27AE60', '#F2994A', '#EB5757', '#9B51E0'];
  const colorIndex = name.length % colors.length;
  const bgColor = colors[colorIndex];

  return (
    <div 
      className="w-[40px] h-[40px] rounded-full flex items-center justify-center text-white font-bold text-[18px]"
      style={{ backgroundColor: bgColor }}
    >
      {firstLetter}
    </div>
  );
};

const AccountSelectionList: React.FC<AccountSelectionListProps> = ({ phoneNumber, addedBankNames, onSelect, onProceed }) => {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock initial accounts retrieved
  const initialAccounts: BankAccount[] = [
    { id: '1', bankName: 'HDFC Bank', accountNumber: 'XXXX 1234' },
    { id: '2', bankName: 'IDFC FIRST Bank', accountNumber: 'XXXX 5678' },
    { id: '3', bankName: 'Axis Bank', accountNumber: 'XXXX 9012' },
    { id: '4', bankName: 'Kotak Mahindra Bank', accountNumber: 'XXXX 3456' },
  ];

  const displayedAccounts = useMemo(() => {
    if (!searchQuery.trim()) return initialAccounts;

    const query = searchQuery.toLowerCase();
    
    // 1. Filter initial accounts
    const filteredInitial = initialAccounts.filter(acc => 
      acc.bankName.toLowerCase().includes(query)
    );

    // 2. Search in all possible banks from map
    const otherBanks = Object.keys(BANK_LOGO_MAP)
      .filter(name => {
        const matchesQuery = name.toLowerCase().includes(query);
        const alreadyInInitial = initialAccounts.some(acc => acc.bankName.toLowerCase() === name.toLowerCase());
        return matchesQuery && !alreadyInInitial;
      })
      .map(name => ({
        id: `search-${name}`,
        bankName: name,
        isPlaceholder: true
      }));

    // Deduplicate names (e.g. "State Bank of India" vs "SBI" if both match)
    const uniqueOtherBanks: BankAccount[] = [];
    const seenNormalized = new Set();
    
    [...filteredInitial, ...otherBanks].forEach(bank => {
      const normalized = bank.bankName.toLowerCase().replace(/\s+/g, '');
      if (!seenNormalized.has(normalized)) {
        seenNormalized.add(normalized);
        uniqueOtherBanks.push(bank);
      }
    });

    return uniqueOtherBanks;
  }, [searchQuery]);

  const handleSelect = (account: BankAccount) => {
    // If already added, we might want to prevent re-selection for adding
    const isAlreadyAdded = addedBankNames.some(name => name.toLowerCase() === account.bankName.toLowerCase());
    if (isAlreadyAdded) return;
    
    setSelectedAccountId(account.id);
    onSelect(account);
  };

  const selectedAccount = displayedAccounts.find(acc => acc.id === selectedAccountId);

  return (
    <div className="flex flex-col w-full text-left bg-[#F5F5F5] min-h-full">
      {/* Section Title */}
      <h2 className="mt-[19px] text-black font-bold text-[22px] leading-tight shrink-0">
        Bank Accounts
      </h2>

      {/* Found Accounts Header */}
      <div className="flex items-start gap-[12px] mt-[18px]">
        <img src={bankBuildingIcon} className="w-[24px] h-[24px] mt-[2px]" alt="Bank" />
        <h3 className="text-black font-bold text-[18px] leading-[1.2]">
          We’ve found a few bank accounts linked to {phoneNumber}
        </h3>
      </div>

      {/* Description */}
      <p className="text-[#A0A0A0] font-medium text-[14px] leading-tight mt-[18px]">
        Select your Primary Bank Account, if not, then you may search for a different bank account to link it.
      </p>

      {/* Search Bar */}
      <div className="mt-[24px] relative w-[362px] h-[48px] border-[1px] border-[#E9EAEB] rounded-[10px] flex items-center px-[12px] bg-white">
        <input 
          type="text"
          placeholder="Search"
          className="flex-1 h-full outline-none text-[15px] text-black placeholder:text-[#999] bg-transparent"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <img src={searchIcon} className="w-[20px] h-[20px]" alt="Search" />
      </div>

      {/* Bank Selection Grid */}
      <div className="mt-[24px] grid grid-cols-2 gap-[12px] w-[362px]">
        {displayedAccounts.map((acc) => {
          const logoUrl = getBankLogo(acc.bankName);
          const isAlreadyAdded = addedBankNames.some(name => name.toLowerCase() === acc.bankName.toLowerCase());
          const isSelected = selectedAccountId === acc.id;

          return (
            <div 
              key={acc.id}
              onClick={() => handleSelect(acc)}
              className={`w-full h-[104px] border-[1.5px] rounded-[12px] p-[12px] flex flex-col justify-between cursor-pointer transition-all ${
                isSelected ? 'border-[#5260FE] bg-[#F9FAFF]' : 'border-[#E9EAEB] bg-white'
              } ${isAlreadyAdded ? 'opacity-80 cursor-default' : ''}`}
            >
              <div className="flex justify-between items-start">
                <div className="w-[36px] h-[36px] flex items-center justify-center overflow-hidden">
                  {logoUrl ? (
                    <img src={logoUrl} className="w-full h-full object-contain" alt="" />
                  ) : (
                    <LetterAvatar name={acc.bankName} />
                  )}
                </div>
                {isAlreadyAdded ? (
                  <div className="w-[20px] h-[20px] bg-[#27AE60] rounded-full flex items-center justify-center">
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5L4 8L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                ) : (
                  <img 
                    src={isSelected ? radioSelected : radioNotSelected} 
                    className="w-[20px] h-[20px]" 
                    alt="Select" 
                  />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-black font-bold text-[14px] leading-tight truncate px-1">{acc.bankName}</span>
                {isAlreadyAdded && (
                  <span className="text-[#A0A0A0] font-medium italic text-[12px] leading-none mt-1 px-1">Already added</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State / No search results */}
      {displayedAccounts.length === 0 && (
        <div className="py-[40px] flex flex-col items-center justify-center text-[#999]">
          <p className="text-[14px]">No bank accounts found for "{searchQuery}"</p>
        </div>
      )}

      {/* Fixed Proceed Button */}
      <div className="mt-auto pt-[40px] mb-8 flex items-center justify-center">
        <button 
          onClick={() => selectedAccount && onProceed(selectedAccount)}
          disabled={!selectedAccountId}
          className={`w-[362px] h-[48px] rounded-full font-medium text-[16px] flex items-center justify-center transition-colors ${
            selectedAccountId 
              ? 'bg-black text-white active:scale-[0.98]' 
              : 'bg-[#DFDFDF] text-white cursor-not-allowed'
          }`}
        >
          Proceed
        </button>
      </div>
    </div>
  );
};

export default AccountSelectionList;
