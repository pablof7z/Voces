import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FollowPacksStore {
  subscribedPacks: string[]; // Array of pack IDs
  favoritesPacks: string[]; // Array of favorite pack IDs
  userCreatedPacks: string[]; // Array of pack IDs created by the user

  subscribeToPack: (packId: string) => void;
  unsubscribeFromPack: (packId: string) => void;
  toggleFavorite: (packId: string) => void;
  addUserPack: (packId: string) => void;
  removeUserPack: (packId: string) => void;
  isSubscribed: (packId: string) => boolean;
  isFavorite: (packId: string) => boolean;
}

export const useFollowPacksStore = create<FollowPacksStore>()(
  persist(
    (set, get) => ({
      subscribedPacks: [],
      favoritesPacks: [],
      userCreatedPacks: [],

      subscribeToPack: (packId) =>
        set((state) => ({
          subscribedPacks: [...new Set([...state.subscribedPacks, packId])]
        })),

      unsubscribeFromPack: (packId) =>
        set((state) => ({
          subscribedPacks: state.subscribedPacks.filter(id => id !== packId)
        })),

      toggleFavorite: (packId) =>
        set((state) => ({
          favoritesPacks: state.favoritesPacks.includes(packId)
            ? state.favoritesPacks.filter(id => id !== packId)
            : [...state.favoritesPacks, packId]
        })),

      addUserPack: (packId) =>
        set((state) => ({
          userCreatedPacks: [...new Set([...state.userCreatedPacks, packId])]
        })),

      removeUserPack: (packId) =>
        set((state) => ({
          userCreatedPacks: state.userCreatedPacks.filter(id => id !== packId)
        })),

      isSubscribed: (packId) => get().subscribedPacks.includes(packId),
      isFavorite: (packId) => get().favoritesPacks.includes(packId),
    }),
    {
      name: 'follow-packs-storage',
    }
  )
);