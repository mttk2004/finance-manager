import { create } from 'zustand';
import { Fund } from '@/types';

interface DashboardState {
  activeFund: Fund | null;
  setActiveFund: (fund: Fund) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  activeFund: null,
  setActiveFund: (fund) => set({ activeFund: fund }),
}));
