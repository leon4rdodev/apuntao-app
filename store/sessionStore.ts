/**
 * @file store/sessionStore.ts
 * @description Store de Zustand para gestionar el estado de la sesión del usuario usando Firebase Auth.
 */

import { create } from 'zustand';
import auth from '@react-native-firebase/auth';
import type { ColmadoAccountInfo, Subscription } from '@/types';

interface SessionState {
    /** El perfil del colmado (sin la lista de clientes). Null si no hay sesión. */
    account: Omit<ColmadoAccountInfo, 'clients'> | null;
    /** El estado de la suscripción de la cuenta. */
    subscription: Subscription;
    /** Indica si el store ha intentado cargar la sesión inicial desde Firebase. */
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
            await auth().signOut();
            set({ account: null, subscription: { status: 'loading', plan: 'none' } });
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            throw error;
        }
    },
}));
