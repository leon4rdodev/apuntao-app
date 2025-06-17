/**
 * @file store/sessionStore.ts
 * @description Store de Zustand para gestionar el estado de la sesión del usuario (cuenta del colmado).
 */

import { create } from 'zustand';
import { API_URLS, STORAGE_KEYS } from '@/constants';
import { apiFetch, logout as apiLogout } from '@/services/apiService';
// ✅ CORRECCIÓN: Se añade 'Client' a la importación de tipos.
import type { AppSessionData, Client, ColmadoAccountInfo, Subscription } from '@/types';
import { getFromStorage, saveToStorage } from '@/utils/storage';

interface SessionState {
    /** El perfil del colmado (sin la lista de clientes). Null si no hay sesión. */
    account: Omit<ColmadoAccountInfo, 'clients'> | null;
    /** El estado de la suscripción de la cuenta. */
    subscription: Subscription;
    /** Indica si el store ha intentado cargar la sesión inicial desde el storage. */
    isInitialized: boolean;

    setAccount: (account: Omit<ColmadoAccountInfo, 'clients'> | null) => void;
    setSubscription: (subscription: Subscription) => void;
    initializeSession: () => Promise<void>;
    
    /** Sincroniza los datos de la cuenta y devuelve tanto el perfil como los clientes. */
    syncAccountData: () => Promise<{ accountData: Omit<ColmadoAccountInfo, 'clients'>; clients: Client[] } | undefined>;
    
    /** Inicia sesión, guarda tokens y llama a syncAccountData. */
    login: (sessionData: AppSessionData) => Promise<{ accountData: Omit<ColmadoAccountInfo, 'clients'>; clients: Client[] } | undefined>;

    logout: () => Promise<void>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
    account: null,
    subscription: { status: 'loading', plan: 'none' },
    isInitialized: false,

    setAccount: (account) => set({ account }),
    setSubscription: (subscription) => set({ subscription }),

    initializeSession: async () => {
        if (get().isInitialized) return;
        try {
            const storedAccount = await getFromStorage<Omit<ColmadoAccountInfo, 'clients'>>(
                STORAGE_KEYS.ACCOUNT_INFO
            );
            if (storedAccount) {
                set({
                    account: storedAccount,
                    subscription: storedAccount.subscription,
                    isInitialized: true,
                });
            } else {
                set({ isInitialized: true, account: null });
            }
        } catch (error) {
            console.error('Error al inicializar la sesión:', error);
            set({ isInitialized: true, account: null, subscription: { status: 'unknown', plan: 'none' } });
        }
    },

    syncAccountData: async () => {
        try {
            const accountInfo = await apiFetch(API_URLS.ACCOUNT_PROFILE);
            const syncData = await apiFetch(API_URLS.DATA_SYNC);

            const accountData: Omit<ColmadoAccountInfo, 'clients'> = {
                ...accountInfo,
                subscription: syncData.subscription,
            };

            set({ account: accountData, subscription: accountData.subscription });
            await saveToStorage(STORAGE_KEYS.ACCOUNT_INFO, accountData);
            
            return { accountData, clients: syncData.clients };
        } catch (error) {
            console.error('Fallo al sincronizar datos de la cuenta:', error);
            return undefined;
        }
    },

    login: async (sessionData: AppSessionData) => {
        await saveToStorage(STORAGE_KEYS.APP_SESSION, sessionData);
        return await get().syncAccountData();
    },

    logout: async () => {
        set({ account: null, subscription: { status: 'unknown', plan: 'none' } });
        await apiLogout();
    },
}));