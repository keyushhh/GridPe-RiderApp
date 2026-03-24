import { useState, useEffect } from 'react';
import { transactionService } from '../services/transactionService';
import { Transaction } from '../components/TransactionDetailBottomSheet';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(transactionService.getTransactions());

  useEffect(() => {
    const handleNewTx = () => {
      setTransactions([...transactionService.getTransactions()]);
    };

    window.addEventListener('new-transaction', handleNewTx);
    return () => window.removeEventListener('new-transaction', handleNewTx);
  }, []);

  return transactions;
};
