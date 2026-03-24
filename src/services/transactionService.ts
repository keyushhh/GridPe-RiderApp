import { Transaction } from "../components/TransactionDetailBottomSheet";

const STORAGE_KEY = 'gridpe_transactions_v2';

const initialTransactions: Transaction[] = [];

class TransactionService {
  private transactions: Transaction[] = [];
  private listeners: ((tx: Transaction) => void)[] = [];

  constructor() {
    this.loadTransactions();
  }

  private loadTransactions() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      this.transactions = JSON.parse(saved);
    } else {
      this.transactions = initialTransactions;
      this.saveTransactions();
    }
  }

  private saveTransactions() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.transactions));
  }

  public getTransactions(): Transaction[] {
    return this.transactions;
  }

  public addTransaction(tx: Omit<Transaction, 'id'>) {
    const newTx: Transaction = {
      ...tx,
      id: Date.now(),
    };
    this.transactions = [newTx, ...this.transactions];
    this.saveTransactions();
    
    // Notify listeners
    this.listeners.forEach(listener => listener(newTx));
    
    // Dispatch global event for hooks
    window.dispatchEvent(new CustomEvent('new-transaction', { detail: newTx }));
  }

  public onNewTransaction(callback: (tx: Transaction) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }
}

export const transactionService = new TransactionService();
