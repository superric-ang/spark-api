import { create } from 'zustand';
import { DiscoveryCandidate } from '@spark/types';

interface DiscoveryState {
  stack: DiscoveryCandidate[];
  currentIndex: number;
  engineWeights: { flow: number; depth: number };
  loading: boolean;
  setStack: (stack: DiscoveryCandidate[]) => void;
  setCurrentIndex: (index: number) => void;
  setEngineWeights: (weights: { flow: number; depth: number }) => void;
  setLoading: (loading: boolean) => void;
  nextCard: () => void;
  resetStack: () => void;
}

export const useDiscoveryStore = create<DiscoveryState>((set, get) => ({
  stack: [],
  currentIndex: 0,
  engineWeights: { flow: 0.5, depth: 0.5 },
  loading: false,
  setStack: (stack) => set({ stack, currentIndex: 0 }),
  setCurrentIndex: (currentIndex) => set({ currentIndex }),
  setEngineWeights: (engineWeights) => set({ engineWeights }),
  setLoading: (loading) => set({ loading }),
  nextCard: () => {
    const { currentIndex, stack } = get();
    if (currentIndex < stack.length - 1) {
      set({ currentIndex: currentIndex + 1 });
    }
  },
  resetStack: () => set({ stack: [], currentIndex: 0 }),
}));