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
    isInitialized: boolean;

    setAccount: (account: Omit<ColmadoAccountInfo, 'clients'> | null) => void;
    setSubscription: (subscription: Subscription) => void;
    setInitialized: (val: boolean) => void;

    logout: () => Promise<void>;
}

export const useSessionStore = create<SessionState>((set) => ({
    account: null,
    subscription: { status: 'loading', plan: 'none' },
    isInitialized: false,

    setAccount: (account) => set({ account }),
    setSubscription: (subscription) => set({ subscription }),
    setInitialized: (val) => set({ isInitialized: val }),

    logout: async () => {
        try {
            const auth = getAuth();
            await signOut(auth);
            set({ account: null, subscription: { status: 'loading', plan: 'none' } });
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            throw error;
        }
    },
}));
