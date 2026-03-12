/**
 * @file store/sessionStore.ts
 * @description Store de Zustand para gestionar el estado de la sesión del usuario usando Firebase Auth.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createSQLiteStorage } from '@/utils/sqliteStorage';
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

const sqliteStorage = createSQLiteStorage('session_v1.db');

export const useSessionStore = create<SessionState>()(
    persist(
        (set) => ({
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
        }),
        {
            name: 'session-storage',
            storage: createJSONStorage(() => sqliteStorage),
            partialize: (state) => ({ 
                account: state.account, 
                subscription: state.subscription 
            } as any),
        }
    )
);



