import { create } from 'zustand';
import { Match } from '@spark/types';

interface MatchState {
  matches: Match[];
  unreadCounts: Record<string, number>;
  setMatches: (matches: Match[]) => void;
  addMatch: (match: Match) => void;
  updateUnreadCount: (matchId: string, count: number) => void;
  markAsRead: (matchId: string) => void;
}

export const useMatchStore = create<MatchState>((set, get) => ({
  matches: [],
  unreadCounts: {},
  setMatches: (matches) => set({ matches }),
  addMatch: (match) => {
    const current = get().matches;
    set({ matches: [match, ...current] });
  },
  updateUnreadCount: (matchId, count) => {
    const current = get().unreadCounts;
    set({ unreadCounts: { ...current, [matchId]: count } });
  },
  markAsRead: (matchId) => {
    const current = get().unreadCounts;
    set({ unreadCounts: { ...current, [matchId]: 0 } });
  },
}));