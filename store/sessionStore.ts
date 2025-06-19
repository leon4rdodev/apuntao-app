/**
 * @file store/sessionStore.ts
 * @description Store de Zustand para gestionar el estado de la sesión del usuario (cuenta del colmado).
 */

import { create } from 'zustand';
import { API_URLS, STORAGE_KEYS } from '@/constants';
import { apiFetch, logout as apiLogout } from '@/services/apiService';
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

    /** Sincroniza los datos de la cuenta y devuelve tanto el perfil como los clientes. */
    syncAccountData: () => Promise<
        { accountData: Omit<ColmadoAccountInfo, 'clients'>; clients: Client[] } | undefined
    >;

    logout: () => Promise<void>;
}

export const useSessionStore = create<SessionState>((set) => ({
    account: null,
    subscription: { status: 'loading', plan: 'none' },
    isInitialized: false,

    setAccount: (account) => set({ account }),
    setSubscription: (subscription) => set({ subscription }),

    syncAccountData: async () => {
        try {
            // Hacemos las dos peticiones en paralelo para más eficiencia
            const [accountInfo, syncData] = await Promise.all([
                apiFetch(API_URLS.ACCOUNT_PROFILE),
                apiFetch(API_URLS.DATA_SYNC),
            ]);

            // Combinamos la información
            const accountData: Omit<ColmadoAccountInfo, 'clients'> = {
                ...accountInfo,
                subscription: syncData.subscription,
            };

            set({
                account: accountData,
                subscription: accountData.subscription,
                isInitialized: true,
            });
            await saveToStorage(STORAGE_KEYS.ACCOUNT_INFO, accountData);

            // Retornamos los datos completos para que los contextos los usen
            return { accountData, clients: syncData.clients || [] };
        } catch (error) {
            console.error('Fallo al sincronizar datos de la cuenta:', error);
            // Si falla la sincronización, es probable que la sesión sea inválida
            await apiLogout();
            return undefined;
        }
    },

    logout: async () => {
        set({ account: null, subscription: { status: 'unknown', plan: 'none' } });
        await apiLogout();
    },
}));
