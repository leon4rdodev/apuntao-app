/**
 * @file store/sessionStore.ts
 * @description Store de Zustand para gestionar el estado de la sesión del usuario.
 * Carga el estado inicial de la cuenta desde el almacenamiento para una experiencia de usuario más rápida.
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

    /** ✅ Nueva acción para cargar el estado inicial desde el almacenamiento. */
    initializeSessionFromStorage: () => Promise<void>;

    /** Sincroniza los datos de la cuenta con el backend y devuelve los datos completos. */
    syncAccountData: () => Promise<
        { accountData: Omit<ColmadoAccountInfo, 'clients'>; clients: Client[] } | undefined
    >;

    logout: () => Promise<void>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
    account: null,
    subscription: { status: 'loading', plan: 'none' },
    isInitialized: false,

    setAccount: (account) => set({ account }),
    setSubscription: (subscription) => set({ subscription }),

    // ✅ --- NUEVA FUNCIÓN DE INICIALIZACIÓN ---
    /**
     * Carga el perfil de la cuenta desde AsyncStorage al iniciar la app.
     * Esto permite mostrar la información del usuario inmediatamente mientras se
     * sincronizan los datos más recientes en segundo plano.
     */
    initializeSessionFromStorage: async () => {
        try {
            const storedAccount = await getFromStorage<Omit<ColmadoAccountInfo, 'clients'>>(
                STORAGE_KEYS.ACCOUNT_INFO
            );
            if (storedAccount) {
                // Si encontramos datos guardados, los ponemos en el estado.
                set({
                    account: storedAccount,
                    subscription: storedAccount.subscription,
                });
            }
        } catch (error) {
            console.error('No se pudo cargar la sesión desde el almacenamiento:', error);
        } finally {
            // Marcamos como inicializado independientemente del resultado.
            // La sincronización posterior corregirá cualquier dato desactualizado.
            set({ isInitialized: true });
        }
    },

    syncAccountData: async () => {
        try {
            // Hacemos las dos peticiones en paralelo para más eficiencia
            const [accountInfo, syncData] = await Promise.all([
                apiFetch(API_URLS.ACCOUNT_PROFILE),
                apiFetch(API_URLS.DATA_SYNC),
            ]);

            const accountData: Omit<ColmadoAccountInfo, 'clients'> = {
                ...accountInfo,
                subscription: syncData.subscription,
            };

            // Actualizamos el estado en memoria
            set({
                account: accountData,
                subscription: accountData.subscription,
            });
            // ✅ Guardamos la información actualizada en el almacenamiento para la próxima vez
            await saveToStorage(STORAGE_KEYS.ACCOUNT_INFO, accountData);

            // Retornamos los datos completos para que los contextos los usen
            return { accountData, clients: syncData.clients || [] };
        } catch (error: any) {
            console.error('Fallo al sincronizar datos de la cuenta:', error);
            
            // 🔥 CAMBIO CRÍTICO: No hacer logout si falla la sincronización.
            // Si es un error de autenticación (401), el apiService ya habrá manejado el logout.
            // Si es error de red u otro, permitimos que el usuario siga usando la app offline.
            
            // Opcional: Notificar al usuario (aunque el SyncIndicator ya lo hace)
            // useNotificationStore.getState().show({ message: 'Modo offline activado', type: 'info' });

            return undefined;
        }
    },

    logout: async () => {
        // Limpiamos tanto el estado en memoria como el almacenamiento persistente
        set({ account: null, subscription: { status: 'unknown', plan: 'none' } });
        await saveToStorage(STORAGE_KEYS.ACCOUNT_INFO, null); // Borrar el perfil guardado
        await apiLogout(); // Llama a la función de logout del apiService
    },
}));
