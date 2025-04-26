import React, { createContext, useState, useCallback } from 'react';
import { Bill } from '../types/bill';

interface AppContextType {
  pinnedBills: Bill[];
  addPinnedBill: (bill: Bill) => void;
  removePinnedBill: (billId: string) => void;
}

export const AppContext = createContext<AppContextType>({
  pinnedBills: [],
  addPinnedBill: () => {},
  removePinnedBill: () => {}
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pinnedBills, setPinnedBills] = useState<Bill[]>([]);

  const addPinnedBill = useCallback((bill: Bill) => {
    setPinnedBills(prev => {
      const billId = `${bill.billType}${bill.billNumber}`;
      if (!prev.find(b => `${b.billType}${b.billNumber}` === billId)) {
        return [...prev, bill];
      }
      return prev;
    });
  }, []);

  const removePinnedBill = useCallback((billId: string) => {
    setPinnedBills(prev => prev.filter(bill => `${bill.billType}${bill.billNumber}` !== billId));
  }, []);

  return (
    <AppContext.Provider value={{ pinnedBills, addPinnedBill, removePinnedBill }}>
      {children}
    </AppContext.Provider>
  );
}; 