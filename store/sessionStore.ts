/**
 * @file store/sessionStore.ts
 * @description Store de Zustand para gestionar el estado de la sesión del usuario.
 * No persiste localmente — depende del caché offline de Firestore para datos del perfil
 * y de Firebase Auth para el estado de autenticación.
 */

import { create } from 'zustand';
import { getAuth, signOut } from '@react-native-firebase/auth';
import type { ColmadoAccountInfo, Subscription } from '@/types';

interface SessionState {
    account: Omit<ColmadoAccountInfo, 'clients'> | null;
    subscription: Subscription;
    referralCode: string;
    referralCount: number;
    referralCredits: number;
    isInitialized: boolean;
    lastSyncTimestamp: number;

    setAccount: (account: Omit<ColmadoAccountInfo, 'clients'> | null) => void;
    setSubscription: (subscription: Subscription) => void;
    setReferralCode: (code: string) => void;
    setReferralCount: (count: number) => void;
    setReferralCredits: (credits: number) => void;
    setInitialized: (val: boolean) => void;
    setSyncTimestamp: (timestamp: number) => void;

    logout: () => Promise<void>;
}

export const useSessionStore = create<SessionState>((set) => ({
    account: null,
    subscription: { status: 'loading', plan: 'none' },
    referralCode: '',
    referralCount: 0,
    referralCredits: 0,
    isInitialized: false,
    lastSyncTimestamp: 0,

    setAccount: (account) => set({ account }),
    setSubscription: (subscription) => set({ subscription }),
    setReferralCode: (code) => set({ referralCode: code }),
    setReferralCount: (count) => set({ referralCount: count }),
    setReferralCredits: (credits) => set({ referralCredits: credits }),
    setInitialized: (val) => set({ isInitialized: val }),
    setSyncTimestamp: (timestamp) => set({ lastSyncTimestamp: timestamp }),

    logout: async () => {
        try {
            const auth = getAuth();
            await signOut(auth);
            set({ account: null, subscription: { status: 'loading', plan: 'none' }, referralCode: '', referralCount: 0, referralCredits: 0 });
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            throw error;
        }
    },
}));
