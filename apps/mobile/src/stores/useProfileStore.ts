import { create } from 'zustand';
import { Profile } from '@spark/types';

interface ProfileState {
  profile: Profile | null;
  quizCompletion: number;
  setProfile: (profile: Profile | null) => void;
  setQuizCompletion: (completion: number) => void;
  updateProfile: (updates: Partial<Profile>) => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  quizCompletion: 0,
  setProfile: (profile) => set({ profile }),
  setQuizCompletion: (quizCompletion) => set({ quizCompletion }),
  updateProfile: (updates) => {
    const current = get().profile;
    if (current) {
      set({ profile: { ...current, ...updates } });
    }
  },
}));